package com.dagaga.controller;

import com.dagaga.common.response.ApiResponse;
import com.dagaga.domain.translate.dto.TranslateResultDto;
import com.dagaga.domain.translate.service.TranslateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/v1/learning")
@RequiredArgsConstructor
@Tag(name = "Learning API", description = "학습 관련 API")
public class LearningController {

    private final TranslateService translateService;
    // swagger check
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "음성 파일 번역 성공",
                    content = @Content(schema = @Schema(implementation = TranslateResultDto.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (파일 형식 오류, 파일 크기 초과 등)"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "413",
                    description = "파일 크기 초과 (최대 10MB)"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "서버 오류 또는 FastAPI 통신 오류"
            )
    })
    @PostMapping(value = "/translate/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TranslateResultDto>> translateAudio(
            @Parameter(description = "업로드할 음성 파일 (mp3, wav, ogg, m4a, flac, aac, wma, webm)", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        log.info("Received audio translate request: {}", file.getOriginalFilename());
        
        var response = translateService.translateAudioFile(file);
        
        // 번역 텍스트만 추출하여 반환
        TranslateResultDto result = TranslateResultDto.builder()
                .translatedText(response.getTranslatedText())
                .build();
        
        return ResponseEntity.ok(ApiResponse.success("음성 파일 번역이 완료", result));
    }
}
