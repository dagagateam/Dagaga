package com.dagaga.chat.controller;

import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.domain.chat.room.entity.ChatRoom;
import com.dagaga.domain.chat.room.repository.ChatRoomRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/rooms")
public class ChatRoomQueryController {

    private final ChatRoomService chatRoomService;
    private final ChatRoomRepository chatRoomRepository;

    public ChatRoomQueryController(ChatRoomService chatRoomService,
                                   ChatRoomRepository chatRoomRepository) {
        this.chatRoomService = chatRoomService;
        this.chatRoomRepository = chatRoomRepository;
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
}
