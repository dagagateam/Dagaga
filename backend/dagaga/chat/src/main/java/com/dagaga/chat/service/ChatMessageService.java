package com.dagaga.chat.service;

import com.dagaga.chat.dto.MessageServiceDto.SaveMessageCommand;
import com.dagaga.chat.dto.MessageServiceDto.SaveMessageResult;
import com.dagaga.chat.dto.MessageServiceDto.ChatMessageResult;
import com.dagaga.chat.dto.MessageServiceDto.TargetedMessageResult;
import java.util.ArrayList;
import com.dagaga.domain.chat.language.repository.LanguageRepository;
import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.entity.MessageTranslation;
import com.dagaga.domain.chat.message.repository.ChatMessageRepository;
import com.dagaga.domain.chat.translate.port.TranslationPort;
import com.dagaga.domain.chat.translate.port.TranslationResult;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dagaga.chat.dto.ChatMessageResponse;
import org.springframework.data.domain.PageRequest;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Set;
import java.util.Map;
import java.util.function.Function;
import java.util.concurrent.Executor;

import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.beans.factory.annotation.Qualifier;

@Slf4j
@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final LanguageRepository languageRepository;
    private final TranslationPort translationPort;
    private final ChatRoomService chatRoomService;
    private final TransactionTemplate transactionTemplate;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final Executor translationExecutor;

    public ChatMessageService(ChatMessageRepository chatMessageRepository,
            LanguageRepository languageRepository,
            TranslationPort translationPort,
            ChatRoomService chatRoomService,
            TransactionTemplate transactionTemplate,
            UserRepository userRepository,
            ApplicationEventPublisher eventPublisher,
            @Qualifier("translationExecutor") Executor translationExecutor) {
        this.chatMessageRepository = chatMessageRepository;
        this.languageRepository = languageRepository;
        this.translationPort = translationPort;
        this.chatRoomService = chatRoomService;
        this.transactionTemplate = transactionTemplate;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
        this.translationExecutor = translationExecutor;
    }

    public SaveMessageResult save(SaveMessageCommand cmd) {

        // 순서: 메시지 생성 -> 번역 -> 번역본 추가 -> 원본+번역본 저장

        // 원본 메시지 저장 (트랜잭션)
        ChatMessage msg = transactionTemplate.execute(status -> {
            ChatMessage newMsg = ChatMessage.create(
                    cmd.roomId(),
                    cmd.senderId(),
                    cmd.originalText(),
                    cmd.originalLang());
            return chatMessageRepository.save(newMsg);
        });

        if (msg == null) {
            throw new RuntimeException("메시지 저장 실패");
        }

        // 번역 및 언어 감지
        List<String> targetLangs = languageRepository.findAllActiveLangCodes();
        if (!targetLangs.isEmpty()) {
            try {
                log.info("Detecting and translating text: {}", cmd.originalText());
                var translationResult = translationPort.detectAndTranslate(cmd.originalText(), targetLangs);

                // 번역 결과 업데이트
                transactionTemplate.executeWithoutResult(status -> saveTranslations(msg.getMessageId(), translationResult));
                
            } catch (Exception e) {
                log.error("메시지 번역 처리 중 오류가 발생했습니다.", e);
            }
        }
        
        // 최종 상태 조회를 위해 다시 로드 (번역이 추가되었을 수 있으므로)
        // 트랜잭션 내에서 조회하여 지연 로딩 문제 방지
        return transactionTemplate.execute(status -> {
            ChatMessage finalMsg = chatMessageRepository.findById(msg.getMessageId()).orElse(msg);
            // 지연 로딩 초기화
            finalMsg.getTranslations().size(); 
            return new SaveMessageResult(finalMsg, finalMsg.getTranslations());
        });
    }

    private void saveTranslations(Long messageId, TranslationResult result) {
        ChatMessage msg = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("메시지를 찾을 수 없습니다."));

        String detectedLang = result.getDetectedLanguage();
        log.info("Detected language: {}", detectedLang);

        // 감지된 언어로 원본 언어 설정
        if (detectedLang != null && !detectedLang.equals("unknown")) {
            msg.setOriginalLang(detectedLang);
        }

        // 번역본 추가
        result.getTranslations().forEach((lang, translatedText) -> {
            // 원본 언어와 같은 번역본은 제외
            if (!lang.equalsIgnoreCase(msg.getOriginalLang())) {
                MessageTranslation translation = MessageTranslation.create(msg, lang, translatedText);
                msg.addTranslation(translation);
            }
        });

    }

    public void saveAndPublish(SaveMessageCommand cmd, Integer locationId) {
        // 사용자 조회
        User sender = userRepository.findById(cmd.senderId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 지역 검증
        chatRoomService.getRoomAndValidateLocation(cmd.roomId(), locationId);

        // 원본 메시지 저장
        ChatMessage savedMsg = transactionTemplate.execute(status -> {
            ChatMessage newMsg = ChatMessage.create(
                    cmd.roomId(),
                    cmd.senderId(),
                    cmd.originalText(),
                    cmd.originalLang());
            return chatMessageRepository.save(newMsg);
        });

        if (savedMsg == null) throw new RuntimeException("메시지 저장 실패");

        // 원본 메시지 이벤트 발행
        ChatMessageResult originalPayload = new ChatMessageResult(
                savedMsg.getMessageId(),
                savedMsg.getRoomId(),
                savedMsg.getSenderId(),
                sender.getNickname(),
                sender.getProfileImage(),
                savedMsg.getOriginalText(),
                savedMsg.getOriginalText(),
                savedMsg.getOriginalLang(),
                savedMsg.getSentAt().toString(),
                "TALK");

        TargetedMessageResult originalResult = new TargetedMessageResult(savedMsg.getOriginalLang(), originalPayload);
        eventPublisher.publishEvent(new com.dagaga.chat.event.ChatEvents.MessageSavedEvent(originalResult, savedMsg.getOriginalText(), savedMsg.getRoomId()));

        // 비동기 번역 및 후속 처리
        translationExecutor.execute(() -> processTranslationAndPublish(savedMsg, sender));
    }

    private void processTranslationAndPublish(ChatMessage msg, User sender) {
        List<String> targetLangs = languageRepository.findAllActiveLangCodes();
        if (targetLangs.isEmpty()) return;

        try {
            // 번역 수행
            TranslationResult translationResult = translationPort.detectAndTranslate(msg.getOriginalText(), targetLangs);

            // 번역 저장 (트랜잭션)
            transactionTemplate.executeWithoutResult(status -> saveTranslations(msg.getMessageId(), translationResult));
            
            ChatMessage updatedMsg = chatMessageRepository.findById(msg.getMessageId()).orElse(msg);

            // 번역 결과 이벤트 발행
            List<TargetedMessageResult> translatedResults = new ArrayList<>();
            translationResult.getTranslations().forEach((lang, translatedText) -> {
                // 원본 언어(감지된 언어)와 같으면 제외
                if (!lang.equalsIgnoreCase(updatedMsg.getOriginalLang())) {
                    ChatMessageResult translatedPayload = new ChatMessageResult(
                            updatedMsg.getMessageId(),
                            updatedMsg.getRoomId(),
                            updatedMsg.getSenderId(),
                            sender.getNickname(),
                            sender.getProfileImage(),
                            translatedText,
                            updatedMsg.getOriginalText(),
                            updatedMsg.getOriginalLang(),
                            updatedMsg.getSentAt().toString(),
                            "TALK");
                    translatedResults.add(new TargetedMessageResult(lang, translatedPayload));
                }
            });

            if (!translatedResults.isEmpty()) {
                eventPublisher.publishEvent(new com.dagaga.chat.event.ChatEvents.TranslationCompletedEvent(translatedResults, updatedMsg.getRoomId()));
            }

        } catch (Exception e) {
            log.error("비동기 번역 처리 중 오류 발생", e);
        }
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(int roomId, int userLocationId, String userNativeLangCode, Long cursor, int size) {
        // 지역 검증
        chatRoomService.getRoomAndValidateLocation(roomId, userLocationId);

        // 메시지 조회
        PageRequest page = PageRequest.of(0, Math.min(size, 100));
        List<ChatMessage> messages;

        if (cursor == null) {
            messages = chatMessageRepository.findByRoomIdOrderByMessageIdDesc(roomId, page);
        } else {
            messages = chatMessageRepository.findByRoomIdAndMessageIdLessThanOrderByMessageIdDesc(roomId, cursor, page);
        }

        // 발신자 정보 조회를 위한 ID 목록 수집
        Set<Integer> senderIds = messages.stream()
                .map(ChatMessage::getSenderId)
                .collect(Collectors.toSet());

        // 사용자 정보 일괄 조회
        Map<Integer, User> userMap = userRepository.findAllById(senderIds).stream()
                .collect(Collectors.toMap(User::getUserId, Function.identity()));

        // 언어에 맞게 변환
        return messages.stream()
                .map(msg -> {
                    boolean isTranslated = false;
                    String content = msg.getOriginalText();

                    // 원문 언어가 사용자의 모국어와 다르고, 원문 언어가 unknown이 아니면 번역본 찾기
                    if (!msg.getOriginalLang().equalsIgnoreCase(userNativeLangCode) 
                            && !"unknown".equalsIgnoreCase(msg.getOriginalLang())) {
                        String translatedText = msg.getTranslations().stream()
                                .filter(t -> t.getTargetLang().equalsIgnoreCase(userNativeLangCode))
                                .map(MessageTranslation::getTranslatedText)
                                .findFirst()
                                .orElse(null);
                        
                        // 번역본이 있으면 사용
                        if (translatedText != null) {
                            content = translatedText;
                            isTranslated = true;
                        }
                    }

                    User sender = userMap.get(msg.getSenderId());
                    String senderNickname = (sender != null) ? sender.getNickname() : "Unknown";
                    String senderProfileImage = (sender != null) ? sender.getProfileImage() : null;

                    return ChatMessageResponse.from(msg, content, isTranslated, senderNickname, senderProfileImage);
                })
                .collect(Collectors.toList());
    }
}
