package com.dagaga.app.user.service;

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
        Long userId = userService.register(dto);

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
        Long userId = userService.register(dto);

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
                .password("any-pass")
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
}
