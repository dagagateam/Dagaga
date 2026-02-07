package com.dagaga.domain.common.translate.port;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 텍스트 번역 결과를 담는 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TranslationResult {
    /**
     * 감지된 원본 언어 코드 (예: 'ko', 'en', 'vi')
     */
    private String detectedLanguage;
    
    /**
     * 언어별 번역 결과
     * Key: 언어 코드 (예: 'ko', 'en', 'vi')
     * Value: 번역된 텍스트
     */
    private Map<String, String> translations;
}
