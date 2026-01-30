package com.dagaga.domain.chat.room.entity;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.DynamicInsert;

import java.time.OffsetDateTime;

@Entity
@Table(name = "chat_rooms")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@DynamicInsert
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Integer roomId;

    @Column(name = "creator_id", nullable = false)
    private Integer creatorId;

    @Column(name = "location_id", nullable = false)
    private Integer locationId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false)
    private RoomType roomType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private RoomStatus status = RoomStatus.ACTIVE;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // 생성용 팩토리 메서드 (chat 모듈에서 활용)
    public static ChatRoom createDefaultRoom(Integer creatorId, Integer locationId, String title) {
        OffsetDateTime now = OffsetDateTime.now();

        return ChatRoom.builder()
                .creatorId(creatorId)
                .locationId(locationId)
                .title(title == null || title.isBlank() ? "지역 단체 채팅방" : title)
                .roomType(RoomType.DEFAULT)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public static ChatRoom createCustomRoom(Integer creatorId, Integer locationId, String title) {
        OffsetDateTime now = OffsetDateTime.now();

        return ChatRoom.builder()
                .creatorId(creatorId)
                .locationId(locationId)
                .title(title)
                .roomType(RoomType.CUSTOM)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    // 채팅방 수정 시 updatedAt만 갱신
    public void touch() {
        this.updatedAt = OffsetDateTime.now();
    }
}
