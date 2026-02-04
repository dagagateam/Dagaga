package com.dagaga.chat.dto;

import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.entity.MessageTranslation;
import java.util.List;

public class MessageServiceDto {
        public record SaveMessageCommand(
                        Integer roomId,
                        Integer senderId,
                        String originalText,
                        String originalLang,
                        String translatedLang,
                        String translatedText) {
        }

        public record SaveMessageResult(
                        ChatMessage message,
                        List<MessageTranslation> translations) {
        }

        public record ChatMessageResult(
                        Long messageId,
                        Integer roomId,
                        Integer senderId,
                        String senderNickname,
                        String senderProfileImage,
                        String content,
                        String originalLang,
                        String sentAt,
                        String type) {
        }

        public record TargetedMessageResult(
                        String targetLang,
                        ChatMessageResult result) {
        }
}
