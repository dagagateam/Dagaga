package com.dagaga.chat.service;

import com.dagaga.domain.chat.room.entity.ChatRoom;
import com.dagaga.domain.chat.room.entity.RoomType;
import com.dagaga.domain.chat.room.entity.RoomStatus;
import com.dagaga.domain.chat.room.repository.ChatRoomRepository;
import com.dagaga.domain.chat.user.entity.ChatRoomUser;
import com.dagaga.domain.chat.user.entity.ChatRoomUserId;
import com.dagaga.domain.chat.user.entity.UserStatus;
import com.dagaga.domain.chat.user.repository.ChatRoomUserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ChatRoomServiceTest {

    @InjectMocks
    private ChatRoomService chatRoomService;

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private ChatRoomUserRepository chatRoomUserRepository;

    @Test
    @DisplayName("Success: 사용자 custom 채팅방 생성 및 owner 설정")
    void createCustomRoom_shouldCreateRoomAndJoinAsOwner() {
        // given
        int creatorId = 1;
        int creatorLocationId = 100;
        String title = "같이 밥 먹을 사람";

        ChatRoom savedRoom = ChatRoom.builder()
                .roomId(10)
                .creatorId(creatorId)
                .locationId(creatorLocationId)
                .title(title)
                .roomType(RoomType.CUSTOM)
                .build();

        given(chatRoomRepository.save(any(ChatRoom.class))).willReturn(savedRoom);
        
        // ChatRoomUser 모킹 (upsertActiveStatus 내부 로직)
        given(chatRoomUserRepository.findById(any(ChatRoomUserId.class))).willReturn(Optional.empty());
        given(chatRoomUserRepository.save(any(ChatRoomUser.class))).willAnswer(invocation -> invocation.getArgument(0));

        // when
        int roomId = chatRoomService.createCustomRoom(creatorId, creatorLocationId, title);

        // then
        assertThat(roomId).isEqualTo(10);
        
        // 방 저장 호출 검증
        verify(chatRoomRepository).save(any(ChatRoom.class));
        
        // 참여자 저장(OWNER) 호출 검증
        verify(chatRoomUserRepository).save(any(ChatRoomUser.class));
    }

    @Test
    @DisplayName("Success: 방장이 방 삭제 요청 시 상태가 DELETED로 변경되고 참여자는 LEFT로 변경됨")
    void deleteRoom_shouldMarkRoomAsDeletedAndUsersAsLeft() {
        // given
        int roomId = 1;
        int creatorId = 100;
        
        ChatRoom room = ChatRoom.builder()
                .roomId(roomId)
                .creatorId(creatorId)
                .status(RoomStatus.ACTIVE)
                .build();
        
        ChatRoomUser user1 = ChatRoomUser.builder().status(UserStatus.ACTIVE).build();
        ChatRoomUser user2 = ChatRoomUser.builder().status(UserStatus.ACTIVE).build();

        given(chatRoomRepository.findById(roomId)).willReturn(Optional.of(room));
        given(chatRoomUserRepository.findAllByRoomId(roomId)).willReturn(List.of(user1, user2));

        // when
        chatRoomService.deleteRoom(roomId, creatorId);

        // then
        assertThat(room.getStatus()).isEqualTo(RoomStatus.DELETED);
        assertThat(user1.getStatus()).isEqualTo(UserStatus.LEFT);
        assertThat(user1.getLeftAt()).isNotNull();
        assertThat(user2.getStatus()).isEqualTo(UserStatus.LEFT);
    }

    @Test
    @DisplayName("Fail: 방장이 아닌 유저가 삭제 요청 시 예외 발생")
    void deleteRoom_shouldThrowException_whenRequesterIsNotOwner() {
        // given
        int roomId = 1;
        int creatorId = 100;
        int requesterId = 999; 

        ChatRoom room = ChatRoom.builder()
                .roomId(roomId)
                .creatorId(creatorId)
                .build();

        given(chatRoomRepository.findById(roomId)).willReturn(Optional.of(room));

        // when & then
        assertThatThrownBy(() -> 
            chatRoomService.deleteRoom(roomId, requesterId)
        ).isInstanceOf(IllegalArgumentException.class);
    }
}
