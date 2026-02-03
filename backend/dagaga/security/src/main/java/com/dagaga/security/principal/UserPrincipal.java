package com.dagaga.security.principal;

import com.dagaga.domain.security.AuthPrincipal;
import com.dagaga.domain.user.value.UserId;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Collection;
import java.util.Collections;

/**
 * Spring Security Context에 저장할 인증된 사용자 정보 구현체
 */
@Getter
@RequiredArgsConstructor
public class UserPrincipal implements AuthPrincipal {
    private final Integer userIdValue;
    private final Integer locationId;
    private final String viewLangCode;
    private final String nativeLangCode;

    @Override
    public UserId getUserId() {
        return UserId.of(userIdValue);
    }

    @Override
    public String getUsername() {
        return String.valueOf(userIdValue);
    }

    @Override
    public Collection<String> getAuthorities() {
        // TODO: 실제 권한 컬럼 연동 필요
        return Collections.singletonList("ROLE_USER");
    }

    @Override
    public Integer getLocationId() {
        return locationId;
    }

    @Override
    public String getViewLangCode() {
        return viewLangCode;
    }

    @Override
    public String getNativeLangCode() {
        return nativeLangCode;
    }
}
