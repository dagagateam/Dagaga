package com.dagaga.chat.dto;

import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.entity.MessageTranslation;

public class MessageServiceDto {
    public record SaveMessageCommand(
            Integer roomId,
            Integer senderId,
            String originalText,
            String originalLang,
            String translatedLang,
            String translatedText
    ) {}

    public record SaveMessageResult(
            ChatMessage message,
            MessageTranslation translation
    ) {}
}
