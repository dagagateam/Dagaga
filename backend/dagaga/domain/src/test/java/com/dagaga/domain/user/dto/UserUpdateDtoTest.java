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

class UserUpdateDtoTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("UserUpdateDto password validation: Success")
    void validation_success() {
        UserUpdateDto dto = new UserUpdateDto();
        dto.setPassword("Password123+");

        Set<ConstraintViolation<UserUpdateDto>> violations = validator.validate(dto);
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("UserUpdateDto password validation: Success with * and -")
    void validation_success_special_chars() {
        UserUpdateDto dto = new UserUpdateDto();
        dto.setPassword("Password123*-");

        Set<ConstraintViolation<UserUpdateDto>> violations = validator.validate(dto);
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("UserUpdateDto password validation: Fail - Invalid special char (!)")
    void validation_fail_invalid_special_char() {
        UserUpdateDto dto = new UserUpdateDto();
        dto.setPassword("Password123!");

        Set<ConstraintViolation<UserUpdateDto>> violations = validator.validate(dto);
        assertThat(violations).anyMatch(v -> v.getMessage().contains("비밀번호는 최소 8자 이상"));
    }
    
    @Test
    @DisplayName("UserUpdateDto password validation: Fail - No special char")
    void validation_fail_no_special_char() {
        UserUpdateDto dto = new UserUpdateDto();
        dto.setPassword("Password123");

        Set<ConstraintViolation<UserUpdateDto>> violations = validator.validate(dto);
        assertThat(violations).anyMatch(v -> v.getMessage().contains("비밀번호는 최소 8자 이상"));
    }
}
