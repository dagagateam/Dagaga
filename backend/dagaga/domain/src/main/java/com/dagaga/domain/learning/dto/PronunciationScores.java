package com.dagaga.domain.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PronunciationScores {
    private Double accuracy;      // 정확도
    private Double pronunciation; // 발음
    private Double fluency;        // 유창성
    private Double overall;        // 종합
}
