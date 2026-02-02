package com.dagaga.security.context;

import com.dagaga.security.jwt.JwtAuthenticationFilter.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityContextHelper {

    /**
     * 현재 인증된 사용자 ID 조회
     */
    public static Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("인증된 사용자를 찾을 수 없습니다");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getUserId();
        }

        throw new IllegalStateException("유효하지 않은 인증 정보 타입입니다");
    }

    /**
     * 현재 사용자의 지역 ID 조회
     */
    public static Integer getCurrentLocationId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("인증된 사용자를 찾을 수 없습니다");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getLocationId();
        }

        throw new IllegalStateException("유효하지 않은 인증 정보 타입입니다");
    }

    /**
     * 현재 사용자 인증 정보(Principal) 조회
     */
    public static UserPrincipal getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("인증된 사용자를 찾을 수 없습니다");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return (UserPrincipal) principal;
        }

        throw new IllegalStateException("유효하지 않은 인증 정보 타입입니다");
    }

    /**
     * 사용자 인증 여부 확인
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null &&
                authentication.isAuthenticated() &&
                authentication.getPrincipal() instanceof UserPrincipal;
    }

    /**
     * 현재 사용자의 화면 표시 언어 코드 조회
     */
    public static String getCurrentViewLangCode() {
        UserPrincipal principal = getCurrentUserDetails();
        return principal.getViewLangCode();
    }

    /**
     * 현재 사용자의 모국어 코드 조회
     */
    public static String getCurrentNativeLangCode() {
        UserPrincipal principal = getCurrentUserDetails();
        return principal.getNativeLangCode();
    }
}
