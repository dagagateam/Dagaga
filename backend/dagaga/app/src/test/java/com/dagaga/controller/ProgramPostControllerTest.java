package com.dagaga.controller;

import com.dagaga.domain.post.dto.ProgramPostDetailResponse;
import com.dagaga.domain.post.service.ProgramPostService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProgramPostController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProgramPostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProgramPostService programPostService;

    @MockitoBean
    private com.dagaga.domain.post.service.CommentService commentService;

    @MockitoBean
    private com.dagaga.security.jwt.JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private com.dagaga.security.jwt.JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Test
    @DisplayName("게시글 상세 조회 API가 정상적으로 동작한다")
    void getProgramPostDetail_Success() throws Exception {
        // given
        Integer postId = 1;
        ProgramPostDetailResponse response = ProgramPostDetailResponse.builder()
                .postId(postId)
                .category("PROGRAM")
                .title("Test Title")
                .content("Test Content")
                .viewCount(10)
                .createdAt(LocalDateTime.now())
                .imageUrls(List.of("http://image1.jpg", "http://image2.jpg"))
                .build();

        given(programPostService.getProgramPostDetail(postId)).willReturn(response);

        // when & then
        mockMvc.perform(get("/api/v1/community/programs/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("프로그램 게시글 상세 조회가 완료되었습니다."))
                .andExpect(jsonPath("$.data.postId").value(postId))
                .andExpect(jsonPath("$.data.title").value("Test Title"))
                .andExpect(jsonPath("$.data.content").value("Test Content"))
                .andExpect(jsonPath("$.data.imageUrls").isArray())
                .andExpect(jsonPath("$.data.imageUrls[0]").value("http://image1.jpg"));
    }
}
