package com.dagaga.domain.chat.message.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
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

    @Column(name = "original_lang", nullable = false, length = 10)
    private String originalLang;

    @Column(name = "sent_at")
    private OffsetDateTime sentAt;

    @Builder.Default
    @OneToMany(mappedBy = "chatMessage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MessageTranslation> translations = new ArrayList<>();

    public void addTranslation(MessageTranslation translation) {
        this.translations.add(translation);
        translation.setChatMessage(this);
    }

    public static ChatMessage create(Integer roomId, Integer senderId,
            String originalText,
            String originalLang) {
        return ChatMessage.builder()
                .roomId(roomId)
                .senderId(senderId)
                .originalText(originalText)
                .originalLang(originalLang)
                .sentAt(OffsetDateTime.now())
                .build();
    }
}
