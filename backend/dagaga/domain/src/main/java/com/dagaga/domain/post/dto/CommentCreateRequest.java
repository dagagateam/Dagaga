package com.dagaga.domain.post.dto;

import com.dagaga.domain.common.validation.NoHtml;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentCreateRequest {

    @NotBlank(message = "댓글 내용은 필수입니다.")
    @Size(max = 1000, message = "댓글은 1000자를 초과할 수 없습니다")
    @NoHtml(message = "HTML 태그는 사용할 수 없습니다")
    private String content;

    private Integer parentCommentId;

}
