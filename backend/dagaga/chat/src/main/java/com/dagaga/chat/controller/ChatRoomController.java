package com.dagaga.chat.controller;

import com.dagaga.chat.dto.ChatRoomResponse;
import com.dagaga.chat.dto.CreateChatRoomRequest;
import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.repository.ChatMessageRepository;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Chat API", description = "채팅 관련 API")
@RestController
@RequestMapping("/api/v1/community/chats")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Operation(summary = "사용자 커스텀 채팅방 생성", description = "사용자가 지역 기반으로 새로운 채팅방을 생성합니다.")
    @PostMapping
    public ResponseEntity<Integer> createCustomChatRoom(@RequestBody CreateChatRoomRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. id: " + request.getUserId()));

        int roomId = chatRoomService.createCustomRoom(
                user.getUserId(),
                user.getLocationId(),
                request.getTitle());

        return ResponseEntity.ok(roomId);
    }

    @Operation(summary = "채팅방 삭제", description = "채팅방을 삭제합니다.")
    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteChatRoom(
            @Parameter(description = "채팅방 ID") @PathVariable int roomId,
            @Parameter(description = "삭제하려고 하는 사용자 ID") @RequestParam int requesterId) {
        chatRoomService.deleteRoom(roomId, requesterId);
        return ResponseEntity.ok().build();
    }

    // 채팅방 참여
    @Operation(summary = "채팅방 참여", description = "사용자가 자신의 지역에 있는 유저 생성 채팅방에 참여합니다.")
    @PostMapping("/{roomId}/join")
    public ResponseEntity<Void> joinChatRoom(
            @Parameter(description = "채팅방 ID") @PathVariable int roomId,
            @Parameter(description = "사용자 ID") @RequestParam int userId,
            @Parameter(description = "사용자 지역 ID") @RequestParam int userLocationId) {
        chatRoomService.joinRoom(userId, userLocationId, roomId);
        return ResponseEntity.ok().build();
    }

    // 내 지역 방 목록
    @Operation(summary = "전체 채팅방 목록 조회: 지역 기반", description = "사용자의 지역에 있는 채팅방 목록을 조회합니다.")
    @GetMapping("/by-location")
    public List<ChatRoomResponse> listByLocation(
            @Parameter(description = "사용자 지역 ID") @RequestParam int userLocationId,
            @Parameter(description = "정렬 기준: 'popularity' 또는 'latest'") @RequestParam(required = false, defaultValue = "popularity") String sortBy) {
        return chatRoomService.getRoomsByLocation(userLocationId, sortBy);
    }

    // 내가 참여 중인 방 목록
    @Operation(summary = "참여 중인 채팅방 목록 조회", description = "사용자가 참여하고 있는 채팅방 목록을 조회합니다.")
    @GetMapping("/joined")
    public List<ChatRoomResponse> listJoinedRooms(@Parameter(description = "사용자 ID") @RequestParam int userId) {
        return chatRoomService.getRoomsByUserId(userId);
    }

    // 최신 메시지부터 {size}개 반환
    @Operation(summary = "채팅방별 메시지 조회", description = "채팅방의 메시지를 조회합니다. 기본적으로 30개의 메시지를 가져옵니다.")
    @GetMapping("/{roomId}/messages")
    public List<ChatMessage> getMessages(
            @Parameter(description = "채팅방 ID") @PathVariable int roomId,
            @Parameter(description = "사용자 지역 ID") @RequestParam int userLocationId,
            @Parameter(description = "기준 메시지 ID, null이면 가장 최신 메시지부터 가져옴") @RequestParam(required = false) Long cursor,
            @Parameter(description = "가져올 메시지 개수") @RequestParam(defaultValue = "30") int size) {
        // 지역 검증
        chatRoomService.getRoomAndValidateLocation(roomId, userLocationId);

        PageRequest page = PageRequest.of(0, Math.min(size, 100));

        if (cursor == null) {
            return chatMessageRepository.findByRoomIdOrderByMessageIdDesc(roomId, page);
        }

        // cursor가 있는 경우에는 messageId < cursor 조건으로 더 과거 메시지 반환
        return chatMessageRepository.findByRoomIdAndMessageIdLessThanOrderByMessageIdDesc(roomId, cursor, page);
    }
}
