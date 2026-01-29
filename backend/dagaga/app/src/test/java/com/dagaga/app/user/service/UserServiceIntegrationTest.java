package com.dagaga.app.user.service;

import com.dagaga.domain.user.dto.UserLoginDto;
import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import com.dagaga.domain.user.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class UserServiceIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("회원가입 성공 - 닉네임이 있을 때")
    void register_success_with_nickname() {
        // given
        UserRegisterDto dto = UserRegisterDto.builder()
                .email("test-integration-app@gmail.com")
                .password("Password123*")
                .nickname("my-nickname")
                .viewLangCode("ko")
                .nativeLangCode("en")
                .build();

        // when
        Integer userId = userService.register(dto);

        // then
        User savedUser = userRepository.findById(userId).orElseThrow();
        assertThat(savedUser.getEmail()).isEqualTo("test-integration-app@gmail.com");
        assertThat(savedUser.getNickname()).isEqualTo("my-nickname");
    }

    @Test
    @DisplayName("회원가입 성공 - 닉네임이 비어있어 자동 생성될 때")
    void register_success_auto_nickname() {
        // given
        UserRegisterDto dto = UserRegisterDto.builder()
                .email("auto-nick-app@naver.com")
                .password("Password123+")
                .nickname("")
                .viewLangCode("ko")
                .nativeLangCode("en")
                .build();

        // when
        Integer userId = userService.register(dto);

        // then
        User savedUser = userRepository.findById(userId).orElseThrow();
        assertThat(savedUser.getNickname()).isEqualTo("auto-nick-app");
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 중복")
    void register_fail_duplicate_email() {
        // given
        String email = "duplicate-app@gmail.com";
        userRepository.save(User.builder()
                .email(email)
                .password("Password123*")
                .nickname("nick1")
                .viewLangCode("ko")
                .nativeLangCode("en")
                .build());

        UserRegisterDto dto = UserRegisterDto.builder()
                .email(email)
                .password("Password123*")
                .nickname("nick2")
                .viewLangCode("ko")
                .nativeLangCode("en")
                .build();

        // when & then
        assertThatThrownBy(() -> userService.register(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("이미 이메일이 존재합니다");
    }

    @Test
    @DisplayName("로그인 성공")
    void login_flow_success() {
        // given
        String email = "login@test.com";
        String password = "Password123*";
        userRepository.save(User.builder()
                .email(email)
                .password(password)
                .viewLangCode("ko")
                .nativeLangCode("en")
                .build());

        UserLoginDto dto = UserLoginDto.builder()
                .email(email)
                .password(password)
                .build();

        // when
        Integer userId = userService.login(dto);

        // then
        assertThat(userId).isNotNull();
    }

    @Test
    @DisplayName("로그인 실패 - 잘못된 비밀번호")
    void login_flow_fail_wrong_password() {
        // given
        String email = "login-fail@test.com";
        userRepository.save(User.builder()
                .email(email)
                .password("correct-pass123")
                .viewLangCode("ko")
                .nativeLangCode("en")
                .build());

        UserLoginDto dto = UserLoginDto.builder()
                .email(email)
                .password("wrong-pass123")
                .build();

        // when & then
        assertThatThrownBy(() -> userService.login(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("이메일 또는 비밀번호가 올바르지 않습니다");
    }
}
