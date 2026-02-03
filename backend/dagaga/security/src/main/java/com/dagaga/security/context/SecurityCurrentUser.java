package com.dagaga.security.context;

import com.dagaga.domain.security.AuthPrincipal;
import com.dagaga.domain.security.CurrentUser;
import com.dagaga.domain.user.value.UserId;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Spring Security SecurityContextHolder를 통해 현재 사용자 정보를 조회하는 구현체
 */
@Component
public class SecurityCurrentUser implements CurrentUser {

    @Override
    public Optional<UserId> getUserId() {
        return getPrincipal().map(AuthPrincipal::getUserId);
    }

    @Override
    public Optional<AuthPrincipal> getPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthPrincipal) {
            return Optional.of((AuthPrincipal) principal);
        }

        return Optional.empty();
    }

    @Override
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    /**
     * 정적 유틸리티 메서드 (기존 코드와의 호환성을 위해 유지하되, 객체 지향적으로 사용 권장)
     */
    public static Integer getCurrentUserIdValue() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthPrincipal) {
            return ((AuthPrincipal) authentication.getPrincipal()).getUserId().getValue();
        }
        return null;
    }
}
