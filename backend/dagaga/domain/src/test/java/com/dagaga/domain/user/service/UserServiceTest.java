package com.dagaga.domain.user.service;

import com.dagaga.domain.user.dto.UserLoginDto;
import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
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
    @DisplayName("Register: Success with generated nickname")
    void register_success_with_generated_nickname() {
        UserRegisterDto dto = UserRegisterDto.builder()
                .email("tester@naver.com")
                .password("Password123+")
                .nickname("") // Blank nickname
                .build();

        User savedUser = User.builder().build();
        // Use reflection to set private field userId for testing
        try {
            java.lang.reflect.Field field = User.class.getDeclaredField("userId");
            field.setAccessible(true);
            field.set(savedUser, 1);
        } catch (Exception e) {}

        given(userRepository.existsByEmail(dto.getEmail())).willReturn(false);
        given(userRepository.existsByNickname("tester")).willReturn(false);
        given(userRepository.save(any(User.class))).willReturn(savedUser);

        Integer userId = userService.register(dto);

        assertThat(userId).isEqualTo(1);
        verify(userRepository).existsByNickname("tester");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Login: Success")
    void login_success() {
        UserLoginDto dto = UserLoginDto.builder()
                .email("test@gmail.com")
                .password("Password123+")
                .build();

        User user = User.builder().build();
        try {
            java.lang.reflect.Field field = User.class.getDeclaredField("userId");
            field.setAccessible(true);
            field.set(user, 1);
        } catch (Exception e) {}
        // Then set other fields if needed for the test logic, but login only uses ID
        // Wait, login needs email and password too
        user = User.builder()
                .email(dto.getEmail())
                .password(dto.getPassword())
                .build();
        try {
            java.lang.reflect.Field field = User.class.getDeclaredField("userId");
            field.setAccessible(true);
            field.set(user, 1);
        } catch (Exception e) {}

        given(userRepository.findByEmail(dto.getEmail())).willReturn(Optional.of(user));

        Integer userId = userService.login(dto);

        assertThat(userId).isEqualTo(user.getUserId());
    }

    @Test
    @DisplayName("Login: Fail - Wrong Email")
    void login_fail_wrong_email() {
        UserLoginDto dto = UserLoginDto.builder()
                .email("wrong@gmail.com")
                .password("any-pass")
                .build();

        given(userRepository.findByEmail(dto.getEmail())).willReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("이메일 또는 비밀번호가 올바르지 않습니다");
    }

    @Test
    @DisplayName("Login: Fail - Wrong Password")
    void login_fail_wrong_password() {
        UserLoginDto dto = UserLoginDto.builder()
                .email("test@gmail.com")
                .password("wrong-pass")
                .build();

        User user = User.builder()
                .email(dto.getEmail())
                .password("correct-pass")
                .build();

        given(userRepository.findByEmail(dto.getEmail())).willReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.login(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("이메일 또는 비밀번호가 올바르지 않습니다");
    }
}
