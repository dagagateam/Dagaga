package com.dagaga.chat.controller;

import com.dagaga.chat.dto.CreateChatRoomRequest;
import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.repository.ChatMessageRepository;
import com.dagaga.domain.chat.room.entity.ChatRoom;
import com.dagaga.domain.chat.room.repository.ChatRoomRepository;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    @PostMapping
    public ResponseEntity<Integer> createCustomChatRoom(@RequestBody CreateChatRoomRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. id: " + request.getUserId()));

        int roomId = chatRoomService.createCustomRoom(
                user.getUserId(),
                user.getLocationId(),
                request.getTitle()
        );

        return ResponseEntity.ok(roomId);
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteChatRoom(@PathVariable int roomId, @RequestParam int requesterId) {
        chatRoomService.deleteRoom(roomId, requesterId);
        return ResponseEntity.ok().build();
    }

    // 기본방 참여 보장
    @PostMapping("/default/join")
    public int joinDefault(@RequestParam int userId, @RequestParam int locationId) {
        return chatRoomService.ensureDefaultRoomAndJoin(userId, locationId);
    }

    // 내 지역 방 목록
    @GetMapping("/by-location")
    public List<ChatRoom> listByLocation(@RequestParam int userLocationId) {
        return chatRoomRepository.findAllByLocationIdOrderByRoomTypeAscRoomIdAsc(userLocationId);
    }

    // 최신 메시지부터 {size}개 반환
    @GetMapping("/{roomId}/messages")
    public List<ChatMessage> getMessages(
            @PathVariable int roomId,
            @RequestParam int userLocationId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "30") int size
    ) {
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
