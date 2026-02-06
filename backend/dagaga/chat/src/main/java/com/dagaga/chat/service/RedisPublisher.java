package com.dagaga.chat.service;

import com.dagaga.chat.dto.MessageControllerDto.SendMessageResponse;
import com.dagaga.chat.dto.RedisChatPayload;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

@Service
public class RedisPublisher {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ChannelTopic channelTopic;

    public RedisPublisher(@Qualifier("chatRedisTemplate") RedisTemplate<String, Object> redisTemplate, ChannelTopic channelTopic) {
        this.redisTemplate = redisTemplate;
        this.channelTopic = channelTopic;
    }

    public void publish(String destination, SendMessageResponse content) {
        RedisChatPayload payload = new RedisChatPayload(destination, content);
        redisTemplate.convertAndSend(channelTopic.getTopic(), payload);
    }
}
