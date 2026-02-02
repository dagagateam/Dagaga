package com.dagaga.security.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisTokenService {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${security.max-concurrent-sessions}")
    private int maxConcurrentSessions;

    // ========== Refresh Token 관리 ==========

    /**
     * Redis에 Refresh Token 저장
     */
    public void saveRefreshToken(Integer userId, String tokenId, String token, long ttlSeconds) {
        String key = getRefreshTokenKey(userId, tokenId);
        
        Map<String, Object> tokenData = new HashMap<>();
        tokenData.put("token", token);
        tokenData.put("createdAt", LocalDateTime.now().toString());
        tokenData.put("lastUsedAt", LocalDateTime.now().toString());
        
        try {
            String value = objectMapper.writeValueAsString(tokenData);
            redisTemplate.opsForValue().set(key, value, ttlSeconds, TimeUnit.SECONDS);
            log.info("사용자 {}의 Refresh Token 저장 완료 (TTL: {}초)", userId, ttlSeconds);
        } catch (JsonProcessingException e) {
            log.error("Refresh Token 데이터 직렬화 실패", e);
            throw new RuntimeException("Refresh Token 저장 실패", e);
        }
    }

    /**
     * Redis에서 Refresh Token 조회
     */
    public String getRefreshToken(Integer userId, String tokenId) {
        String key = getRefreshTokenKey(userId, tokenId);
        String value = redisTemplate.opsForValue().get(key);
        
        if (value == null) {
            log.warn("Refresh Token을 찾을 수 없음 (사용자: {}, 토큰: {})", userId, tokenId);
            return null;
        }
        
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> tokenData = objectMapper.readValue(value, Map.class);
            
            // 마지막 사용 시간 업데이트
            tokenData.put("lastUsedAt", LocalDateTime.now().toString());
            String updatedValue = objectMapper.writeValueAsString(tokenData);
            
            Long ttl = redisTemplate.getExpire(key,TimeUnit.SECONDS);
            if (ttl != null && ttl > 0) {
                redisTemplate.opsForValue().set(key, updatedValue, ttl, TimeUnit.SECONDS);
            }
            
            return (String) tokenData.get("token");
        } catch (JsonProcessingException e) {
            log.error("Refresh Token 데이터 역직렬화 실패", e);
            return null;
        }
    }

    /**
     * Redis에서 Refresh Token 삭제
     */
    public void deleteRefreshToken(Integer userId, String tokenId) {
        String key = getRefreshTokenKey(userId, tokenId);
        redisTemplate.delete(key);
        log.info("사용자 {}의 Refresh Token 삭제 완료 (토큰: {})", userId, tokenId);
    }

    /**
     * 사용자의 모든 Refresh Token 삭제
     */
    public void deleteAllUserRefreshTokens(Integer userId) {
        String pattern = "refresh_token:" + userId + ":*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.info("사용자 {}의 Refresh Token {}개 삭제 완료", userId, keys.size());
        }
    }

    // ========== Access Token 블랙리스트 ==========

    /**
     * Access Token 블랙리스트 추가
     */
    public void blacklistToken(String tokenId, long ttlSeconds) {
        String key = getBlacklistKey(tokenId);
        redisTemplate.opsForValue().set(key, "revoked", ttlSeconds, TimeUnit.SECONDS);
        log.info("토큰 블랙리스트 추가 완료 (토큰: {}, TTL: {}초)", tokenId, ttlSeconds);
    }

    /**
     * 토큰 블랙리스트 여부 확인
     */
    public boolean isTokenBlacklisted(String tokenId) {
        String key = getBlacklistKey(tokenId);
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    // ========== 동시 세션 관리 ==========

    /**
     * 사용자 세션 추가 및 동시 세션 제한 적용
     */
    public void addUserSession(Integer userId, String sessionId) {
        String key = getUserSessionsKey(userId);
        
        // 새로운 세션 추가
        redisTemplate.opsForSet().add(key, sessionId);
        
        // 세션 수 확인
        Long sessionCount = redisTemplate.opsForSet().size(key);
        if (sessionCount != null && sessionCount > maxConcurrentSessions) {
            // 가장 오래된 세션 제거 (실제로는 Redis Set이 순서가 없으므로 임의 삭제됨)
            // 정확한 구현을 위해서는 Sorted Set과 타임스탬프를 사용해야 함
            Set<String> sessions = redisTemplate.opsForSet().members(key);
            if (sessions != null && !sessions.isEmpty()) {
                String oldestSession = sessions.iterator().next();
                redisTemplate.opsForSet().remove(key, oldestSession);
                log.info("사용자 {}의 가장 오래된 세션 제거 완료 (세션: {}, 제한: {})", 
                        userId, oldestSession, maxConcurrentSessions);
                
                // 필요 시 구 세션의 토큰도 블랙리스트 처리
                // 이를 위해서는 세션-토큰 매핑 저장이 필요함
            }
        }
        
        log.info("사용자 {}의 세션 추가 완료 (세션: {}, 총 세션 수: {})", userId, sessionId, 
                redisTemplate.opsForSet().size(key));
    }

    /**
     * 사용자 세션 제거
     */
    public void removeUserSession(Integer userId, String sessionId) {
        String key = getUserSessionsKey(userId);
        redisTemplate.opsForSet().remove(key, sessionId);
        log.info("사용자 {}의 세션 제거 완료 (세션: {})", userId, sessionId);
    }

    /**
     * 사용자의 활성 세션 수 조회
     */
    public long getUserSessionCount(Integer userId) {
        String key = getUserSessionsKey(userId);
        Long count = redisTemplate.opsForSet().size(key);
        return count != null ? count : 0;
    }

    /**
     * 사용자의 모든 세션 제거
     */
    public void removeAllUserSessions(Integer userId) {
        String key = getUserSessionsKey(userId);
        redisTemplate.delete(key);
        log.info("사용자 {}의 모든 세션 제거 완료", userId);
    }

    // ========== Helper Methods ==========

    private String getRefreshTokenKey(Integer userId, String tokenId) {
        return String.format("refresh_token:%d:%s", userId, tokenId);
    }

    private String getBlacklistKey(String tokenId) {
        return String.format("blacklist:%s", tokenId);
    }

    private String getUserSessionsKey(Integer userId) {
        return String.format("user_sessions:%d", userId);
    }
}
