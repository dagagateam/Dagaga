package com.dagaga.domain.translate.service;

import com.dagaga.domain.translate.dto.AudioTranslateResponse;
import com.dagaga.domain.translate.dto.TranslateFileData;


public interface TranslateService {
    AudioTranslateResponse translateAudioFile(TranslateFileData fileData);
    
    /**
     * FastAPI 서버 기본 URL 조회
     * @return FastAPI 서버 URL
     */
    String getFastApiBaseUrl();
}
