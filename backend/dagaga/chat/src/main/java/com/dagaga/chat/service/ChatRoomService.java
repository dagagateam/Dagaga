package com.dagaga.chat.service;

import com.dagaga.domain.chat.room.entity.ChatRoom;
import com.dagaga.domain.chat.room.entity.RoomType;
import com.dagaga.domain.chat.room.entity.RoomStatus;
import com.dagaga.domain.chat.room.repository.ChatRoomRepository;
import com.dagaga.domain.chat.user.entity.ChatRoomUser;
import com.dagaga.domain.chat.user.entity.ChatRoomUserId;
import com.dagaga.domain.chat.user.entity.Role;
import com.dagaga.domain.chat.user.entity.UserStatus;
import com.dagaga.domain.chat.user.repository.ChatRoomUserRepository;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import com.dagaga.chat.dto.ChatRoomResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomUserRepository chatRoomUserRepository;
    private final UserRepository userRepository;

    public ChatRoomService(ChatRoomRepository chatRoomRepository,
            ChatRoomUserRepository chatRoomUserRepository,
            UserRepository userRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatRoomUserRepository = chatRoomUserRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getRoomsByLocation(int locationId, String sortBy) {
        // 기본 정렬은 인기순
        if (sortBy == null || sortBy.isBlank()) {
            sortBy = "popularity";
        }
        List<ChatRoom> rooms = chatRoomRepository.findAllByLocationWithSort(locationId, sortBy);
        return rooms.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getRoomsByUserId(int userId) {
        List<ChatRoomUser> chatRoomUsers = chatRoomUserRepository.findAllByIdUserIdAndStatus(userId, UserStatus.ACTIVE);
        return chatRoomUsers.stream()
                .map(cru -> chatRoomRepository.findById(cru.getId().getRoomId())
                        .orElseThrow(() -> new IllegalStateException(
                                "채팅방 정보를 찾을 수 없습니다. roomId=" + cru.getId().getRoomId())))
                .filter(room -> room.getStatus() == RoomStatus.ACTIVE)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ChatRoomResponse toResponse(ChatRoom room) {
        User creator = userRepository.findById(room.getCreatorId())
                .orElseThrow(() -> new IllegalStateException("방장 정보를 찾을 수 없습니다. creatorId=" + room.getCreatorId()));

        long participantCount = chatRoomUserRepository.countByIdRoomIdAndStatus(room.getRoomId(), UserStatus.ACTIVE);

        return ChatRoomResponse.builder()
                .roomId(room.getRoomId())
                .title(room.getTitle())
                .roomType(room.getRoomType())
                .creatorNickname(creator.getNickname())
                .participantCount(participantCount)
                .build();
    }

    @Transactional
    public int ensureDefaultRoomAndJoin(int userId, int locationId) {
        ChatRoom room = chatRoomRepository.findByLocationIdAndRoomType(locationId, RoomType.DEFAULT)
                .orElseThrow(() -> new IllegalStateException("해당 지역의 기본 채팅방이 존재하지 않습니다. locationId=" + locationId));

        upsertActiveStatus(room.getRoomId(), userId, Role.MEMBER);
        return room.getRoomId();
    }

    @Transactional
    public int createCustomRoom(int creatorId, int creatorLocationId, String title) {
        ChatRoom room = ChatRoom.createCustomRoom(
                creatorId,
                creatorLocationId,
                title);

        ChatRoom saved = chatRoomRepository.save(room);

        upsertActiveStatus(saved.getRoomId(), creatorId, Role.OWNER);
        return saved.getRoomId();
    }

    @Transactional(readOnly = true)
    public ChatRoom getRoomAndValidateLocation(int roomId, int userLocationId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다. roomId : " + roomId));

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

    @Transactional
    public void deleteRoom(int roomId, int requesterId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다. roomId : " + roomId));

        if (!room.getCreatorId().equals(requesterId)) {
            throw new IllegalArgumentException("채팅방을 삭제할 권한이 없습니다.");
        }

        room.setStatus(RoomStatus.DELETED);

        // 삭제한 채팅방에 속한 모든 유저를 LEFT 상태로 변경
        List<ChatRoomUser> users = chatRoomUserRepository.findAllByIdRoomId(roomId);
        for (ChatRoomUser user : users) {
            user.leave();
        }
    }

    @Transactional
    public void leaveRoom(int userId, int roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다. roomId : " + roomId));

        if (room.getRoomType() == RoomType.DEFAULT) {
            throw new IllegalStateException("기본 채팅방은 나갈 수 없습니다.");
        }

        ChatRoomUserId id = new ChatRoomUserId(roomId, userId);
        ChatRoomUser user = chatRoomUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("채팅방에 참여 중인 유저가 아닙니다."));

        user.leave();
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
