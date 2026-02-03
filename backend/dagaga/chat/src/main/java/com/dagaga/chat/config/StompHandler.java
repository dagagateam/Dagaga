package com.dagaga.chat.config;

import com.dagaga.domain.security.jwt.JwtTokenProvider;
import com.dagaga.domain.security.UserPrincipal;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class StompHandler implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                
                if (jwtTokenProvider.validateToken(token)) {
                    Integer userId = jwtTokenProvider.getUserIdFromToken(token);
                    Integer locationId = jwtTokenProvider.getLocationIdFromToken(token);
                    String nativeLangCode = jwtTokenProvider.getNativeLangCodeFromToken(token);
                    String viewLangCode = jwtTokenProvider.getViewLangCodeFromToken(token);
                    
                    if (userId != null) {
                        UserPrincipal principal = UserPrincipal.create(userId, locationId, viewLangCode, nativeLangCode);
                        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                        
                        accessor.setUser(auth);
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        log.info("STOMP 연결 성공: userId={}, locationId={}", userId, locationId);
                    }
                } else {
                    log.warn("STOMP 연결 실패: 유효하지 않은 JWT 토큰입니다.");
                    throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
                }
            } else {
                log.warn("STOMP 연결 실패: Authorization 헤더가 필요합니다.");
                throw new IllegalArgumentException("Authorization 헤더가 누락되었습니다."); 
            }
        }
        
        return message; 
    }
}
