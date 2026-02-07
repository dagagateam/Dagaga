package com.dagaga.chat.dto;

import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.entity.MessageTranslation;
import com.dagaga.domain.common.validation.NoHtml;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

import static com.dagaga.chat.dto.MessageServiceDto.SaveMessageCommand;
import static com.dagaga.chat.dto.MessageServiceDto.SaveMessageResult;

public class MessageControllerDto {

    public record SendMessageRequest(
            @NotNull(message = "채팅방 ID는 필수입니다")
            Integer roomId,
            
            @NotBlank(message = "메시지는 필수입니다")
            @Size(max = 2000, message = "메시지는 2000자를 초과할 수 없습니다")
            @NoHtml(message = "HTML 태그는 사용할 수 없습니다")
            String originalText,
            
            String translatedLang,
            
            @Size(max = 2000, message = "번역 메시지는 2000자를 초과할 수 없습니다")
            @NoHtml(message = "HTML 태그는 사용할 수 없습니다")
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

            // 타겟 언어와 원문 언어가 다르고, 원문 언어가 unknown이 아니면 번역본 찾기
            if (!message.getOriginalLang().equalsIgnoreCase(targetLang) 
                    && !"unknown".equalsIgnoreCase(message.getOriginalLang())) {
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
