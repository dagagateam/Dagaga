package com.dagaga.domain.post.service;

import com.dagaga.domain.chat.language.repository.LanguageRepository;
import com.dagaga.domain.common.translate.port.TranslationPort;
import com.dagaga.domain.post.dto.CommentCreateRequest;
import com.dagaga.domain.post.dto.CommentResponse;
import com.dagaga.domain.post.entity.Comment;
import com.dagaga.domain.post.entity.CommentTranslation;
import com.dagaga.domain.post.repository.CommentRepository;
import com.dagaga.domain.post.repository.CommentTranslationRepository;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.mock;
import java.util.concurrent.Executor;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private CommentTranslationRepository commentTranslationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LanguageRepository languageRepository;

    @Mock
    private TranslationPort translationPort;

    @Mock(lenient = true)
    private TransactionTemplate transactionTemplate;

    @Mock(lenient = true)
    private Executor translationExecutor;

    @InjectMocks
    private CommentService commentService;

    @BeforeEach
    void setUp() {
        doAnswer(invocation -> {
            Runnable runnable = invocation.getArgument(0);
            runnable.run();
            return null;
        }).when(translationExecutor).execute(any(Runnable.class));
    }

    @Test
    @DisplayName("댓글을 생성한다")
    void createComment_Success() {
        // given
        CommentCreateRequest request = new CommentCreateRequest();
        request.setContent("Test Comment");
        
        Comment mockComment = Comment.builder().postId(1).userId(1).content("Test Comment").build();
        setField(mockComment, "commentId", 1);
        
        given(transactionTemplate.execute(any(TransactionCallback.class))).willAnswer(invocation -> {
            TransactionCallback<?> callback = invocation.getArgument(0);
            return callback.doInTransaction(mock(TransactionStatus.class));
        });
        
        given(commentRepository.save(any(Comment.class))).willReturn(mockComment);

        // when
        commentService.createComment(1, 1, request);

        // then
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    @DisplayName("게시글의 댓글 목록을 계층 구조로 조회한다")
    void getComments_HierarchySuccess() {
        // given
        Integer postId = 1;
        Integer currentUserId = 1;
        String viewLang = "ko";

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

        User user1 = User.builder().nickname("작성자1").build();
        setField(user1, "userId", 1);
        User user2 = User.builder().nickname("작성자2").build();
        setField(user2, "userId", 2);
        User user3 = User.builder().nickname("작성자3").build();
        setField(user3, "userId", 3);

        given(userRepository.findAllById(any())).willReturn(List.of(user1, user2, user3));

        // when
        List<CommentResponse> result = commentService.getComments(postId, currentUserId, viewLang);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getContent()).isEqualTo("부모 댓글");
        assertThat(result.get(0).getReplies()).hasSize(2);
        assertThat(result.get(0).getReplies().get(0).getContent()).isEqualTo("대댓글 1");
        assertThat(result.get(0).getReplies().get(1).getContent()).isEqualTo("대댓글 2");
    }

    @Test
    @DisplayName("댓글 조회 시 번역된 내용이 있으면 번역본을 보여준다")
    void getComments_WithTranslation() {
        // given
        Integer postId = 1;
        Integer currentUserId = 2;
        String viewLang = "en";

        Comment comment = Comment.builder()
                .postId(postId)
                .userId(1)
                .content("안녕하세요")
                .build();
        setField(comment, "commentId", 1);
        setField(comment, "createdAt", java.time.LocalDateTime.now());

        // Add translation
        CommentTranslation translation = CommentTranslation.builder()
                .comment(comment)
                .targetLang("en")
                .translatedContent("Hello")
                .build();
        comment.addTranslation(translation);

        given(commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId))
                .willReturn(List.of(comment));

        User user1 = User.builder().nickname("작성자1").build();
        setField(user1, "userId", 1);
        given(userRepository.findAllById(any())).willReturn(List.of(user1));

        // when
        List<CommentResponse> result = commentService.getComments(postId, currentUserId, viewLang);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getContent()).isEqualTo("Hello"); // Translated content
    }

    private void setField(Object target, String fieldName, Object value) {
        org.springframework.test.util.ReflectionTestUtils.setField(target, fieldName, value);
    }
}
