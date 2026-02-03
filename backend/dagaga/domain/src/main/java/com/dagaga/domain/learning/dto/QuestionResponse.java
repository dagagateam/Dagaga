package com.dagaga.domain.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResponse {
    private Integer questionId;
    private String category;
    private String questionText;
    private Integer orderIndex;
    private String viewQuestions;
}
