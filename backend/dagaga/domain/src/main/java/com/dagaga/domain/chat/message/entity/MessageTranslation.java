package com.dagaga.domain.chat.message.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "message_translations")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MessageTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "translation_id", nullable = false)
    private Long translationId;

    @Column(name = "message_id", nullable = false)
    private Long messageId;

    @Column(name = "target_lang", nullable = false, length = 10)
    private String targetLang;

    @Column(name = "translated_text", nullable = false, columnDefinition = "text")
    private String translatedText;

    @Column(name = "translated_at")
    private OffsetDateTime translatedAt;

    public static MessageTranslation create(Long messageId,
                                            String targetLang,
                                            String translatedText) {
        return MessageTranslation.builder()
                .messageId(messageId)
                .targetLang(targetLang)
                .translatedText(translatedText)
                .translatedAt(OffsetDateTime.now())
                .build();
    }
}
