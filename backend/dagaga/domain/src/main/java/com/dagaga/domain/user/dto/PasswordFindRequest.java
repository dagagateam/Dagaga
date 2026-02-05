package com.dagaga.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PasswordFindRequest {

    @NotBlank(message = "이메일은 필수 입력값입니다.")
    @Pattern(regexp = "^[A-Za-z0-9.]+@[A-Za-z0-9.]+\\.[A-Za-z0-9.]+$", message = "올바른 이메일 형식이 아닙니다.")
    private String email;
}
