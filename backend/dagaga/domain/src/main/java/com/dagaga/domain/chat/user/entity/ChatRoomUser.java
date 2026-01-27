package com.dagaga.domain.chat.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "chat_room_users")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatRoomUser {

    @EmbeddedId
    private ChatRoomUserId id;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status;

    @Column(name = "joined_at", nullable = false)
    private OffsetDateTime joinedAt;

    @Column(name = "left_at")
    private OffsetDateTime leftAt;

    @Column(name = "last_read_message_id")
    private Long lastReadMessageId;

    @Column(name = "last_read_at")
    private OffsetDateTime lastReadAt;

    // 새로운 채팅방 참여
    public static ChatRoomUser join(Integer roomId, Integer userId, Role role) {
        OffsetDateTime now = OffsetDateTime.now();
        return ChatRoomUser.builder()
                .id(new ChatRoomUserId(roomId, userId))
                .role(role)
                .status(UserStatus.ACTIVE)
                .joinedAt(now)
                .leftAt(null)
                .build();
    }

    // 이전에 참여했던 채팅방 재참여 (LEFT → ACTIVE)
    public void rejoin() {
        this.status = UserStatus.ACTIVE;
        this.leftAt = null;
    }

    // 채팅방 나가기 (ACTIVE → LEFT)
    public void leave() {
        this.status = UserStatus.LEFT;
        this.leftAt = OffsetDateTime.now();
    }

    // 메시지 읽음 업데이트
    public void updateRead(Long lastReadMessageId) {
        this.lastReadMessageId = lastReadMessageId;
        this.lastReadAt = OffsetDateTime.now();
    }
}
