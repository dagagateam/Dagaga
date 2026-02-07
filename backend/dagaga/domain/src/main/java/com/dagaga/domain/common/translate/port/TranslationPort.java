package com.dagaga.domain.common.translate.port;

import com.dagaga.domain.post.dto.ProgramTranslationResult;

import java.util.List;

/**
 * 범용 번역 서비스 포트
 * 채팅 메시지, 프로그램 게시글 등 다양한 텍스트 번역을 지원
 */
public interface TranslationPort {

    /**
     * 텍스트의 언어를 감지하고 지정된 언어로 번역
     * @param text 번역할 텍스트
     * @param targetLangs 번역할 언어 목록
     * @return 번역 결과
     */
    TranslationResult detectAndTranslate(String text, List<String> targetLangs);
    
    /**
     * 프로그램 게시글의 제목과 본문을 지정된 언어들로 번역
     * @param title 원본 제목
     * @param content 원본 본문
     * @param targetLangs 번역할 언어 목록 (예: ['vi', 'zh'])
     * @return 번역 결과
     */
    ProgramTranslationResult translateProgram(String title, String content, List<String> targetLangs);
}
