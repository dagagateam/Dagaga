package com.dagaga.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 인증 성공 시 반환되는 응답 DTO
 * (Refresh Token은 httpOnly 쿠키로 전달되므로 제외됨)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private Integer expiresIn;

    // JWT에 포함되어 있지만, 즉각적인 UI 처리를 위해 남겨둠
    private Integer userId;
    private String email;
    private Integer locationId;
    private String viewLangCode;
    private String nativeLangCode;
    private String nickname;
    private String profileImage;
}
