package com.dagaga.domain.translate.service;

import com.dagaga.common.exception.VoiceProcessException;
import com.dagaga.domain.translate.dto.AudioTranslateResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
public class TranslateServiceImpl implements TranslateService {

    private final RestTemplate restTemplate;
    private final String fastapiUrl;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "mp3", "wav", "ogg", "m4a", "flac", "aac", "wma", "webm"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public TranslateServiceImpl(RestTemplate restTemplate,
                                @Value("${translate.fastapi.url}") String fastapiUrl) {
        this.restTemplate = restTemplate;
        this.fastapiUrl = fastapiUrl;
    }

    @Override
    public AudioTranslateResponse translateAudioFile(MultipartFile file) {
        // 파일 유효성 검증
        validateFile(file);

        try {
            // FastAPI 서버로 파일 전송
            return sendToFastAPI(file);
        } catch (IOException e) {
            log.error("Failed to read file: {}", file.getOriginalFilename(), e);
            throw new VoiceProcessException("파일을 읽는 중 오류가 발생했습니다.", e);
        } catch (RestClientException e) {
            log.error("Failed to send file to FastAPI server", e);
            throw new VoiceProcessException("FastAPI 서버와의 통신 중 오류가 발생했습니다.", e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        // 파일 크기 검증
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    String.format("파일 크기가 제한을 초과했습니다. (최대: %dMB)", MAX_FILE_SIZE / 1024 / 1024)
            );
        }

        // 파일 확장자 검증
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !hasValidExtension(originalFilename)) {
            throw new IllegalArgumentException(
                    "지원하지 않는 파일 형식입니다. 지원 형식: " + String.join(", ", ALLOWED_EXTENSIONS)
            );
        }

        log.info("File validation passed: {}, size: {} bytes", originalFilename, file.getSize());
    }

    private boolean hasValidExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return false;
        }
        String extension = filename.substring(lastDotIndex + 1).toLowerCase();
        return ALLOWED_EXTENSIONS.contains(extension);
    }

    private AudioTranslateResponse sendToFastAPI(MultipartFile file) throws IOException {
        log.info("Sending file to FastAPI server: {}", fastapiUrl);

        // MultipartFile을 ByteArrayResource로 변환
        ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        // Multipart 요청 본문 구성
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // FastAPI 서버로 요청 전송
        ResponseEntity<AudioTranslateResponse> response = restTemplate.exchange(
                fastapiUrl + "/api/v1/translate/audio",
                HttpMethod.POST,
                requestEntity,
                AudioTranslateResponse.class
        );

        AudioTranslateResponse responseBody = response.getBody();
        if (responseBody == null) {
            throw new VoiceProcessException("FastAPI 서버로부터 응답을 받지 못했습니다.");
        }

        log.info("Received response from FastAPI server - Translated: {} ({}→{})", 
                responseBody.getTranslatedText(),
                responseBody.getOriginalLanguage(),
                responseBody.getTargetLanguage());
        return responseBody;
    }
}
