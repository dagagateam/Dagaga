package com.dagaga.domain.security;

import lombok.Getter;
import java.util.Collection;
import java.util.Collections;
import org.springframework.security.core.GrantedAuthority;

@Getter
public class UserPrincipal {
    private final Integer userId;
    private final Integer locationId;
    private final String viewLangCode;
    private final String nativeLangCode;

    public UserPrincipal(Integer userId, Integer locationId, String viewLangCode, String nativeLangCode) {
        this.userId = userId;
        this.locationId = locationId;
        this.viewLangCode = viewLangCode;
        this.nativeLangCode = nativeLangCode;
    }

    public static UserPrincipal create(Integer userId, Integer locationId, String viewLangCode, String nativeLangCode) {
        return new UserPrincipal(userId, locationId, viewLangCode, nativeLangCode);
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }
}
