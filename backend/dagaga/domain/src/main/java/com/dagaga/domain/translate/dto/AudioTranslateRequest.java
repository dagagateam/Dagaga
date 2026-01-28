package com.dagaga.domain.translate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioTranslateRequest {
    private String fileName;
    private Long fileSize;
    private String audioFormat;
    private String description;
}
