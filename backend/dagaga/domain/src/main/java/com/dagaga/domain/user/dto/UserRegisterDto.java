package com.dagaga.domain.user.dto;

import com.dagaga.domain.common.validation.NoHtml;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
    @NotBlank(message = "이메일은 필수입니다")
    @Pattern(regexp = "^[A-Za-z0-9.]+@[A-Za-z0-9.]+\\.[A-Za-z0-9.]+$", message = "이메일 형식이 유효하지 않습니다")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[*+-])[A-Za-z\\d*+-]{8,}$", message = "비밀번호는 최소 8자 이상, 영문, 숫자, 특수문자(*, +, -)만 포함해야 합니다")
    private String password;

    @Size(max = 20, message = "닉네임은 20자를 초과할 수 없습니다")
    @NoHtml(message = "HTML 태그는 사용할 수 없습니다")
    private String nickname;
    private String viewLangCode;
    private String nativeLangCode;
    private Integer locationId;
    private LocalDate arrivalDate;
}
