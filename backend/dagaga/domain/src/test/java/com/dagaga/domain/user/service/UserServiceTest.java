package com.dagaga.domain.user.service;

import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Test
    @DisplayName("Email validation: Success with Gmail")
    void validateEmail_success_gmail() {
        userService.validateEmailFormat("test@gmail.com");
    }

    @Test
    @DisplayName("Email validation: Success with Naver")
    void validateEmail_success_naver() {
        userService.validateEmailFormat("test@naver.com");
    }

    @Test
    @DisplayName("Email validation: Failure with invalid format")
    void validateEmail_fail_invalid() {
        assertThatThrownBy(() -> userService.validateEmailFormat("invalid-email"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid email format");
    }

    @Test
    @DisplayName("Password validation: Success")
    void validatePassword_success() {
        userService.validatePassword("Password123*");
        userService.validatePassword("Complex+1234");
        userService.validatePassword("Minus-Test1");
    }

    @Test
    @DisplayName("Password validation: Fail too short")
    void validatePassword_fail_length() {
        assertThatThrownBy(() -> userService.validatePassword("Short1!"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Password validation: Fail no number")
    void validatePassword_fail_no_number() {
        assertThatThrownBy(() -> userService.validatePassword("NoNumber!"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Password validation: Fail no special char")
    void validatePassword_fail_no_special() {
        assertThatThrownBy(() -> userService.validatePassword("NoSpecial123"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Password validation: Fail invalid special char")
    void validatePassword_fail_invalid_special() {
        assertThatThrownBy(() -> userService.validatePassword("Invalid#123"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Register: Success")
    void register_success() {
        UserRegisterDto dto = UserRegisterDto.builder()
                .email("test@gmail.com")
                .password("Password123+")
                .nickname("tester")
                .viewLangCode("ko")
                .nativeLangCode("en")
                .build();

        given(userRepository.existsByEmail(dto.getEmail())).willReturn(false);
        given(userRepository.existsByNickname(dto.getNickname())).willReturn(false);
        given(userRepository.save(any(User.class))).willReturn(User.builder().build()); // Mock save

        userService.register(dto);

        verify(userRepository).save(any(User.class));
    }
}
