package com.dagaga.security.stomp;

import com.dagaga.security.jwt.JwtTokenProvider;
import com.dagaga.security.principal.UserPrincipal;
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

/**
 * STOMP 프로토콜 연결 시 JWT 인증을 처리하는 인터셉터
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class JwtStompInterceptor implements ChannelInterceptor {

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
        }

        return message;
    }
}
