package com.dagaga.domain.post.service;

import com.dagaga.domain.post.dto.CommentCreateRequest;
import com.dagaga.domain.post.dto.CommentResponse;
import com.dagaga.domain.post.entity.Comment;
import com.dagaga.domain.post.repository.CommentRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private CommentService commentService;

    @Test
    @DisplayName("댓글을 생성한다")
    void createComment_Success() {
        // given
        CommentCreateRequest request = new CommentCreateRequest();
        request.setContent("Test Comment");
        request.setUserId(1);

        // when
        commentService.createComment(1, request);

        // then
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    @DisplayName("게시글의 댓글 목록을 계층 구조로 조회한다")
    void getComments_HierarchySuccess() {
        // given
        Integer postId = 1;

        Comment parent = Comment.builder()
                .postId(postId)
                .userId(1)
                .content("부모 댓글")
                .build();
        setField(parent, "commentId", 1);
        setField(parent, "createdAt", java.time.LocalDateTime.now());

        Comment child1 = Comment.builder()
                .postId(postId)
                .userId(2)
                .parentCommentId(1)
                .content("대댓글 1")
                .build();
        setField(child1, "commentId", 2);
        setField(child1, "createdAt", java.time.LocalDateTime.now().plusMinutes(1));

        Comment child2 = Comment.builder()
                .postId(postId)
                .userId(3)
                .parentCommentId(1)
                .content("대댓글 2")
                .build();
        setField(child2, "commentId", 3);
        setField(child2, "createdAt", java.time.LocalDateTime.now().plusMinutes(2));

        given(commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId))
                .willReturn(List.of(parent, child1, child2));

        // when
        List<CommentResponse> result = commentService.getComments(postId);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getContent()).isEqualTo("부모 댓글");
        assertThat(result.get(0).getReplies()).hasSize(2);
        assertThat(result.get(0).getReplies().get(0).getContent()).isEqualTo("대댓글 1");
        assertThat(result.get(0).getReplies().get(1).getContent()).isEqualTo("대댓글 2");
    }

    private void setField(Object target, String fieldName, Object value) {
        org.springframework.test.util.ReflectionTestUtils.setField(target, fieldName, value);
    }
}
