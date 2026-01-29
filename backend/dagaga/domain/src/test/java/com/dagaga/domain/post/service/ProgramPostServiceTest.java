package com.dagaga.domain.post.service;

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

    @InjectMocks
    private ProgramPostService programPostService;

    @Test
    @DisplayName("새로운 프로그램 데이터가 있으면 포스트를 생성한다")
    void syncProgramsToPosts_Success() {
        // given
        Program program = mock(Program.class);
        given(program.getArticleSeq()).willReturn(12345);
        given(program.getTitle()).willReturn("Test Title");
        given(program.getProgramRegion()).willReturn("경기 수원시");

        given(programRepository.findAll()).willReturn(List.of(program));
        given(postRepository.findByArticleSeq(12345)).willReturn(Optional.empty());

        Location location = mock(Location.class);
        given(location.getLocationId()).willReturn(10);
        given(locationRepository.findByDistrictNameAndDepth("수원시", 2)).willReturn(Optional.of(location));

        // when
        programPostService.syncProgramsToPosts();

        // then
        verify(postRepository, times(1)).save(any(Post.class));
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
        given(postRepository.findByCategory(eq("PROGRAM"), any())).willReturn(postPage);

        Program program = mock(Program.class);
        given(program.getArticleSeq()).willReturn(12345);
        given(program.getContact()).willReturn("010-1234-5678");
        given(program.getUpdatedAt()).willReturn(LocalDateTime.now());

        given(programRepository.findAllByArticleSeqIn(any())).willReturn(List.of(program));

        // when
        Page<ProgramPostResponse> result = programPostService.getProgramPosts(PageRequest.of(0, 10));

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Post Title");
        assertThat(result.getContent().get(0).getContact()).isEqualTo("010-1234-5678");
    }
}
