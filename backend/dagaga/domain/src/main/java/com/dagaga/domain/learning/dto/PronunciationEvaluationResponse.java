package com.dagaga.domain.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PronunciationEvaluationResponse {
    private String transcribedText;  // 인식된 텍스트
    private String expectedText;     // 기대 텍스트
    private PronunciationScores scores; // 점수
    private String feedback;         // 피드백
    private Boolean isPass;          // 합격 여부
    private String language;         // 언어
}
