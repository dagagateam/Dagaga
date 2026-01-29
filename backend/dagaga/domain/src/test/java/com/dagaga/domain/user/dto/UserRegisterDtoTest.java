package com.dagaga.domain.user.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class UserRegisterDtoTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("UserRegisterDto validation: Success")
    void validation_success() {
        UserRegisterDto dto = UserRegisterDto.builder()
                .email("test@gmail.com")
                .password("Password123+")
                .nickname("tester")
                .build();

        Set<ConstraintViolation<UserRegisterDto>> violations = validator.validate(dto);
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("UserRegisterDto validation: Email blank")
    void validation_email_blank() {
        UserRegisterDto dto = UserRegisterDto.builder()
                .email("")
                .password("Password123+")
                .nickname("tester")
                .build();

        Set<ConstraintViolation<UserRegisterDto>> violations = validator.validate(dto);
        assertThat(violations).anyMatch(v -> v.getMessage().contains("이메일은 필수입니다"));
    }

    @Test
    @DisplayName("UserRegisterDto validation: Invalid email format")
    void validation_email_invalid() {
        UserRegisterDto dto = UserRegisterDto.builder()
                .email("invalid-email")
                .password("Password123+")
                .nickname("tester")
                .build();

        Set<ConstraintViolation<UserRegisterDto>> violations = validator.validate(dto);
        assertThat(violations).anyMatch(v -> v.getMessage().contains("이메일 형식이 유효하지 않습니다"));
    }

    @Test
    @DisplayName("UserRegisterDto validation: Password blank")
    void validation_password_blank() {
        UserRegisterDto dto = UserRegisterDto.builder()
                .email("test@gmail.com")
                .password("")
                .nickname("tester")
                .build();

        Set<ConstraintViolation<UserRegisterDto>> violations = validator.validate(dto);
        assertThat(violations).anyMatch(v -> v.getMessage().contains("비밀번호는 필수입니다"));
    }

    @Test
    @DisplayName("UserRegisterDto validation: Password invalid pattern")
    void validation_password_pattern() {
        UserRegisterDto dto = UserRegisterDto.builder()
                .email("test@gmail.com")
                .password("short")
                .nickname("tester")
                .build();

        Set<ConstraintViolation<UserRegisterDto>> violations = validator.validate(dto);
        assertThat(violations).anyMatch(v -> v.getMessage().contains("비밀번호는 최소 8자 이상"));
    }

    @Test
    @DisplayName("UserRegisterDto validation: Nickname blank - Should be allowed")
    void validation_nickname_blank_allowed() {
        UserRegisterDto dto = UserRegisterDto.builder()
                .email("test@gmail.com")
                .password("Password123+")
                .nickname("")
                .build();

        Set<ConstraintViolation<UserRegisterDto>> violations = validator.validate(dto);
        assertThat(violations).isEmpty();
    }
}
