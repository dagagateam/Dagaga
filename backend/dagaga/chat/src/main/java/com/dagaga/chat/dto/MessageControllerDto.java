package com.dagaga.chat.dto;

import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.entity.MessageTranslation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

import static com.dagaga.chat.dto.MessageServiceDto.SaveMessageCommand;
import static com.dagaga.chat.dto.MessageServiceDto.SaveMessageResult;

public class MessageControllerDto {

    public record SendMessageRequest(
            @NotNull Integer roomId,
            @NotBlank String originalText,
            String translatedLang,
            String translatedText
    ) {
        // Controller DTO -> Service DTO 변환
        public SaveMessageCommand toServiceDto(Integer senderId, String senderLang) {
            return new SaveMessageCommand(
                    roomId,
                    senderId,
                    originalText,
                    senderLang,
                    translatedLang,
                    translatedText);
        }
    }

    public record SendMessageResponse(
            Long messageId,
            Integer roomId,
            Integer senderId,
            String senderNickname,
            String senderProfileImage,
            String content, // 원문 또는 번역문
            String originalContent,
            String originalLang,
            String sentAt,
            String type) { // TALK, LEAVE

        // Service Result -> Response 변환 (언어별)
        public static SendMessageResponse from(SaveMessageResult result, String targetLang, String senderNickname, String senderProfileImage) {
            ChatMessage message = result.message();
            String content = message.getOriginalText();

            // 타겟 언어와 원문 언어가 다르면 번역본 찾기
            if (!message.getOriginalLang().equalsIgnoreCase(targetLang)) {
                List<MessageTranslation> translationList = result.translations();
                if (translationList != null) {
                    content = translationList.stream()
                            .filter(t -> t.getTargetLang().equalsIgnoreCase(targetLang))
                            .map(MessageTranslation::getTranslatedText)
                            .findFirst()
                            .orElse(message.getOriginalText()); // 번역 없으면 원문
                }
            }

            return new SendMessageResponse(
                    message.getMessageId(),
                    message.getRoomId(),
                    message.getSenderId(),
                    senderNickname,
                    senderProfileImage,
                    content,
                    message.getOriginalText(),
                    message.getOriginalLang(),
                    message.getSentAt().toString(),
                    "TALK");
        }
    }
}
