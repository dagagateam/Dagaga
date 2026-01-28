package com.dagaga.chat.service;

import com.dagaga.chat.dto.MessageServiceDto.SaveMessageCommand;
import com.dagaga.chat.dto.MessageServiceDto.SaveMessageResult;
import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.entity.MessageTranslation;
import com.dagaga.domain.chat.message.repository.ChatMessageRepository;
import com.dagaga.domain.chat.message.repository.MessageTranslationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final MessageTranslationRepository messageTranslationRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository,
                              MessageTranslationRepository messageTranslationRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.messageTranslationRepository = messageTranslationRepository;
    }

    @Transactional
    public SaveMessageResult save(SaveMessageCommand cmd) {

        // 원문 메시지 저장
        ChatMessage msg = ChatMessage.create(
                cmd.roomId(),
                cmd.senderId(),
                cmd.originalText(),
                cmd.originalLang()
        );
        ChatMessage savedMsg = chatMessageRepository.save(msg);

        // 번역 메시지 저장
        MessageTranslation savedTranslation = null;

        String lang = cmd.translatedLang() == null ? null : cmd.translatedLang().trim();
        String text = cmd.translatedText() == null ? null : cmd.translatedText().trim();

        if (lang != null && !lang.isEmpty() && text != null && !text.isEmpty()) {
            MessageTranslation mt = MessageTranslation.create(savedMsg.getMessageId(), lang, text);
            savedTranslation = messageTranslationRepository.save(mt);
        }

        return new SaveMessageResult(savedMsg, savedTranslation);
    }

}
