package com.dagaga.domain.post.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class CommentResponse {
    private Integer commentId;
    private Integer userId;
    private String nickname;
    private String content;
    private LocalDateTime createdAt;
    private List<CommentResponse> replies;
}
