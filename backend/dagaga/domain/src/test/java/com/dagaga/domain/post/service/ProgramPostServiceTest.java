package com.dagaga.domain.post.service;

import com.dagaga.domain.post.dto.ProgramPostDetailResponse;
import com.dagaga.domain.post.dto.ProgramPostResponse;
import com.dagaga.domain.post.entity.Location;
import com.dagaga.domain.post.entity.Post;
import com.dagaga.domain.post.entity.Program;
import com.dagaga.domain.post.repository.LocationRepository;
import com.dagaga.domain.post.repository.PostRepository;
import com.dagaga.domain.post.repository.ProgramRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProgramPostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private ProgramRepository programRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private com.dagaga.domain.post.repository.ProgramImageRepository programImageRepository;

    @Mock
    private com.dagaga.domain.post.repository.ProgramPostTranslationRepository translationRepository;

    @Mock
    private com.dagaga.domain.chat.language.repository.LanguageRepository languageRepository;

    @Mock
    private com.dagaga.domain.common.translate.port.TranslationPort translationPort;

    @InjectMocks
    private ProgramPostService programPostService;

    @Test
    @DisplayName("새로운 프로그램 데이터가 있으면 포스트를 생성한다")
    void syncProgramsToPosts_Success() {
        // given
        Program program = mock(Program.class);
        given(program.getArticleSeq()).willReturn(12345);
        given(program.getTitle()).willReturn("Test Title");
        given(program.getContentText()).willReturn("Test Content");
        given(program.getProgramRegion()).willReturn("경기 수원시");

        given(programRepository.findAll()).willReturn(List.of(program));
        given(postRepository.findByArticleSeq(12345)).willReturn(Optional.empty());

        Location location = mock(Location.class);
        given(location.getLocationId()).willReturn(10);
        given(locationRepository.findByDistrictNameAndDepthAndParentName("수원시", 2, "경기")).willReturn(List.of(location));
        
        // Mock image repository
        given(programImageRepository.findAllByArticleSeqOrderByImageOrderAsc(12345)).willReturn(List.of());
        
        // Mock saveAndFlush to return a post with ID
        Post savedPost = mock(Post.class);
        given(savedPost.getPostId()).willReturn(1);
        given(savedPost.getTitle()).willReturn("Test Title");
        given(savedPost.getContent()).willReturn("Test Content");
        given(postRepository.saveAndFlush(any(Post.class))).willReturn(savedPost);
        
        // Mock translation (번역은 실패해도 무방)
        given(translationPort.translateProgram(anyString(), anyString(), anyList()))
                .willThrow(new RuntimeException("Translation disabled in test"));

        // when
        programPostService.syncProgramsToPosts();

        // then
        // 독립 트랜잭션 메서드가 호출되는지 확인할 수는 없으므로 saveAndFlush가 호출되었는지 확인
        verify(postRepository, times(1)).saveAndFlush(any(Post.class));
    }

    @Test
    @DisplayName("프로그램 게시글 목록을 조회한다")
    void getProgramPosts_Success() {
        // given
        Post post = Post.builder()
                .userId(1)
                .category("PROGRAM")
                .locationId(10)
                .title("Post Title")
                .articleSeq(12345)
                .build();

        Page<Post> postPage = new PageImpl<>(List.of(post));
        given(postRepository.findByCategoryAndLocationId(eq("PROGRAM"), eq(10), any())).willReturn(postPage);

        Program program = mock(Program.class);
        given(program.getArticleSeq()).willReturn(12345);
        given(program.getContact()).willReturn("010-1234-5678");
        given(program.getUpdatedAt()).willReturn(LocalDateTime.now());

        given(programRepository.findAllByArticleSeqIn(any())).willReturn(List.of(program));
        given(programImageRepository.findAllByArticleSeqIn(any())).willReturn(List.of());

        // when
        String viewLangCode = "ko";
        Page<ProgramPostResponse> result = programPostService.getProgramPosts(10, viewLangCode, PageRequest.of(0, 10));

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Post Title");
        assertThat(result.getContent().get(0).getContact()).isEqualTo("010-1234-5678");
    }

    @Test
    @DisplayName("특정 게시글 상세 정보를 조회하고 조회수를 증가시킨다")
    void getProgramPostDetail_Success() {
        // given
        Integer postId = 1;
        Post post = Post.builder()
                .userId(1)
                .category("PROGRAM")
                .locationId(10)
                .title("Post Detail Title")
                .content("Detailed Content")
                .articleSeq(12345)
                .build();
        // Use reflection to set postId because it's generated
        org.springframework.test.util.ReflectionTestUtils.setField(post, "postId", postId);
        org.springframework.test.util.ReflectionTestUtils.setField(post, "viewCount", 0);

        given(postRepository.findById(postId)).willReturn(Optional.of(post));

        Program program = mock(Program.class);
        given(program.getContact()).willReturn("010-1111-2222");

        given(programRepository.findAllByArticleSeqIn(anyList())).willReturn(List.of(program));

        com.dagaga.domain.post.entity.ProgramImage image = mock(com.dagaga.domain.post.entity.ProgramImage.class);
        given(image.getImageUrl()).willReturn("http://image.url");
        given(programImageRepository.findAllByArticleSeqOrderByImageOrderAsc(anyInt())).willReturn(List.of(image));

        // when
        String viewLangCode = "ko";
        ProgramPostDetailResponse response = programPostService.getProgramPostDetail(postId, viewLangCode);

        // then
        assertThat(response.getPostId()).isEqualTo(postId);
        assertThat(response.getTitle()).isEqualTo("Post Detail Title");
        assertThat(response.getContent()).isEqualTo("Detailed Content");
        assertThat(response.getViewCount()).isEqualTo(1); // Increment verified
        assertThat(response.getContact()).isEqualTo("010-1111-2222");
        assertThat(response.getImageUrls()).hasSize(1);
        assertThat(response.getImageUrls().get(0)).isEqualTo("http://image.url");
    }
}
