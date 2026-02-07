package com.dagaga.domain.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

/**
 * @NoHtml 어노테이션의 실제 검증 로직을 구현하는 Validator
 * 
 * Jsoup 라이브러리를 사용하여 HTML 태그를 제거하고,
 * 원본 텍스트와 새니타이즈된 텍스트를 비교하여 검증합니다.
 * 
 * 작동 원리:
 * 1. 입력 텍스트에서 모든 HTML 태그 제거 (Jsoup.clean)
 * 2. 원본과 새니타이즈된 텍스트 비교
 * 3. 다르면 HTML 태그가 있었다는 의미 → 검증 실패
 */
public class NoHtmlValidator implements ConstraintValidator<NoHtml, String> {
    
    @Override
    public void initialize(NoHtml constraintAnnotation) {
        // 초기화 로직 (필요 시)
    }
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // null이나 빈 문자열은 @NotBlank 등 다른 검증으로 처리
        if (value == null || value.isEmpty()) {
            return true;
        }
        
        // Jsoup을 사용하여 모든 HTML 태그 제거
        // Safelist.none() = 모든 HTML 태그를 제거하고 텍스트만 남김
        String sanitized = Jsoup.clean(value, Safelist.none());
        
        // 원본과 새니타이즈된 텍스트가 같으면 HTML 태그가 없었다는 의미
        // 다르면 HTML이 포함되어 있었다는 의미로 검증 실패
        return value.equals(sanitized);
    }
}
