package com.dagaga.chat.dto;

import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.entity.MessageTranslation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.dagaga.chat.dto.MessageServiceDto.SaveMessageCommand;
import static com.dagaga.chat.dto.MessageServiceDto.SaveMessageResult;

public class MessageControllerDto {

    public record SendMessageRequest(
            @NotNull Integer roomId,
            @NotNull Integer senderId,
            @NotBlank String originalText,
            String originalLang,
            String translatedLang,
            String translatedText,
            @NotNull Integer senderLocationId // TODO: 지역 검증용 -> JWT로 수정 필요
    ) {
        // Controller DTO -> Service DTO 변환
        public SaveMessageCommand toServiceDto() {
            return new SaveMessageCommand(
                    roomId,
                    senderId,
                    originalText,
                    originalLang,
                    translatedLang,
                    translatedText);
        }
    }

    public record SendMessageResponse(
            Long messageId,
            Integer roomId,
            Integer senderId,
            String originalText,
            String originalLang,
            Map<String, String> translations,
            String sentAt) {
        // Service Result -> Response 변환
        public static SendMessageResponse from(SaveMessageResult result) {
            ChatMessage message = result.message();
            List<MessageTranslation> translationList = result.translations();

            Map<String, String> translationsMap = new HashMap<>();
            if (translationList != null) {
                for (MessageTranslation mt : translationList) {
                    translationsMap.put(mt.getTargetLang(), mt.getTranslatedText());
                }
            }

            return new SendMessageResponse(
                    message.getMessageId(),
                    message.getRoomId(),
                    message.getSenderId(),
                    message.getOriginalText(),
                    message.getOriginalLang(),
                    translationsMap,
                    message.getSentAt().toString());
        }
    }
}
