package com.dagaga.security.jwt;

import com.dagaga.domain.security.UserPrincipal;
import com.dagaga.security.redis.RedisTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import com.dagaga.domain.security.jwt.JwtTokenProvider;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTokenService redisTokenService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String token = extractTokenFromRequest(request);

            if (token != null) {
                log.debug("Found JWT token in request: {}", token);
                if (jwtTokenProvider.validateToken(token)) {
                    // 테스트용 토큰인 경우 블랙리스트 확인 건너뜀 (장기 세션 허용)
                    boolean isTestToken = jwtTokenProvider.isTestToken(token);
                    String tokenId = jwtTokenProvider.getTokenIdFromToken(token);
                    boolean isBlacklisted = false;

                    if (!isTestToken) {
                        // 토큰 블랙리스트 확인
                        try {
                            isBlacklisted = redisTokenService.isTokenBlacklisted(tokenId);
                        } catch (Exception e) {
                            log.error("Redis 블랙리스트 확인 중 오류 발생 (무시하고 진행): {}", e.getMessage());
                        }
                    } else {
                        log.debug("테스트 토큰이므로 블랙리스트 확인을 건너뜁니다.");
                    }

                    if (isBlacklisted) {
                        log.warn("블랙리스트에 등록된 토큰 사용 시도: {}", tokenId);
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // 사용자 정보 추출
                    Integer userId = jwtTokenProvider.getUserIdFromToken(token);
                    Integer locationId = jwtTokenProvider.getLocationIdFromToken(token);
                    String viewLangCode = jwtTokenProvider.getViewLangCodeFromToken(token);
                    String nativeLangCode = jwtTokenProvider.getNativeLangCodeFromToken(token);

                    log.debug("Token claims - userId: {}, locationId: {}, nativeLang: {}", userId, locationId,
                            nativeLangCode);

                    // 인증 객체 생성
                    UserPrincipal userPrincipal = new UserPrincipal(userId, locationId, viewLangCode, nativeLangCode);

                    // TODO: 추후 DB의 role 컬럼 값을 사용하여 동적으로 권한을 부여하도록 수정 필요
                    // 현재는 모든 사용자에게 ROLE_USER를 하드코딩으로 부여 중
                    // 이후 ROLE_ADMIN 등을 통해 관리자 기능 구현 예정
                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                            new SimpleGrantedAuthority("ROLE_USER"));

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userPrincipal,
                            null,
                            authorities);

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    log.debug("사용자 인증 정보 설정 완료 (userId: {})", userId);
                } else {
                    log.warn("JWT 토큰 검증 실패: {}", token);
                }
            }
        } catch (Exception e) {
            log.error("사용자 인증 설정 실패", e);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * 요청 헤더에서 JWT 토큰 추출
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}
