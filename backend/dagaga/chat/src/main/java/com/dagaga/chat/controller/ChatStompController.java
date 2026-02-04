package com.dagaga.chat.controller;

import com.dagaga.chat.dto.MessageControllerDto.SendMessageRequest;
import com.dagaga.chat.dto.MessageControllerDto.SendMessageResponse;
import com.dagaga.chat.dto.MessageServiceDto.SaveMessageResult;
import com.dagaga.chat.service.ChatMessageService;
import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import com.dagaga.security.principal.UserPrincipal;
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
    private final UserRepository userRepository;

    public ChatStompController(SimpMessagingTemplate messagingTemplate,
            ChatMessageService chatMessageService,
            ChatRoomService chatRoomService,
            UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageService = chatMessageService;
        this.chatRoomService = chatRoomService;
        this.userRepository = userRepository;
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

        // 최신 닉네임과 프로필 이미지를 위해 User 엔티티 조회
        User sender = userRepository.findById(userPrincipal.getUserId().getValue())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 지역 검증
        chatRoomService.getRoomAndValidateLocation(req.roomId(), userPrincipal.getLocationId());

        // 메시지 저장 (번역 포함)
        SaveMessageResult savedResult = chatMessageService
                .save(req.toServiceDto(userPrincipal.getUserId().getValue(), userPrincipal.getNativeLangCode()));

        // 원문 언어 사용자들에게 전송
        // /sub/chat/rooms/{roomId}/{originalLang}
        SendMessageResponse originalPayload = SendMessageResponse.from(
                savedResult, 
                savedResult.message().getOriginalLang(),
                sender.getNickname(),
                sender.getProfileImage());
                
        messagingTemplate.convertAndSend(
                "/sub/chat/rooms/" + req.roomId() + "/" + savedResult.message().getOriginalLang(),
                originalPayload);

        // 번역된 언어 사용자들에게 전송
        // /sub/chat/rooms/{roomId}/{targetLang}
        if (savedResult.translations() != null) {
            savedResult.translations().forEach(translation -> {
                SendMessageResponse translatedPayload = SendMessageResponse.from(
                        savedResult, 
                        translation.getTargetLang(),
                        sender.getNickname(),
                        sender.getProfileImage());
                        
                messagingTemplate.convertAndSend(
                        "/sub/chat/rooms/" + req.roomId() + "/" + translation.getTargetLang(),
                        translatedPayload);
            });
        }
    }
}
