package com.dagaga.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRegisterDto {
    private String email;
    private String password;
    private String nickname;
    private String viewLangCode;
    private String nativeLangCode;
    private Long locationId;
    private LocalDate arrivalDate;
}
