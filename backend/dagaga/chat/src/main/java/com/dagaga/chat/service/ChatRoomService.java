package com.dagaga.chat.service;

import com.dagaga.domain.chat.room.entity.ChatRoom;
import com.dagaga.domain.chat.room.entity.RoomType;
import com.dagaga.domain.chat.room.repository.ChatRoomRepository;
import com.dagaga.domain.chat.user.entity.ChatRoomUser;
import com.dagaga.domain.chat.user.entity.ChatRoomUserId;
import com.dagaga.domain.chat.user.entity.Role;
import com.dagaga.domain.chat.user.entity.UserStatus;
import com.dagaga.domain.chat.user.repository.ChatRoomUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomUserRepository chatRoomUserRepository;

    public ChatRoomService(ChatRoomRepository chatRoomRepository,
                           ChatRoomUserRepository chatRoomUserRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatRoomUserRepository = chatRoomUserRepository;
    }

    @Transactional
    public int ensureDefaultRoomAndJoin(int userId, int locationId) {
        ChatRoom room = chatRoomRepository.findByLocationIdAndRoomType(locationId, RoomType.DEFAULT)
                .orElseThrow(() -> new IllegalStateException("해당 지역의 기본 채팅방이 존재하지 않습니다. locationId=" + locationId));

        upsertActiveStatus(room.getRoomId(), userId, Role.MEMBER);
        return room.getRoomId();
    }

    @Transactional
    public int createCustomRoom(int creatorId, int creatorLocationId, String title, String topic, Integer maxParticipants) {
        ChatRoom room = ChatRoom.createCustomRoom(
                creatorId,
                creatorLocationId,
                title,
                topic,
                maxParticipants
        );

        ChatRoom saved = chatRoomRepository.save(room);

        upsertActiveStatus(saved.getRoomId(), creatorId, Role.OWNER);
        return saved.getRoomId();
    }

    @Transactional(readOnly = true)
    public ChatRoom getRoomAndValidateLocation(int roomId, int userLocationId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("room not found: " + roomId));

        if (!room.getLocationId().equals(userLocationId)) {
            throw new IllegalStateException("다른 지역 채팅방에는 접근할 수 없습니다.");
        }
        return room;
    }

    @Transactional
    public void joinRoom(int userId, int userLocationId, int roomId) {
        getRoomAndValidateLocation(roomId, userLocationId);
        upsertActiveStatus(roomId, userId, Role.MEMBER);
    }

    private void upsertActiveStatus(int roomId, int userId, Role role) {
        ChatRoomUserId id = new ChatRoomUserId(roomId, userId);

        ChatRoomUser user = chatRoomUserRepository.findById(id)
                .orElseGet(() -> ChatRoomUser.join(roomId, userId, role));

        // 이전에 해당 채팅방에 이미 참여했던 적이 있는 유저면 ACTIVE로 변경
        user.setStatus(UserStatus.ACTIVE);

        // role이 null이면 초기 세팅
        if (user.getRole() == null) {
            user.setRole(role);
        }

        user.setLeftAt(null);

        chatRoomUserRepository.save(user);
    }
}
