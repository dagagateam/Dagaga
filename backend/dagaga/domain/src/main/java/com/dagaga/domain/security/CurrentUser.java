package com.dagaga.domain.security;

import com.dagaga.domain.user.value.UserId;

import java.util.Optional;

/**
 * 현재 인증된 사용자에 접근하기 위한 서비스 인터페이스
 */
public interface CurrentUser {
    /**
     * 현재 인증된 사용자의 ID를 반환
     */
    Optional<UserId> getUserId();

    /**
     * 현재 인증된 사용자의 정보를 반환
     */
    Optional<AuthPrincipal> getPrincipal();

    /**
     * 현재 사용자가 인증되었는지 확인
     */
    boolean isAuthenticated();

    /**
     * 현재 사용자의 지역 ID 반환
     */
    default Integer getLocationId() {
        return getPrincipal().map(AuthPrincipal::getLocationId).orElse(null);
    }

    /**
     * 현재 사용자의 화면 언어 코드 반환
     */
    default String getViewLangCode() {
        return getPrincipal().map(AuthPrincipal::getViewLangCode).orElse("ko");
    }

    /**
     * 현재 사용자의 모국어 코드 반환
     */
    default String getNativeLangCode() {
        return getPrincipal().map(AuthPrincipal::getNativeLangCode).orElse("ko");
    }
}
