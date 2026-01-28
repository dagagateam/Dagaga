package com.dagaga.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MessageDto {

    public record SendMessageRequest(
            @NotNull
            Integer roomId,
            @NotNull
            Integer senderId,
            @NotBlank
            String originalText,
            String originalLang,
            String translatedLang,
            String translatedText,
            @NotNull
            Integer senderLocationId // 지역 검증용 -> JWT로 수정 필요
    ) {}

    public record SendMessageResponse(
            Long messageId,
            Integer roomId,
            Integer senderId,
            String originalText,
            String originalLang,
            String translatedLang,
            String translatedText,
            String sentAt
    ) {}
}
