package com.dagaga.chat.service;

import com.dagaga.domain.chat.room.entity.ChatRoom;
import com.dagaga.domain.chat.room.entity.RoomType;
import com.dagaga.domain.chat.room.entity.RoomStatus;
import com.dagaga.domain.chat.room.repository.ChatRoomRepository;
import com.dagaga.domain.chat.user.entity.ChatRoomUser;
import com.dagaga.domain.chat.user.entity.ChatRoomUserId;
import com.dagaga.domain.chat.user.entity.UserStatus;
import com.dagaga.domain.chat.user.repository.ChatRoomUserRepository;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import com.dagaga.chat.dto.ChatRoomResponse;
import com.dagaga.domain.post.entity.Location;
import com.dagaga.domain.post.repository.LocationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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

    @Mock
    private UserRepository userRepository;

    @Mock
    private LocationRepository locationRepository;

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
        int roomId = chatRoomService.createCustomRoom(creatorId, creatorLocationId, "서울 맛집 공유");

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
        given(chatRoomUserRepository.findAllByIdRoomId(roomId)).willReturn(List.of(user1, user2));

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
        assertThatThrownBy(() -> chatRoomService.deleteRoom(roomId, requesterId))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Success: Custom 채팅방의 경우 유저가 나가면 status가 LEFT로 변경됨")
    void leaveRoom_shouldMarkUserAsLeft_whenRoomIsCustom() {
        // given
        int roomId = 1;
        int userId = 10;

        ChatRoom room = ChatRoom.builder()
                .roomId(roomId)
                .roomType(RoomType.CUSTOM)
                .build();

        ChatRoomUserId id = new ChatRoomUserId(roomId, userId);
        ChatRoomUser user = ChatRoomUser.builder()
                .id(id)
                .status(UserStatus.ACTIVE)
                .build();

        given(chatRoomRepository.findById(roomId)).willReturn(Optional.of(room));
        given(chatRoomUserRepository.findById(any(ChatRoomUserId.class))).willReturn(Optional.of(user));

        // when
        chatRoomService.leaveRoom(userId, roomId);

        // then
        assertThat(user.getStatus()).isEqualTo(UserStatus.LEFT);
        assertThat(user.getLeftAt()).isNotNull();
    }

    @Test
    @DisplayName("Fail: Default 채팅방은 나갈 수 없음")
    void leaveRoom_shouldThrowException_whenRoomIsDefault() {
        // given
        int roomId = 1;
        int userId = 10;

        ChatRoom room = ChatRoom.builder()
                .roomId(roomId)
                .roomType(RoomType.DEFAULT)
                .build();

        given(chatRoomRepository.findById(roomId)).willReturn(Optional.of(room));

        // when & then
        assertThatThrownBy(() -> chatRoomService.leaveRoom(userId, roomId)).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("기본 채팅방은 나갈 수 없습니다");
    }

    @Test
    @DisplayName("Success: 지역코드가 일치하면 채팅방 참여에 성공함")
    void joinRoom_shouldSuccess_whenLocationMatches() {
        // given
        int roomId = 1;
        int userId = 10;
        int locationId = 100;

        ChatRoom room = ChatRoom.builder()
                .roomId(roomId)
                .locationId(locationId)
                .build();

        given(chatRoomRepository.findById(roomId)).willReturn(Optional.of(room));
        given(chatRoomUserRepository.findById(any(ChatRoomUserId.class))).willReturn(Optional.empty());

        // when
        chatRoomService.joinRoom(userId, locationId, roomId);

        // then
        verify(chatRoomUserRepository).save(any(ChatRoomUser.class));
    }

    @Test
    @DisplayName("Fail: 지역코드가 일치하지 않으면 채팅방 참여에 실패함")
    void joinRoom_shouldThrowException_whenLocationMismatches() {
        // given
        int roomId = 1;
        int userId = 10;
        int userLocationId = 999; // 유저 지역
        int roomLocationId = 100; // 방 지역

        ChatRoom room = ChatRoom.builder()
                .roomId(roomId)
                .locationId(roomLocationId)
                .build();

        given(chatRoomRepository.findById(roomId)).willReturn(Optional.of(room));

        // when & then
        assertThatThrownBy(() -> chatRoomService.joinRoom(userId, userLocationId, roomId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("다른 지역 채팅방에는 접근할 수 없습니다");
    }

                
    @Test
                
    @DisplayName("Success: 내 지역 채팅방 목록 조회 시 DEFAULT 타입이 항상 첫 번째로 옴")
    void getRoomsByLocation_shouldReturnDefaultRoomFirst() {
        // given
        int locationId = 1;
        ChatRoom defaultRoom = ChatRoom.builder().roomId(1).title("기본방").roomType(
                RoomType.DEFAULT).creatorId(1).status(RoomStatus.ACTIVE).build();
        ChatRoom customRoom = ChatRoom.builder().roomId(2).title("일반방").roomType(RoomType.CUSTOM).creatorId(1).status(RoomStatus.ACTIVE).build();

        User creator = User.builder().nickname("방장").build();
        ReflectionTestUtils.setField(creator, "userId", 1);

        given(chatRoomRepository.findAllByLocationWithSort(eq(locationId), any())).willReturn(List.of(defaultRoom, customRoom));
        given(userRepository.findById(1)).willReturn(Optional.of(creator));
        given(chatRoomUserRepository.countByIdRoomIdAndStatus(any(), eq(UserStatus.ACTIVE))).willReturn(10L);

        // when
        List<ChatRoomResponse> responses = chatRoomService.getRoomsByLocation(locationId, "popularity");

        // then
        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).getRoomType()).isEqualTo(RoomType.DEFAULT);
        assertThat(responses.get(1).getRoomType()).isEqualTo(RoomType.CUSTOM);
    }

                
    @Test
    @DisplayName("Success: 내가 참여 중인 방 목록 조회 시 ACTIVE 상태인 방만 반환")
    void getRoomsByUserId_shouldReturnOnlyActiveRooms() {
        // given
        int userId = 1;
        ChatRoom activeRoom = ChatRoom.builder().roomId(1).title("활동중").status(RoomStatus.ACTIVE).creatorId(1).build();
        ChatRoom deletedRoom = ChatRoom.builder().roomId(2).title("삭제됨").status(RoomStatus.DELETED).creatorId(1).build();

        ChatRoomUserId id1 = new ChatRoomUserId(1, userId);
        ChatRoomUserId id2 = new ChatRoomUserId(2, userId);
                
        ChatRoomUser cru1 = ChatRoomUser.builder().id(id1).status(UserStatus.ACTIVE).build();
        ChatRoomUser cru2 = ChatRoomUser.builder().id(id2).status(UserStatus.ACTIVE).build();

        User creator = User.builder().nickname("방장").build();
        ReflectionTestUtils.setField(creator, "userId", 1);

        given(chatRoomUserRepository.findAllByIdUserIdAndStatus(userId, UserStatus.ACTIVE)).willReturn(List.of(cru1, cru2));
        given(chatRoomRepository.findById(1)).willReturn(Optional.of(activeRoom));
        given(chatRoomRepository.findById(2)).willReturn(Optional.of(deletedRoom));
        given(userRepository.findById(1)).willReturn(Optional.of(creator));

        // when
        List<ChatRoomResponse> responses = chatRoomService.getRoomsByUserId(userId);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getTitle()).isEqualTo("활동중");
    }

    @Test
    @DisplayName("Success: 기본 채팅방이 없으면 지역 이름을 포함하여 생성하고 참여함")
    void joinDefaultRoom_shouldCreateRoomWithLocationName_whenRoomDoesNotExist() {
        // given
        int userId = 1;
        int locationId = 100;
        String districtName = "강남구";

        Location location = org.mockito.Mockito.mock(Location.class);
        given(location.getDistrictName()).willReturn(districtName);

        given(chatRoomRepository.findByLocationIdAndRoomType(locationId, RoomType.DEFAULT))
                .willReturn(Optional.empty());
        given(locationRepository.findById(locationId)).willReturn(Optional.of(location));
        
        // save 호출 시 인자 캡처를 위해 mock 설정
        given(chatRoomRepository.save(any(ChatRoom.class))).willAnswer(invocation -> {
            ChatRoom room = invocation.getArgument(0);
            ReflectionTestUtils.setField(room, "roomId", 1); // ID 할당 시뮬레이션
            return room;
        });

        // when
        int roomId = chatRoomService.joinDefaultRoom(userId, locationId);

        // then
        assertThat(roomId).isEqualTo(1);
        
        verify(chatRoomRepository).save(org.mockito.ArgumentMatchers.argThat(room -> 
            room.getTitle().equals("강남구 단체 채팅방") && 
            room.getRoomType() == RoomType.DEFAULT &&
            room.getLocationId() == locationId
        ));
        
        verify(chatRoomUserRepository).save(any(ChatRoomUser.class));
    }
}
