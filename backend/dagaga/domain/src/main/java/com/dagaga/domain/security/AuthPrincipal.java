package com.dagaga.domain.security;

import com.dagaga.domain.user.value.UserId;

import java.util.Collection;

/**
 * 인증된 사용자의 정보를 나타내는 추상화 인터페이스
 */
public interface AuthPrincipal {
    /**
     * 사용자 ID 반환
     */
    UserId getUserId();

    /**
     * 사용자 이름/식별자 반환
     */
    String getUsername();

    /**
     * 사용자 권한 목록 반환
     */
    Collection<String> getAuthorities();

    /**
     * 사용자 지역 ID 반환
     */
    Integer getLocationId();

    /**
     * 사용자 화면 언어 코드 반환
     */
    String getViewLangCode();

    /**
     * 사용자 모국어 코드 반환
     */
    String getNativeLangCode();
}
