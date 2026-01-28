package com.dagaga.domain.translate.service;

import com.dagaga.domain.translate.dto.AudioTranslateResponse;
import org.springframework.web.multipart.MultipartFile;

public interface TranslateService {
    AudioTranslateResponse translateAudioFile(MultipartFile file);
}
