package com.dagaga.chat.config;

import com.dagaga.chat.service.RedisSubscriber;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.beans.factory.annotation.Value;

@Configuration("chatRedisConfig")
@RequiredArgsConstructor
public class RedisConfig {

    private final RedisSubscriber redisSubscriber;
    private final ObjectMapper objectMapper;

    @Value("${chat.redis.topic:chat-topic}")
    private String topicName;

    @Bean
    public ChannelTopic channelTopic() {
        return new ChannelTopic(topicName);
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(redisSubscriber, channelTopic());
        return container;
    }

    @Bean("chatRedisTemplate")
    public RedisTemplate<String, Object> chatRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(connectionFactory);
        
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(objectMapper, Object.class);
        
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(serializer);
        return redisTemplate;
    }
}
