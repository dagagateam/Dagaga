package com.dagaga.chat.controller;

import com.dagaga.chat.dto.MessageControllerDto.SendMessageRequest;
import com.dagaga.chat.dto.MessageControllerDto.SendMessageResponse;
import com.dagaga.chat.dto.MessageServiceDto.SaveMessageResult;
import com.dagaga.chat.service.ChatMessageService;
import com.dagaga.chat.service.ChatRoomService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatStompController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;
    private final ChatRoomService chatRoomService;

    public ChatStompController(SimpMessagingTemplate messagingTemplate,
                               ChatMessageService chatMessageService,
                               ChatRoomService chatRoomService) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageService = chatMessageService;
        this.chatRoomService = chatRoomService;
    }

    // 송신 -> /pub/chat/message
    // 수신 -> /sub/chat/rooms/{roomId}
    @MessageMapping("/chat/message")
    public void send(@Valid SendMessageRequest req) {
        // 지역 검증
        chatRoomService.getRoomAndValidateLocation(req.roomId(), req.senderLocationId());

        SaveMessageResult savedResult = chatMessageService.save(req.toServiceDto());

        // 브로드캐스트 payload
        SendMessageResponse payload = SendMessageResponse.from(savedResult);

        messagingTemplate.convertAndSend("/sub/chat/rooms/" + req.roomId(), payload);
    }
}
