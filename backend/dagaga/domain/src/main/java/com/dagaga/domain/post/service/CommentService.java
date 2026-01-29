package com.dagaga.domain.post.service;

import com.dagaga.domain.post.dto.CommentCreateRequest;
import com.dagaga.domain.post.dto.CommentResponse;
import com.dagaga.domain.post.entity.Comment;
import com.dagaga.domain.post.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    @Transactional
    public void createComment(Integer postId, CommentCreateRequest request) {
        Comment comment = Comment.builder()
                .postId(postId)
                .userId(request.getUserId())
                .parentCommentId(request.getParentCommentId())
                .content(request.getContent())
                .build();
        commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Integer postId) {
        List<Comment> allComments = commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId);

        // Group by parentId to build hierarchy
        Map<Integer, List<Comment>> repliesMap = allComments.stream()
                .filter(c -> c.getParentCommentId() != null)
                .collect(Collectors.groupingBy(Comment::getParentCommentId));

        return allComments.stream()
                .filter(c -> c.getParentCommentId() == null)
                .map(c -> convertToResponse(c, repliesMap))
                .collect(Collectors.toList());
    }

    private CommentResponse convertToResponse(Comment comment, Map<Integer, List<Comment>> repliesMap) {
        List<CommentResponse> replies = repliesMap.getOrDefault(comment.getCommentId(), List.of()).stream()
                .map(r -> convertToResponse(r, repliesMap))
                .collect(Collectors.toList());

        return CommentResponse.builder()
                .commentId(comment.getCommentId())
                .userId(comment.getUserId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .replies(replies)
                .build();
    }
}
