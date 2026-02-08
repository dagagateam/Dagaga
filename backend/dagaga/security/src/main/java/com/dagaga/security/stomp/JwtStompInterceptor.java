package com.dagaga.security.stomp;

import com.dagaga.security.jwt.JwtTokenProvider;
import com.dagaga.security.principal.UserPrincipal;
import com.dagaga.domain.chat.user.repository.ChatRoomUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * STOMP 프로토콜 연결 시 JWT 인증을 처리하는 인터셉터
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class JwtStompInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final ChatRoomUserRepository chatRoomUserRepository;
    private final StringRedisTemplate redisTemplate;

    private static final long SUBSCRIPTION_CACHE_TTL = 3600; // 1시간

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String token = accessor.getFirstNativeHeader("Authorization");

                if (token != null && token.startsWith("Bearer ")) {
                    token = token.substring(7);

                    if (jwtTokenProvider.validateToken(token)) {
                        Integer userId = jwtTokenProvider.getUserIdFromToken(token);
                        Integer locationId = jwtTokenProvider.getLocationIdFromToken(token);
                        String nativeLangCode = jwtTokenProvider.getNativeLangCodeFromToken(token);
                        String viewLangCode = jwtTokenProvider.getViewLangCodeFromToken(token);

                        if (userId != null) {
                            UserPrincipal principal = new UserPrincipal(userId, locationId, viewLangCode, nativeLangCode);
                            Authentication auth = new UsernamePasswordAuthenticationToken(principal, null,
                                    principal.getAuthorities().stream()
                                            .map(SimpleGrantedAuthority::new)
                                            .collect(Collectors.toList()));

                            accessor.setUser(auth);
                            SecurityContextHolder.getContext().setAuthentication(auth);
                            log.debug("STOMP 연결 성공: userId={}, locationId={}", userId, locationId);
                        }
                    } else {
                        log.warn("STOMP 연결 실패: 유효하지 않은 JWT 토큰입니다.");
                        throw new IllegalArgumentException("Invalid token");
                    }
                } else {
                    log.warn("STOMP 연결 실패: Authorization 헤더가 누락되었습니다.");
                    throw new IllegalArgumentException("Authorization header is missing");
                }
            } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                String destination = accessor.getDestination();
                if (destination != null && destination.startsWith("/sub/chat/rooms/")) {
                    String roomIdStr = destination.substring("/sub/chat/rooms/".length());
                    
                    // 언어별 토픽인 경우 (/sub/chat/rooms/{roomId}/{langCode}) 처리
                    if (roomIdStr.contains("/")) {
                        roomIdStr = roomIdStr.substring(0, roomIdStr.indexOf("/"));
                    }

                    try {
                        Integer roomId = Integer.parseInt(roomIdStr);
                        Authentication auth = (Authentication) accessor.getUser();
                        
                        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
                            log.warn("STOMP 구독 실패: 인증되지 않은 사용자");
                            throw new IllegalArgumentException("Unauthorized");
                        }

                        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
                        Integer userId = principal.getUserIdValue();
                        
                        // Redis 캐시 Key
                        String cacheKey = "chat:room:" + roomId + ":members:" + userId;
                        String cachedAuth = redisTemplate.opsForValue().get(cacheKey);
                        
                        if ("NORMAL".equals(cachedAuth)) {
                             // Authorized
                             log.debug("STOMP 구독 허용 (Cache Hit): userId={}, roomId={}", userId, roomId);
                             return message;
                        }

                        com.dagaga.domain.chat.user.entity.ChatRoomUserId id = 
                            new com.dagaga.domain.chat.user.entity.ChatRoomUserId(roomId, userId);
                            
                        boolean isMember = chatRoomUserRepository.findById(id)
                                .map(user -> user.getStatus() == com.dagaga.domain.chat.user.entity.UserStatus.ACTIVE)
                                .orElse(false);

                        if (!isMember) {
                            log.warn("STOMP 구독 차단: 방 멤버가 아님 (userId={}, roomId={})", userId, roomId);
                            throw new IllegalArgumentException("Access Denied: Not a member of the room");
                        }
                        
                        // Cache 저장 (1시간 TTL)
                        redisTemplate.opsForValue().set(cacheKey, "NORMAL", SUBSCRIPTION_CACHE_TTL, java.util.concurrent.TimeUnit.SECONDS);
                        log.debug("STOMP 구독 허용 (DB & Cache): userId={}, roomId={}", userId, roomId);

                    } catch (NumberFormatException e) {
                        log.warn("STOMP 구독 실패: 잘못된 방 번호 형식 ({})", roomIdStr);
                    }
                }
            }
        }

        return message;
    }
}
