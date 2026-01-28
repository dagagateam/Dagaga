package com.dagaga.chat.service;

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
    public SavedMessage save(Integer roomId, Integer senderId,
                            String originalText,
                            String originalLang,
                            String translatedLang,
                            String translatedText) {

        // 원문 메시지 저장
        ChatMessage msg = ChatMessage.create(roomId, senderId, originalText, originalLang);
        ChatMessage savedMsg = chatMessageRepository.save(msg);

        // 번역 메시지 저장
        MessageTranslation savedTranslation = null;

        String lang = translatedLang == null ? null : translatedLang.trim();
        String text = translatedText == null ? null : translatedText.trim();

        if (lang != null && !lang.isEmpty() && text != null && !text.isEmpty()) {
            MessageTranslation t = MessageTranslation.create(savedMsg.getMessageId(), lang, text);
            savedTranslation = messageTranslationRepository.save(t);
        }

        return new SavedMessage(savedMsg, savedTranslation);
    }

    public record SavedMessage(ChatMessage message, MessageTranslation translation) {}
}
