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
}
