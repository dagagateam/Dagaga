package com.dagaga.chat.controller;

import com.dagaga.chat.dto.MessageControllerDto.SendMessageRequest;

import com.dagaga.chat.dto.MessageControllerDto.SendMessageResponse;
import com.dagaga.chat.dto.MessageServiceDto.TargetedMessageResult;
import com.dagaga.chat.service.ChatMessageService;
import com.dagaga.security.principal.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;

@Controller
public class ChatStompController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    public ChatStompController(SimpMessagingTemplate messagingTemplate,
            ChatMessageService chatMessageService) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageService = chatMessageService;
    }

    // 송신 -> /pub/chat/message
    // 수신 -> /sub/chat/rooms/{roomId}/{langCode}
    @MessageMapping("/chat/message")

    public void send(@Valid SendMessageRequest req, java.security.Principal principal) {
        // Principal에서 User 정보 추출
        if (principal == null) {
            throw new IllegalArgumentException("인증되지 않은 사용자입니다.");
        }

        Authentication auth = (Authentication) principal;
        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();

        // 서비스 호출 (비동기 처리로 변경되어 반환값 없음)
        chatMessageService.saveAndPublish(
                req.toServiceDto(userPrincipal.getUserId().getValue(), userPrincipal.getNativeLangCode()),
                userPrincipal.getLocationId());
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleValidationException(MethodArgumentNotValidException e) {
        return e.getBindingResult().getFieldError().getDefaultMessage();
    }
}
