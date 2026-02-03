package com.dagaga.controller;

import com.dagaga.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.dagaga.security.jwt.JwtTokenProvider;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Test Auth", description = "테스트용 인증 API")
public class TestAuthController {

    private final JwtTokenProvider jwtTokenProvider;

    @Operation(summary = "테스트용 JWT 토큰 생성", description = "개발 및 테스트를 위한 임시 JWT 액세스 토큰을 반환합니다.")
    @GetMapping("/test-token")
    public ApiResponse<Map<String, String>> getTestToken() {
        log.info("Generating test JWT token");

        // 테스트용 계정 정보 (Mock: test1@dagaga.com)
        Integer testUserId = 1;
        String testEmail = "test1@dagaga.com";
        Integer testLocationId = 229;
        String testViewLangCode = "ko";
        String testNativeLangCode = "vi"; // 베트남어 (테스트용)

        String accessToken = jwtTokenProvider.generateAccessToken(
                testUserId, testEmail, testLocationId, testViewLangCode, testNativeLangCode,
                null, // nickname
                10L * 365 * 24 * 60 * 60 * 1000, true); // 10년 만료, 테스트 토큰 플래그 포함

        Map<String, String> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("tokenType", "Bearer");
        response.put("expiresAt", "10 years (long-lived)");

        return ApiResponse.success("테스트 토큰 생성 성공 (10년 장기 세션)", response);
    }
}
