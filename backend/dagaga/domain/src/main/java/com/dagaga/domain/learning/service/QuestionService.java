package com.dagaga.domain.learning.service;

import com.dagaga.domain.learning.dto.QuestionResponse;
import com.dagaga.domain.learning.dto.QuestionWithExampleResponse;
import com.dagaga.domain.learning.dto.NativeQuestionResponse;

import java.util.List;

public interface QuestionService {

    /**
     * 특정 카테고리의 질문 목록 조회
     * 
     * @param category 카테고리명
     * @return 질문 목록
     */
    List<QuestionResponse> getQuestionsByCategory(String category, String viewLangCode);

    /**
     * 카테고리와 순서로 질문과 예시 답변 조회 (예시 모드용)
     * 
     * @param category       카테고리명
     * @param orderIndex     질문 순서
     * @param nativeLangCode 사용자 모국어 코드 (JWT에서 추출, Controller가 전달)
     * @return 질문과 예시 답변
     */
    QuestionWithExampleResponse getQuestionWithExample(String category,
            Integer orderIndex, String nativeLangCode);

    /**
     * 카테고리와 순서로 한국어 질문과 모국어 질문 조회 (모국어 모드용)
     * 
     * @param category       카테고리명
     * @param orderIndex     질문 순서
     * @param nativeLangCode 사용자 모국어 코드 (JWT에서 추출, Controller가 전달)
     * @return 한국어 질문과 모국어 질문
     */
    NativeQuestionResponse getQuestionForNativeMode(String category,
            Integer orderIndex, String nativeLangCode);
}
