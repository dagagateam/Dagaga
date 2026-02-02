package com.dagaga.controller;

import com.dagaga.domain.user.dto.UserLoginDto;
import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.service.UserService;
import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.security.dto.AuthResponse;
import com.dagaga.security.dto.RefreshTokenRequest;
import com.dagaga.security.jwt.JwtTokenProvider;
import com.dagaga.security.redis.RedisTokenService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;
    private final ChatRoomService chatRoomService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTokenService redisTokenService;

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
        try {
            chatRoomService.joinDefaultRoom(user.getUserId(), dto.getLocationId());
        } catch (Exception e) {
            // 채팅방 참여 실패가 회원가입 전체 실패로 이어지지 않도록 로그만 남김
            // 예: 기본 채팅방이 아직 생성되지 않은 경우 등
            // TODO: 기본 채팅방 없을 때 자동 생성
            System.err.println("Failed to join default chat room: " + e.getMessage());
        }

        return ResponseEntity.ok(user.getUserId());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid UserLoginDto dto) {
        // 사용자 인증
        User user = userService.authenticate(dto.getEmail(), dto.getPassword());

        // 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getUserId(),
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

        // 응답 생성
        AuthResponse response = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiry)
                .userId(user.getUserId())
                .email(user.getEmail())
                .locationId(user.getLocationId())
                .viewLangCode(user.getViewLangCode())
                .nativeLangCode(user.getNativeLangCode())
                .nickname(user.getNickname())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody @Valid RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

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
                user.getLocationId(),
                user.getViewLangCode(),
                user.getNativeLangCode(),
                user.getNickname());

        // 응답 생성
        AuthResponse response = AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Refresh Token은 유지
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiry)
                .userId(userId)
                .email(user.getEmail())
                .locationId(user.getLocationId())
                .viewLangCode(user.getViewLangCode())
                .nativeLangCode(user.getNativeLangCode())
                .nickname(user.getNickname())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        String accessToken = authHeader.substring(7);

        // 토큰 유효성 검사
        if (!jwtTokenProvider.validateToken(accessToken)) {
            return ResponseEntity.ok().build(); // 이미 유효하지 않으므로 무시
        }

        // 토큰 정보 추출
        Integer userId = jwtTokenProvider.getUserIdFromToken(accessToken);
        String accessTokenId = jwtTokenProvider.getTokenIdFromToken(accessToken);
        long remainingTtl = jwtTokenProvider.getRemainingExpiry(accessToken);

        // Access Token 블랙리스트 추가
        if (remainingTtl > 0) {
            redisTokenService.blacklistToken(accessTokenId, remainingTtl);
        }

        // 참고: 현재 보안을 위해 "모든 기기에서 로그아웃" 정책을 적용 중입니다.
        // 기기별 로그아웃을 구현하려면 클라이언트가 refreshToken을 본문에 보내야 하며, 해당 토큰만 삭제해야 합니다.
        redisTokenService.deleteAllUserRefreshTokens(userId);
        redisTokenService.removeAllUserSessions(userId);

        return ResponseEntity.ok().build();
    }
}
