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
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
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
    private final UserRepository userRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository,
            LanguageRepository languageRepository,
            TranslationPort translationPort,
            ChatRoomService chatRoomService,
            UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.languageRepository = languageRepository;
        this.translationPort = translationPort;
        this.chatRoomService = chatRoomService;
        this.userRepository = userRepository;
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

        // 타겟 언어 조회 (전체 지원 언어 중 원문 언어 제외)
        List<String> targetLangs = languageRepository.findAllActiveLangCodes()
                .stream()
                .filter(lang -> !lang.equalsIgnoreCase(cmd.originalLang())) // 원문 언어 제외
                .toList();

        // 번역
        if (!targetLangs.isEmpty()) {
            try {
                var translationMap = translationPort.translate(cmd.originalText(), cmd.originalLang(), targetLangs);

                translationMap.forEach((lang, translatedText) -> {
                    MessageTranslation translation = MessageTranslation.create(msg, lang, translatedText);
                    msg.addTranslation(translation);
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
    public List<ChatMessageResponse> getMessages(int roomId, int userLocationId, int userId, Long cursor, int size) {
        // 지역 검증
        chatRoomService.getRoomAndValidateLocation(roomId, userLocationId);

        // 사용자 모국어 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userId=" + userId));
        String userLang = user.getNativeLangCode();

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
                    if (!msg.getOriginalLang().equalsIgnoreCase(userLang)) {
                        String translatedText = msg.getTranslations().stream()
                                .filter(t -> t.getTargetLang().equalsIgnoreCase(userLang))
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
