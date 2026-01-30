package com.dagaga.chat.controller;

import com.dagaga.chat.dto.CreateChatRoomRequest;

import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.domain.chat.message.repository.ChatMessageRepository;
import com.dagaga.domain.chat.room.repository.ChatRoomRepository;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

@WebMvcTest(ChatRoomController.class)
@AutoConfigureMockMvc(addFilters = false)
class ChatRoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ChatRoomService chatRoomService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private ChatRoomRepository chatRoomRepository;

    @MockitoBean
    private ChatMessageRepository chatMessageRepository;

    @Test
    @DisplayName("Success: 채팅방 생성 요청 시 roomId를 반환함")
    void createCustomChatRoom_shouldReturnRoomId() throws Exception {
        // given
        CreateChatRoomRequest request = new CreateChatRoomRequest();
        request.setUserId(1);
        request.setTitle("테스트 채팅방");

        // User
        User mockUser = User.builder()
                .locationId(100)
                .build();
        ReflectionTestUtils.setField(mockUser, "userId", 1);
        
        given(userRepository.findById(1)).willReturn(Optional.of(mockUser));
        given(chatRoomService.createCustomRoom(anyInt(), anyInt(), anyString())).willReturn(123);

        // when & then
        mockMvc.perform(post("/api/v1/chat/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("123"));
    }

    @Test
    @DisplayName("Fail: 존재하지 않는 유저 ID로 요청 시 IllegalArgumentException 발생")
    void createCustomChatRoom_shouldThrowException_whenUserNotFound() throws Exception {
        // given
        CreateChatRoomRequest request = new CreateChatRoomRequest();
        request.setUserId(999);
        request.setTitle("없는 유저");

        given(userRepository.findById(999)).willReturn(Optional.empty());

        // when & then
        // GlobalExceptionHandler가 없으므로 Exception이 밖으로 던져짐
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> 
            mockMvc.perform(post("/api/v1/chat/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
        ).hasCauseInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Success: 채팅방 삭제 성공 시 200 OK 반환")
    void deleteChatRoom_shouldReturnOk() throws Exception {
        // given
        int roomId = 10;
        int requesterId = 1;

        // when & then
        mockMvc.perform(delete("/api/v1/chat/rooms/{roomId}", roomId)
                        .param("requesterId", String.valueOf(requesterId)))
                .andExpect(status().isOk());
                
        verify(chatRoomService).deleteRoom(roomId, requesterId);
    }

    @Test
    @DisplayName("Fail: 채팅방 삭제 권한 없을 시(Service예외) 400 Bad Request (혹은 예외전파)")
    void deleteChatRoom_shouldReturnError_whenServiceThrowsException() throws Exception {
        // given
        int roomId = 10;
        int requesterId = 1;

        doThrow(new IllegalArgumentException("Only the owner can delete the room."))
                .when(chatRoomService).deleteRoom(roomId, requesterId);

        // when & then
        assertThatThrownBy(() ->
            mockMvc.perform(delete("/api/v1/chat/rooms/{roomId}", roomId)
                            .param("requesterId", String.valueOf(requesterId)))
        ).hasCauseInstanceOf(IllegalArgumentException.class);
    }
}
