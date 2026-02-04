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

@Slf4j
@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final LanguageRepository languageRepository;
    private final TranslationPort translationPort;
    private final ChatRoomService chatRoomService;

    public ChatMessageService(ChatMessageRepository chatMessageRepository,
            LanguageRepository languageRepository,
            TranslationPort translationPort,
            ChatRoomService chatRoomService) {
        this.chatMessageRepository = chatMessageRepository;
        this.languageRepository = languageRepository;
        this.translationPort = translationPort;
        this.chatRoomService = chatRoomService;
    }

    @Transactional
    public SaveMessageResult save(SaveMessageCommand cmd) {

        // 순서: 메시지 생성 -> 번역 -> 번역본 추가 -> 원본+번역본 저장

        // 원문 메시지 저장
        ChatMessage msg = ChatMessage.create(
                cmd.roomId(),
                cmd.senderId(),
                cmd.originalText(),
                cmd.originalLang());

        // 타겟 언어 조회 (전체 지원 언어 조회)
        List<String> targetLangs = languageRepository.findAllActiveLangCodes();

        // 번역 및 언어 감지
        if (!targetLangs.isEmpty()) {
            try {
                log.info("Detecting and translating text: {}", cmd.originalText());
                var translationResult = translationPort.detectAndTranslate(cmd.originalText(), targetLangs);
                
                String detectedLang = translationResult.getDetectedLanguage();
                log.info("Detected language: {}", detectedLang);

                // 감지된 언어로 원본 언어 설정
                if (detectedLang != null && !detectedLang.equals("unknown")) {
                    msg.setOriginalLang(detectedLang);
                }

                // 번역본 추가
                translationResult.getTranslations().forEach((lang, translatedText) -> {
                    // 원본 언어와 같은 번역본은 제외
                    if (!lang.equalsIgnoreCase(msg.getOriginalLang())) {
                        MessageTranslation translation = MessageTranslation.create(msg, lang, translatedText);
                        msg.addTranslation(translation);
                    }
                });
            } catch (Exception e) {
                log.error("메시지 번역 처리 중 오류가 발생했습니다.", e);
            }
        }

        // 저장
        ChatMessage savedMsg = chatMessageRepository.save(msg);

        return new SaveMessageResult(savedMsg, savedMsg.getTranslations());
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
