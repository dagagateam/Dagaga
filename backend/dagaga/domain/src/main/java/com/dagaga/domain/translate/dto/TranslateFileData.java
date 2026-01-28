package com.dagaga.domain.translate.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Web 의존성 없이 파일 데이터를 전달하기 위한 DTO
 * MultipartFile 대신 사용하여 domain 계층의 웹 계층 의존성을 제거
 */
@Getter
@AllArgsConstructor
public class TranslateFileData {
    private final byte[] content;
    private final String originalFilename;
    private final long size;

    /**
     * 파일 확장자를 추출
     * @return 파일 확장자 (소문자)
     */
    public String getExtension() {
        if (originalFilename == null) {
            return "";
        }
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return originalFilename.substring(lastDotIndex + 1).toLowerCase();
    }
}
