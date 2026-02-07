package com.dagaga.domain.user.dto;

import com.dagaga.domain.common.validation.NoHtml;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
public class SocialSignupDto {
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "이메일 형식이 유효하지 않습니다")
    private String email;

    @NotBlank(message = "닉네임은 필수입니다")
    @Size(max = 20, message = "닉네임은 20자를 초과할 수 없습니다")
    @NoHtml(message = "error_html_tag_not_allowed")
    private String nickname;

    @NotBlank(message = "표시 언어 설정은 필수입니다")
    private String viewLangCode;

    @NotBlank(message = "모국어 설정은 필수입니다")
    private String nativeLangCode;

    private Integer locationId;
    private LocalDate arrivalDate;
}
