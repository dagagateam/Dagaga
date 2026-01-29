package com.dagaga.domain.post.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProgramPostResponse {

    private Integer postId;

    private String category;

    private String contact;

    private String title;

    private Integer locationId;

    private Integer viewCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String capacity;
}
