package com.dagaga.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class UserUpdateDto {
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[*+-])[A-Za-z\\d*+-]{8,}$", 
            message = "비밀번호는 최소 8자 이상, 영문, 숫자, 특수문자(*, +, -)만 포함해야 합니다")
    private String password;
    private String nickname;
    private String viewLangCode;
    private String nativeLangCode;
    private Integer locationId;
    private LocalDate arrivalDate;
    private String profileImage;
}
