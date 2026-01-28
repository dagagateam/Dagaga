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
}
