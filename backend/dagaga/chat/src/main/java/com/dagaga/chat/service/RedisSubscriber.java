package com.dagaga.chat.service;

import com.dagaga.chat.dto.RedisChatPayload;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final SimpMessageSendingOperations messagingTemplate;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            RedisChatPayload payload = objectMapper.readValue(message.getBody(), RedisChatPayload.class);
            log.debug("Redis Sub: dest={}, content={}", payload.getDestination(), payload.getContent());
            
            // WebSocket 구독자에게 전송
            messagingTemplate.convertAndSend(payload.getDestination(), payload.getContent());
        } catch (Exception e) {
            log.error("Redis 메시지 처리 실패", e);
        }
    }
}
