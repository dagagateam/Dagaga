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

import java.util.List;

@Slf4j
@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final LanguageRepository languageRepository;
    private final TranslationPort translationPort;

    public ChatMessageService(ChatMessageRepository chatMessageRepository,
            LanguageRepository languageRepository,
            TranslationPort translationPort) {
        this.chatMessageRepository = chatMessageRepository;
        this.languageRepository = languageRepository;
        this.translationPort = translationPort;
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

}
