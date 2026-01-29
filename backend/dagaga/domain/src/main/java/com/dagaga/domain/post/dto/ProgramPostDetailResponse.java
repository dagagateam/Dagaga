package com.dagaga.domain.post.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ProgramPostDetailResponse {

    private Integer postId;

    private String category;

    private String contact;

    private String title;

    private String content;

    private Integer locationId;

    private Integer viewCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String capacity;

    private List<String> imageUrls;
}
