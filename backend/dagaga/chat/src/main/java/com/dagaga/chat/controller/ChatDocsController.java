package com.dagaga.chat.controller;

import com.dagaga.chat.dto.MessageControllerDto.SendMessageRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Chat STOMP API", description = "STOMP 소켓 연결 (프로토콜 사용 안내를 위한 가상 API: 반드시 description 참고)")
@RestController
public class ChatDocsController {

    @Operation(summary = "소켓 연결 (Connect)", 
               description = "WebSocket 연결 엔드포인트입니다.<br>" + 
                             "<b>URL:</b> <code>ws://{domain}/ws-chat</code><br>" + 
                             "SockJS 사용 시: <code>http://{domain}/ws-chat</code>")
    @GetMapping("/connect")
    public void connect() {
    }

    @Operation(summary = "메시지 구독 (Subscribe)", 
               description = "특정 채팅방의 메시지를 수신하기 위해 구독합니다.<br>" + 
                             "<b>Destination:</b> <code>/sub/chat/rooms/{roomId}</code>")
    @GetMapping("/subscribe")
    public void subscribe() {
    }

    @Operation(summary = "메시지 전송 (Publish)", 
               description = "채팅방에 메시지를 전송합니다.<br>" + 
                             "<b>Destination:</b> <code>/pub/chat/message</code>")
    @PostMapping("/send")
    public void sendMessage(@RequestBody(description = "메시지 전송 json") SendMessageRequest request) {
    }
}
