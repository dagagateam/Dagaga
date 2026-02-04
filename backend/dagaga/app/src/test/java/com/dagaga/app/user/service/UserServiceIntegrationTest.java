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
import org.springframework.security.crypto.password.PasswordEncoder;
import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.domain.user.dto.UserUpdateDto;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.BDDMockito.willThrow;
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

        @Autowired
        private PasswordEncoder passwordEncoder;

        @MockitoBean
        private ChatRoomService chatRoomService;

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
                User user = userService.register(dto);

                // then
                User savedUser = userRepository.findById(user.getUserId()).orElseThrow();
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
                User user = userService.register(dto);

                // then
                User savedUser = userRepository.findById(user.getUserId()).orElseThrow();
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
                                .password(passwordEncoder.encode(password))
                                .viewLangCode("ko")
                                .nativeLangCode("en")
                                .build());

                UserLoginDto dto = UserLoginDto.builder()
                                .email(email)
                                .password(password)
                                .build();

                // when
                User user = userService.authenticate(dto.getEmail(), dto.getPassword());

                // then
                assertThat(user.getUserId()).isNotNull();
        }

        @Test
        @DisplayName("로그인 실패 - 잘못된 비밀번호")
        void login_flow_fail_wrong_password() {
                // given
                String email = "login-fail@test.com";
                userRepository.save(User.builder()
                                .email(email)
                                .password(passwordEncoder.encode("correct-pass123"))
                                .viewLangCode("ko")
                                .nativeLangCode("en")
                                .build());

                UserLoginDto dto = UserLoginDto.builder()
                                .email(email)
                                .password("wrong-pass123")
                                .build();

                // when & then
                assertThatThrownBy(() -> userService.authenticate(dto.getEmail(), dto.getPassword()))
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessageContaining("이메일 또는 비밀번호가 올바르지 않습니다");
        }

        @Test
        @DisplayName("유저 정보 수정 - 채팅방 처리 실패 시 롤백 확인")
        void updateUser_rollback_on_chat_failure() {
                // given
                String email = "rollback-test@example.com";
                int oldLocationId = 100;
                int newLocationId = 200;

                User savedUser = userRepository.save(User.builder()
                        .email(email)
                        .password("password123")
                        .nickname("rollbackTester")
                        .viewLangCode("ko")
                        .nativeLangCode("en")
                        .locationId(oldLocationId)
                        .build());
                Integer userId = savedUser.getUserId();

                UserUpdateDto updateDto = new UserUpdateDto();
                updateDto.setLocationId(newLocationId);
                updateDto.setNickname("newNickname");

                // 채팅방 서비스가 예외를 던지도록 설정
                willThrow(new IllegalStateException("Chat processing failed"))
                        .given(chatRoomService).handleUserLocationChange(anyInt(), anyInt(), anyInt());

                // when & then
                assertThatThrownBy(() -> userService.updateUser(userId, updateDto))
                        .isInstanceOf(IllegalStateException.class)
                        .hasMessage("Chat processing failed");
        }
}
