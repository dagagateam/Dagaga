package com.dagaga.domain.chat.message.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "chat_messages")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;

    @Column(name = "room_id", nullable = false)
    private Integer roomId;

    @Column(name = "sender_id", nullable = false)
    private Integer senderId;

    @Column(name = "original_text", nullable = false, columnDefinition = "text")
    private String originalText;

    @Column(name = "translated_text", nullable = false, columnDefinition = "text")
    private String translatedText;

    @Column(name = "original_lang", nullable = false, length = 10)
    private String originalLang;

    @Column(name = "translated_lang", nullable = false, length = 10)
    private String translatedLang;

    @Column(name = "sent_at")
    private OffsetDateTime sentAt;
}
