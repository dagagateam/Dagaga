package com.dagaga.chat.dto;

import com.dagaga.domain.chat.message.entity.ChatMessage;
import lombok.Builder;

import java.time.OffsetDateTime;

@Builder
public record ChatMessageResponse(
    Long messageId,
    Integer senderId,
    String senderNickname,
    String senderProfileImage,
    String content,
    OffsetDateTime sentAt,
    boolean isTranslated
) {
    public static ChatMessageResponse from(ChatMessage message, String localizedContent, boolean isTranslated,
                                           String senderNickname, String senderProfileImage) {
        return ChatMessageResponse.builder()
            .messageId(message.getMessageId())
            .senderId(message.getSenderId())
            .senderNickname(senderNickname)
            .senderProfileImage(senderProfileImage)
            .content(localizedContent)
            .sentAt(message.getSentAt())
            .isTranslated(isTranslated)
            .build();
    }
}
