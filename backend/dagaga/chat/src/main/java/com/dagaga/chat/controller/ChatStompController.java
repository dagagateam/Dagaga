package com.dagaga.chat.controller;

import com.dagaga.chat.dto.MessageControllerDto.SendMessageRequest;
import com.dagaga.chat.dto.MessageControllerDto.SendMessageResponse;
import com.dagaga.chat.dto.MessageServiceDto.SaveMessageResult;
import com.dagaga.chat.service.ChatMessageService;
import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.security.principal.UserPrincipal;
import com.dagaga.domain.user.value.UserId;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
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
    public void send(@Valid SendMessageRequest req, java.security.Principal principal) {
        // Principal에서 User 정보 추출
        if (principal == null) {
            throw new IllegalArgumentException("인증되지 않은 사용자입니다.");
        }

        Authentication auth = (Authentication) principal;
        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();

        // 지역 검증
        chatRoomService.getRoomAndValidateLocation(req.roomId(), userPrincipal.getLocationId());

        // 메시지 저장
        SaveMessageResult savedResult = chatMessageService
                .save(req.toServiceDto(userPrincipal.getUserId().getValue(), userPrincipal.getNativeLangCode()));

        // 브로드캐스트 payload
        SendMessageResponse payload = SendMessageResponse.from(savedResult);

        messagingTemplate.convertAndSend("/sub/chat/rooms/" + req.roomId(), payload);
    }
}
