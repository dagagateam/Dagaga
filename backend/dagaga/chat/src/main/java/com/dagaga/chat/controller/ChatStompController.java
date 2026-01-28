package com.dagaga.chat.controller;

import com.dagaga.chat.dto.MessageDto.SendMessageRequest;
import com.dagaga.chat.dto.MessageDto.SendMessageResponse;
import com.dagaga.chat.service.ChatMessageService;
import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.entity.MessageTranslation;
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

        ChatMessageService.SavedMessage result = chatMessageService.save(
                req.roomId(),
                req.senderId(),
                req.originalText(),
                req.originalLang(),
                req.translatedLang(),
                req.translatedText()
        );

        ChatMessage saved = result.message();
        MessageTranslation translation = result.translation(); // 없으면 null

        // 브로드캐스트 payload
        SendMessageResponse payload = new SendMessageResponse(
                saved.getMessageId(),
                saved.getRoomId(),
                saved.getSenderId(),
                saved.getOriginalText(),
                saved.getOriginalLang(),
                translation != null ? translation.getTargetLang() : null,
                translation != null ? translation.getTranslatedText() : null,
                saved.getSentAt().toString()
        );


        messagingTemplate.convertAndSend("/sub/chat/rooms/" + req.roomId(), payload);
    }
}
