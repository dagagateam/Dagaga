package com.dagaga.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class UserUpdateDto {
    private String password;
    private String nickname;
    private String viewLangCode;
    private String nativeLangCode;
    private Integer locationId;
    private LocalDate arrivalDate;
    private String profileImage;
}
