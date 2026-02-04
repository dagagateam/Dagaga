package com.dagaga.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentCreateRequest {

    @NotBlank(message = "댓글 내용은 필수입니다.")
    private String content;

    private Integer parentCommentId;

}
