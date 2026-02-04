package com.dagaga.controller;

import com.dagaga.domain.user.dto.SocialSignupDto;
import com.dagaga.domain.user.dto.UserLoginDto;
import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.dto.UserResponseDto;
import com.dagaga.domain.user.dto.UserUpdateDto;
import com.dagaga.domain.user.dto.PasswordVerifyRequest;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.service.UserService;

import com.dagaga.security.dto.AuthResponse;
import com.dagaga.security.jwt.JwtTokenProvider;
import com.dagaga.domain.security.CurrentUser;
import com.dagaga.domain.user.value.UserId;
import com.dagaga.security.redis.RedisTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTokenService redisTokenService;
    private final CurrentUser currentUser;


    @Value("${jwt.access-token-expiry}")
    private int accessTokenExpiry;

    @Value("${jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @PostMapping("/check-email")
    public ResponseEntity<Void> checkEmail(@RequestParam("email") @Email String email) {
        userService.checkEmailDuplicate(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/check-nickname")
    public ResponseEntity<Void> checkNickname(@RequestParam("nickname") String nickname) {
        userService.checkNicknameDuplicate(nickname);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/signup")
    public ResponseEntity<Integer> register(@RequestBody @Valid UserRegisterDto dto) {
        User user = userService.register(dto);

        // 회원가입 후 해당 지역의 기본 채팅방 자동 참여

        return ResponseEntity.ok(user.getUserId());
    }

    @PostMapping("/social-signup")
    public ResponseEntity<AuthResponse> socialSignup(
            @RequestBody @Valid SocialSignupDto dto,
            HttpServletResponse response) {
        User user = userService.registerSocialUser(dto);

        // 토큰 생성 및 응답
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getUserId(),
                user.getEmail(),
                user.getLocationId(),
                user.getViewLangCode(),
                user.getNativeLangCode(),
                user.getNickname());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());
        String refreshTokenId = jwtTokenProvider.getTokenIdFromToken(refreshToken);

        redisTokenService.saveRefreshToken(user.getUserId(), refreshTokenId, refreshToken, refreshTokenExpiry);
        redisTokenService.addUserSession(user.getUserId(), refreshTokenId);

        // Refresh Token을 httpOnly 쿠키에 저장
        setRefreshTokenCookie(response, refreshToken);

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiry)
                .userId(user.getUserId())
                .email(user.getEmail())
                .locationId(user.getLocationId())
                .viewLangCode(user.getViewLangCode())
                .nativeLangCode(user.getNativeLangCode())
                .nickname(user.getNickname())
                .build();

        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser() {
        Integer userId = currentUser.getUserId()
                .map(UserId::getValue)
                .orElseThrow(() -> new IllegalArgumentException("인증된 사용자 정보를 찾을 수 없습니다."));
        return ResponseEntity.ok(userService.getUserResponse(userId));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponseDto> updateCurrentUser(@RequestBody @Valid UserUpdateDto dto) {
        Integer userId = currentUser.getUserId()
                .map(UserId::getValue)
                .orElseThrow(() -> new IllegalArgumentException("인증된 사용자 정보를 찾을 수 없습니다."));

        UserResponseDto updatedUser = userService.updateUser(userId, dto);

        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid UserLoginDto dto, HttpServletResponse response) {
        // 사용자 인증
        User user = userService.authenticate(dto.getEmail(), dto.getPassword());

        // 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getUserId(),
                user.getEmail(),
                user.getLocationId(),
                user.getViewLangCode(),
                user.getNativeLangCode(),
                user.getNickname());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());

        // 토큰 ID 추출
        String refreshTokenId = jwtTokenProvider.getTokenIdFromToken(refreshToken);

        // Redis에 Refresh Token 저장
        redisTokenService.saveRefreshToken(user.getUserId(), refreshTokenId, refreshToken, refreshTokenExpiry);

        // 동시 세션 관리
        redisTokenService.addUserSession(user.getUserId(), refreshTokenId);

        // Refresh Token을 httpOnly 쿠키에 저장
        setRefreshTokenCookie(response, refreshToken);

        // 응답 생성
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiry)
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .locationId(user.getLocationId())
                .viewLangCode(user.getViewLangCode())
                .nativeLangCode(user.getNativeLangCode())
                .build();

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {

        if (refreshToken == null) {
            throw new IllegalArgumentException("Refresh token is missing");
        }

        // Refresh Token 유효성 검사
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        // 토큰 타입 확인
        if (!"refresh".equals(jwtTokenProvider.getTokenType(refreshToken))) {
            throw new IllegalArgumentException("Token is not a refresh token");
        }

        // 사용자 ID 및 토큰 ID 추출
        Integer userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        String tokenId = jwtTokenProvider.getTokenIdFromToken(refreshToken);

        // Redis에 토큰 존재 여부 확인
        String storedToken = redisTokenService.getRefreshToken(userId, tokenId);
        if (storedToken == null || !storedToken.equals(refreshToken)) {
            throw new IllegalArgumentException("Refresh token not found or expired");
        }

        // 현재 위치 정보를 위해 사용자 조회
        User user = userService.getUserById(userId);

        // 새로운 Access Token 생성
        String newAccessToken = jwtTokenProvider.generateAccessToken(
                userId,
                user.getEmail(),
                user.getLocationId(),
                user.getViewLangCode(),
                user.getNativeLangCode(),
                user.getNickname());

        // 응답 생성
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiry)
                .userId(userId)
                .email(user.getEmail())
                .locationId(user.getLocationId())
                .viewLangCode(user.getViewLangCode())
                .nativeLangCode(user.getNativeLangCode())
                .nickname(user.getNickname())
                .build();

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authHeader,
            HttpServletResponse response) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        String accessToken = authHeader.substring(7);

        // 토큰 유효성 검사
        if (!jwtTokenProvider.validateToken(accessToken)) {
            return ResponseEntity.ok().build();
        }

        // 토큰 정보 추출
        Integer userId = jwtTokenProvider.getUserIdFromToken(accessToken);
        String accessTokenId = jwtTokenProvider.getTokenIdFromToken(accessToken);
        long remainingTtl = jwtTokenProvider.getRemainingExpiry(accessToken);

        // Access Token 블랙리스트 추가
        if (remainingTtl > 0) {
            redisTokenService.blacklistToken(accessTokenId, remainingTtl);
        }

        redisTokenService.deleteAllUserRefreshTokens(userId);
        redisTokenService.removeAllUserSessions(userId);

        // Refresh Token 쿠키 삭제
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        response.addCookie(cookie);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-password")
    public ResponseEntity<Void> verifyPassword(@RequestBody PasswordVerifyRequest request) {
        Integer userId = currentUser.getUserId()
                .map(UserId::getValue)
                .orElseThrow(() -> new IllegalArgumentException("인증된 사용자 정보를 찾을 수 없습니다."));

        userService.verifyPassword(userId, request.getPassword());
        return ResponseEntity.ok().build();
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // HTTPS 개발 환경 또는 운영 환경
        cookie.setPath("/");
        cookie.setMaxAge((int) refreshTokenExpiry);
        response.addCookie(cookie);
    }
}
