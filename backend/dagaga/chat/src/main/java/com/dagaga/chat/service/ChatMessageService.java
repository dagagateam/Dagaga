package com.dagaga.chat.service;

import com.dagaga.chat.dto.MessageServiceDto.SaveMessageCommand;
import com.dagaga.chat.dto.MessageServiceDto.SaveMessageResult;
import com.dagaga.domain.chat.language.repository.LanguageRepository;
import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.entity.MessageTranslation;
import com.dagaga.domain.chat.message.repository.ChatMessageRepository;
import com.dagaga.domain.chat.translate.port.TranslationPort;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dagaga.chat.dto.ChatMessageResponse;
import org.springframework.data.domain.PageRequest;
import java.util.stream.Collectors;
import java.util.List;

import org.springframework.transaction.support.TransactionTemplate;

@Slf4j
@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final LanguageRepository languageRepository;
    private final TranslationPort translationPort;
    private final ChatRoomService chatRoomService;
    private final TransactionTemplate transactionTemplate;

    public ChatMessageService(ChatMessageRepository chatMessageRepository,
            LanguageRepository languageRepository,
            TranslationPort translationPort,
            ChatRoomService chatRoomService,
            TransactionTemplate transactionTemplate) {
        this.chatMessageRepository = chatMessageRepository;
        this.languageRepository = languageRepository;
        this.translationPort = translationPort;
        this.chatRoomService = chatRoomService;
        this.transactionTemplate = transactionTemplate;
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

    private void saveTranslations(Long messageId, com.dagaga.domain.chat.translate.port.TranslationResult result) {
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

        // 언어에 맞게 변환
        return messages.stream()
                .map(msg -> {
                    boolean isTranslated = false;
                    String content = msg.getOriginalText();

                    // 원문 언어가 사용자의 모국어와 다르면 번역본 찾기
                    if (!msg.getOriginalLang().equalsIgnoreCase(userNativeLangCode)) {
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

                    return ChatMessageResponse.from(msg, content, isTranslated);
                })
                .collect(Collectors.toList());
    }
}
