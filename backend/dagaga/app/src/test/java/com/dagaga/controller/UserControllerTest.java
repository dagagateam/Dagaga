package com.dagaga.controller;

import com.dagaga.domain.user.dto.UserResponseDto;
import com.dagaga.domain.user.dto.UserUpdateDto;
import com.dagaga.domain.user.dto.PasswordVerifyRequest;
import com.dagaga.domain.user.service.UserService;
import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.domain.user.entity.User;
import com.dagaga.security.jwt.JwtTokenProvider;
import com.dagaga.security.redis.RedisTokenService;
import com.dagaga.domain.security.CurrentUser;
import com.dagaga.domain.user.value.UserId;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private UserService userService;

        @MockitoBean
        private JwtTokenProvider jwtTokenProvider;

        @MockitoBean
        private RedisTokenService redisTokenService;

        @MockitoBean
        private PasswordEncoder passwordEncoder;

        @MockitoBean
        private ChatRoomService chatRoomService;

        @MockitoBean
        private CurrentUser currentUser;

        @Test
        @DisplayName("GET /api/v1/users/me - 성공")
        void getCurrentUser_Success() throws Exception {
                // given
                Integer userIdValue = 1;
                UserResponseDto responseDto = UserResponseDto.builder()
                                .userId(userIdValue)
                                .email("test@example.com")
                                .nickname("tester")
                                .modifiedAt(java.time.LocalDateTime.now())
                                .build();

                given(currentUser.getUserId()).willReturn(Optional.of(UserId.of(userIdValue)));
                given(userService.getUserResponse(userIdValue)).willReturn(responseDto);

                // when & then
                mockMvc.perform(get("/api/v1/users/me")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.userId").value(userIdValue))
                                .andExpect(jsonPath("$.email").value("test@example.com"))
                                .andExpect(jsonPath("$.nickname").value("tester"))
                                .andExpect(jsonPath("$.modifiedAt").exists());
        }

        @Test
        @DisplayName("PATCH /api/v1/users/me - 성공")
        void updateCurrentUser_Success() throws Exception {
                // given
                Integer userIdValue = 1;
                UserUpdateDto updateDto = new UserUpdateDto();
                updateDto.setNickname("newNickname");
                updateDto.setViewLangCode("ko");

                UserResponseDto responseDto = UserResponseDto.builder()
                                .userId(userIdValue)
                                .email("test@example.com")
                                .nickname("newNickname")
                                .viewLangCode("ko")
                                .socialProvider("google")
                                .modifiedAt(java.time.LocalDateTime.now())
                                .build();

                User existingUser = User.builder()
                                .email("test@example.com")
                                .nickname("tester")
                                .locationId(100)
                                .build();
                // reflection to set userId if needed, or if builder doesn't support it (User entity usually sets ID via JPA)
                // For mocking, we just pretend getUserById returns this.

                given(currentUser.getUserId()).willReturn(Optional.of(UserId.of(userIdValue)));
                given(userService.getUserById(userIdValue)).willReturn(existingUser);
                given(userService.updateUser(eq(userIdValue), any(UserUpdateDto.class))).willReturn(responseDto);

                // when & then
                mockMvc.perform(patch("/api/v1/users/me")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateDto)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.nickname").value(updateDto.getNickname()))
                                .andExpect(jsonPath("$.socialProvider").value("google")) // socialProvider 확인
                                .andExpect(jsonPath("$.viewLangCode").value(updateDto.getViewLangCode()))
                                .andExpect(jsonPath("$.modifiedAt").exists());
        }

        @Test
        @DisplayName("PATCH /api/v1/users/me - 지역 변경 시 채팅방 업데이트 성공")
        void updateCurrentUser_LocationChange_Success() throws Exception {
                // given
                Integer userIdValue = 1;
                Integer oldLocationId = 100;
                Integer newLocationId = 200;

                UserUpdateDto updateDto = new UserUpdateDto();
                updateDto.setLocationId(newLocationId);

                UserResponseDto responseDto = UserResponseDto.builder()
                                .userId(userIdValue)
                                .email("test@example.com")
                                .locationId(newLocationId)
                                .modifiedAt(java.time.LocalDateTime.now())
                                .build();

                User existingUser = User.builder()
                                .email("test@example.com")
                                .nickname("tester")
                                .locationId(oldLocationId)
                                .build();

                given(currentUser.getUserId()).willReturn(Optional.of(UserId.of(userIdValue)));
                given(userService.getUserById(userIdValue)).willReturn(existingUser);
                given(userService.updateUser(eq(userIdValue), any(UserUpdateDto.class))).willReturn(responseDto);

                // when
                mockMvc.perform(patch("/api/v1/users/me")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateDto)))
                                .andExpect(status().isOk());

                // then
                // Verify that handleUserLocationChange is called
                org.mockito.Mockito.verify(chatRoomService).handleUserLocationChange(userIdValue, oldLocationId, newLocationId);
        }

        @Test
        @DisplayName("POST /api/v1/users/verify-password - 성공")
        void verifyPassword_Success() throws Exception {
            // given
            Integer userIdValue = 1;
            PasswordVerifyRequest request = new PasswordVerifyRequest();
            request.setPassword("correctPassword");

            given(currentUser.getUserId()).willReturn(Optional.of(UserId.of(userIdValue)));
            // userService.verifyPassword returns void on success

            // when & then
            mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/users/verify-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                            .andExpect(status().isOk());

            org.mockito.Mockito.verify(userService).verifyPassword(userIdValue, "correctPassword");
        }

        @Test
        @DisplayName("POST /api/v1/users/verify-password - 실패")
        void verifyPassword_Fail() throws Exception {
            // given
            Integer userIdValue = 1;
            PasswordVerifyRequest request = new PasswordVerifyRequest();
            request.setPassword("wrongPassword");

            given(currentUser.getUserId()).willReturn(Optional.of(UserId.of(userIdValue)));
            org.mockito.BDDMockito.willThrow(new IllegalArgumentException("비밀번호가 일치하지 않습니다."))
                    .given(userService).verifyPassword(userIdValue, "wrongPassword");

            // when & then
            mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/users/verify-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                            .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("POST /api/v1/users/verify-password - 소셜 로그인 유저 (비밀번호 없음) 성공")
        void verifyPassword_SocialUser_Success() throws Exception {
            // given
            Integer userIdValue = 1;
            PasswordVerifyRequest request = new PasswordVerifyRequest();
            request.setPassword("anyPassword"); // 소셜 유저는 어떤 값을 보내도 통과

            given(currentUser.getUserId()).willReturn(Optional.of(UserId.of(userIdValue)));
            // userService.verifyPassword returns void on success (including social user skip)

            // when & then
            mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/users/verify-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                            .andExpect(status().isOk());

            org.mockito.Mockito.verify(userService).verifyPassword(userIdValue, "anyPassword");
        }
}
