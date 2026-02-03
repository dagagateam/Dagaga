package com.dagaga.controller;

import com.dagaga.domain.user.dto.UserResponseDto;
import com.dagaga.domain.user.dto.UserUpdateDto;
import com.dagaga.domain.user.service.UserService;
import com.dagaga.security.jwt.JwtAuthenticationEntryPoint;
import com.dagaga.security.jwt.JwtAuthenticationFilter;
import com.dagaga.security.redis.RedisTokenService;
import com.dagaga.domain.security.jwt.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.dagaga.chat.service.ChatRoomService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import com.dagaga.domain.security.SecurityContextHelper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;

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
    private ChatRoomService chatRoomService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private RedisTokenService redisTokenService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    private MockedStatic<SecurityContextHelper> mockedSecurityContextHelper;

    @BeforeEach
    void setUp() {
        mockedSecurityContextHelper = Mockito.mockStatic(SecurityContextHelper.class);
    }

    @AfterEach
    void tearDown() {
        mockedSecurityContextHelper.close();
    }

    @Test
    @DisplayName("GET /api/v1/users/me - 성공")
    void getCurrentUser_Success() throws Exception {
        // given
        Integer userId = 1;
        UserResponseDto responseDto = UserResponseDto.builder()
                .userId(userId)
                .email("test@example.com")
                .nickname("tester")
                .modifiedAt(java.time.LocalDateTime.now())
                .build();

        mockedSecurityContextHelper.when(SecurityContextHelper::getCurrentUserId).thenReturn(userId);
        given(userService.getUserResponse(userId)).willReturn(responseDto);

        // when & then
        mockMvc.perform(get("/api/v1/users/me")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.nickname").value("tester"))
                .andExpect(jsonPath("$.modifiedAt").exists());
    }

    @Test
    @DisplayName("PATCH /api/v1/users/me - 성공")
    void updateCurrentUser_Success() throws Exception {
        // given
        Integer userId = 1;
        UserUpdateDto updateDto = new UserUpdateDto();
        updateDto.setNickname("newNickname");

        UserResponseDto responseDto = UserResponseDto.builder()
                .userId(userId)
                .email("test@example.com")
                .nickname("newNickname")
                .modifiedAt(java.time.LocalDateTime.now())
                .build();

        mockedSecurityContextHelper.when(SecurityContextHelper::getCurrentUserId).thenReturn(userId);
        given(userService.updateUser(eq(userId), any(UserUpdateDto.class))).willReturn(responseDto);

        // when & then
        mockMvc.perform(patch("/api/v1/users/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("newNickname"))
                .andExpect(jsonPath("$.modifiedAt").exists());
    }
}
