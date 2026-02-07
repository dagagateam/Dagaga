package com.dagaga.domain.post.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 프로그램 게시글 번역 결과를 담는 DTO
 * Gemini API로부터 받은 번역 결과를 저장
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProgramTranslationResult {
    /**
     * 감지된 원본 언어 코드 (예: 'ko')
     */
    private String detectedLanguage;
    
    /**
     * 언어별 번역 결과
     * Key: 언어 코드 (예: 'vi', 'zh')
     * Value: 번역된 제목과 본문을 담은 객체
     */
    private Map<String, TranslatedContent> translations;
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TranslatedContent {
        private String title;
        private String content;
    }
}
