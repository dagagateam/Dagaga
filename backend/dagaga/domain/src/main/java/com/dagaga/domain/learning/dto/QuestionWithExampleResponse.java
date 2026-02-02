package com.dagaga.domain.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionWithExampleResponse {
    private String questionText;
    private String exampleAnswer;
    private List<String> words;
    private List<String> pronunciationGuide;
    private String viteQuestions;
    private String viteAnswers;
    private String chzQuestions;
    private String chzAnswers;
}
