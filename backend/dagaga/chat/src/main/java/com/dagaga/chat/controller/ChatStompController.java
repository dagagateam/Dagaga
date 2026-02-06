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

        // 서비스 호출 및 응답 획득
        List<TargetedMessageResult> results = chatMessageService.processAndReturnResponses(
                req.toServiceDto(userPrincipal.getUserId().getValue(), userPrincipal.getNativeLangCode()),
                userPrincipal.getLocationId());

        // 각 대상 언어별로 메시지 전송
        results.forEach(result -> {
            SendMessageResponse response = new SendMessageResponse(
                    result.result().messageId(),
                    result.result().roomId(),
                    result.result().senderId(),
                    result.result().senderNickname(),
                    result.result().senderProfileImage(),
                    result.result().content(),
                    result.result().originalContent(),
                    result.result().originalLang(),
                    result.result().sentAt(),
                    result.result().type()
            );

            messagingTemplate.convertAndSend(
                    "/sub/chat/rooms/" + req.roomId() + "/" + result.targetLang(),
                    response);
        });
    }
}
