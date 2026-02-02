package com.dagaga.domain.learning.service;

import com.dagaga.domain.learning.dto.QuestionResponse;

import java.util.List;

public interface QuestionService {

    /**
     * 특정 카테고리의 질문 목록 조회
     * @param category 카테고리명
     * @return 질문 목록
     */
    List<QuestionResponse> getQuestionsByCategory(String category);

    /**
     * 카테고리와 순서로 질문 텍스트 조회 (모국어 모드용)
     * @param category 카테고리명
     * @param orderIndex 질문 순서
     * @return 질문 텍스트
     */
    String getQuestionText(String category, Integer orderIndex);

    /**
     * 카테고리와 순서로 질문과 예시 답변 조회 (예시 모드용)
     * @param category 카테고리명
     * @param orderIndex 질문 순서
     * @param countryCode 국적 코드 (vite: 베트남, chz: 중국)
     * @return 질문과 예시 답변
     */
    com.dagaga.domain.learning.dto.QuestionWithExampleResponse getQuestionWithExample(String category, Integer orderIndex, String countryCode);
}
