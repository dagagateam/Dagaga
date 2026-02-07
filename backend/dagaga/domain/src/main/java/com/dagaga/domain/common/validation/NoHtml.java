package com.dagaga.domain.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * HTML 태그 및 스크립트 삽입을 방지하는 커스텀 Validator 어노테이션
 * 
 * XSS(Cross-Site Scripting) 공격을 방어하기 위해 사용자 입력에서
 * HTML 태그와 JavaScript를 제거합니다.
 * 
 * 사용 예시:
 * <pre>
 * {@code
 * @NoHtml(message = "HTML 태그는 허용되지 않습니다")
 * private String comment;
 * }
 * </pre>
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NoHtmlValidator.class)
public @interface NoHtml {
    
    /**
     * 검증 실패 시 반환할 에러 메시지
     */
    String message() default "HTML 태그는 허용되지 않습니다";
    
    /**
     * 검증 그룹 (선택사항)
     */
    Class<?>[] groups() default {};
    
    /**
     * 페이로드 (선택사항)
     */
    Class<? extends Payload>[] payload() default {};
}
