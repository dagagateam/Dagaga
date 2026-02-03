package com.dagaga.domain.post.service;

import com.dagaga.domain.post.dto.CommentCreateRequest;
import com.dagaga.domain.post.dto.CommentResponse;
import com.dagaga.domain.post.entity.Comment;
import com.dagaga.domain.post.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

        private final CommentRepository commentRepository;
        private final com.dagaga.domain.user.repository.UserRepository userRepository;

        @Transactional
        public void createComment(Integer postId, Integer userId, CommentCreateRequest request) {
                Comment comment = Comment.builder()
                                .postId(postId)
                                .userId(userId)
                                .parentCommentId(request.getParentCommentId())
                                .content(request.getContent())
                                .build();
                commentRepository.save(comment);
        }

        @Transactional(readOnly = true)
        public List<CommentResponse> getComments(Integer postId) {
                List<Comment> allComments = commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId);

                if (allComments.isEmpty()) {
                        return Collections.emptyList();
                }

                // 사용자 닉네임 일괄 조회
                Set<Integer> userIds = allComments.stream()
                                .map(Comment::getUserId)
                                .collect(Collectors.toSet());

                Map<Integer, String> nicknameMap = userRepository.findAllById(userIds).stream()
                                .collect(Collectors.toMap(
                                                com.dagaga.domain.user.entity.User::getUserId,
                                                com.dagaga.domain.user.entity.User::getNickname,
                                                (existing, replacement) -> existing));

                // Group by parentId to build hierarchy
                Map<Integer, List<Comment>> repliesMap = allComments.stream()
                                .filter(c -> c.getParentCommentId() != null)
                                .collect(Collectors.groupingBy(Comment::getParentCommentId));

                return allComments.stream()
                                .filter(c -> c.getParentCommentId() == null)
                                .map(c -> convertToResponse(c, repliesMap, nicknameMap))
                                .collect(Collectors.toList());
        }

        private CommentResponse convertToResponse(Comment comment, Map<Integer, List<Comment>> repliesMap,
                        Map<Integer, String> nicknameMap) {
                List<CommentResponse> replies = repliesMap.getOrDefault(comment.getCommentId(), List.of()).stream()
                                .map(r -> convertToResponse(r, repliesMap, nicknameMap))
                                .collect(Collectors.toList());

                return CommentResponse.builder()
                                .commentId(comment.getCommentId())
                                .userId(comment.getUserId())
                                .nickname(nicknameMap.getOrDefault(comment.getUserId(), "Unknown"))
                                .content(comment.getContent())
                                .createdAt(comment.getCreatedAt())
                                .replies(replies)
                                .build();
        }
}
