package com.dagaga.security.oauth;

import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.service.UserService;
import com.dagaga.domain.security.jwt.JwtTokenProvider;
import com.dagaga.security.redis.RedisTokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTokenService redisTokenService;

    @Value("${app.oauth2.frontend-redirect-uri}")
    private String frontendRedirectUri;

    @Value("${app.oauth2.frontend-signup-uri}")
    private String frontendSignupUri;

    @Value("${jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        Optional<User> userOptional = userService.findByEmail(email);

        String targetUrl;
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // 기존 유저: 토큰 생성 후 프론트엔드 성공 페이지로 리다이렉트
            String accessToken = jwtTokenProvider.generateAccessToken(
                    user.getUserId(),
                    user.getLocationId(),
                    user.getViewLangCode(),
                    user.getNativeLangCode(),
                    user.getNickname());
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());
            String refreshTokenId = jwtTokenProvider.getTokenIdFromToken(refreshToken);

            redisTokenService.saveRefreshToken(user.getUserId(), refreshTokenId, refreshToken, refreshTokenExpiry);
            redisTokenService.addUserSession(user.getUserId(), refreshTokenId);

            targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                    .queryParam("accessToken", accessToken)
                    .queryParam("refreshToken", refreshToken)
                    .build().toUriString();
        } else {
            // 신규 유저: 회원가입 페이지로 리다이렉트 (이메일 포함)
            targetUrl = UriComponentsBuilder.fromUriString(frontendSignupUri)
                    .queryParam("email", email)
                    .build().toUriString();
        }

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
