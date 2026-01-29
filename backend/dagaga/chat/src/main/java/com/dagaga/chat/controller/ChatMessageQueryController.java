package com.dagaga.chat.controller;

import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.repository.ChatMessageRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/rooms")
public class ChatMessageQueryController {

    private final ChatRoomService chatRoomService;
    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageQueryController(ChatRoomService chatRoomService,
                                      ChatMessageRepository chatMessageRepository) {
        this.chatRoomService = chatRoomService;
        this.chatMessageRepository = chatMessageRepository;
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
