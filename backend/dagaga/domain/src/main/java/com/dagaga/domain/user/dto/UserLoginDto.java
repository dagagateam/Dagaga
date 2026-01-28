package com.dagaga.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLoginDto {

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "이메일 형식이 유효하지 않습니다")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
}
