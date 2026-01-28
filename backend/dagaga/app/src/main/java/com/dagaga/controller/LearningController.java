package com.dagaga.controller;

import com.dagaga.common.constants.ApiConstants;
import com.dagaga.common.response.ApiResponse;
import com.dagaga.domain.translate.dto.TranslateResultDto;
import com.dagaga.domain.translate.service.TranslateService;
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
    private final com.dagaga.domain.learning.service.QuestionService questionService;
    
    // swagger check
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.SUCCESS_CODE,
                    description = "음성 파일 번역 성공",
                    content = @Content(schema = @Schema(implementation = TranslateResultDto.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.BAD_REQUEST_CODE,
                    description = "잘못된 요청 (파일 형식 오류, 파일 크기 초과 등)"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.PAYLOAD_TOO_LARGE_CODE,
                    description = "파일 크기 초과 (최대 10MB)"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.INTERNAL_SERVER_ERROR_CODE,
                    description = "서버 오류 또는 FastAPI 통신 오류"
            )
    })

    /**
     * 음성 번역 로직
     */
    @PostMapping(value = "/translate/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TranslateResultDto>> translateAudio(
            @Parameter(description = "업로드할 음성 파일 mp3로 요구됩니다.", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        log.info("Received audio translate request: {}", file.getOriginalFilename());
        
        try {
            // MultipartFile을 TranslateFileData로 변환
            var fileData = new com.dagaga.domain.translate.dto.TranslateFileData(
                    file.getBytes(),
                    file.getOriginalFilename(),
                    file.getSize()
            );
            
            var response = translateService.translateAudioFile(fileData);
            
            // 번역 텍스트만 추출하여 반환
            TranslateResultDto result = TranslateResultDto.builder()
                    .translatedText(response.getTranslatedText())
                    .build();
            
            return ResponseEntity.ok(ApiResponse.success("음성 파일 번역이 완료", result));
        } catch (java.io.IOException e) {
            log.error("Failed to read file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("파일을 읽는 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 특정 카테고리의 질문 목록 조회
     */
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.SUCCESS_CODE,
                    description = "질문 목록 조회 성공"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.BAD_REQUEST_CODE,
                    description = "잘못된 카테고리"
            )
    })
    @GetMapping("/categories/{categoryId}/stages")
    public ResponseEntity<ApiResponse<java.util.List<com.dagaga.domain.learning.dto.QuestionResponse>>> getQuestionsByCategory(
            @Parameter(description = "카테고리명 (예: 자기소개, 학업, 주제)", required = true)
            @PathVariable String categoryId
    ) {
        log.info("Fetching questions for category: {}", categoryId);
        
        java.util.List<com.dagaga.domain.learning.dto.QuestionResponse> questions = 
                questionService.getQuestionsByCategory(categoryId);
        
        return ResponseEntity.ok(ApiResponse.success(
                String.format("'%s' 카테고리 질문 조회 성공", categoryId), 
                questions
        ));
    }

    /**
     * 카테고리와 순서로 질문 텍스트 조회 (모국어 모드)
     */
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.SUCCESS_CODE,
                    description = "질문 텍스트 조회 성공"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.BAD_REQUEST_CODE,
                    description = "잘못된 카테고리 또는 순서"
            )
    })
    @GetMapping("/categories/{categoryId}/stages/{orderIndex}/native")
    public ResponseEntity<ApiResponse<String>> getQuestionTextForNativeMode(
            @Parameter(description = "카테고리명 (예: 자기소개, 학업, 주제)", required = true)
            @PathVariable String categoryId,
            @Parameter(description = "질문 순서 (1부터 시작)", required = true)
            @PathVariable Integer orderIndex
    ) {
        log.info("Fetching native question text for category: {}, order: {}", categoryId, orderIndex);
        
        String questionText = questionService.getQuestionText(categoryId, orderIndex);
        
        return ResponseEntity.ok(ApiResponse.success(
                "질문 조회 성공", 
                questionText
        ));
    }

    /**
     * 카테고리와 순서로 질문과 예시 답변 조회 (예시 모드)
     */
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.SUCCESS_CODE,
                    description = "질문 및 예시 답변 조회 성공"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.BAD_REQUEST_CODE,
                    description = "잘못된 카테고리 또는 순서"
            )
    })
    @GetMapping("/categories/{categoryId}/stages/{orderIndex}/example")
    public ResponseEntity<ApiResponse<com.dagaga.domain.learning.dto.QuestionWithExampleResponse>> getQuestionWithExample(
            @Parameter(description = "카테고리명 (예: 자기소개, 학업, 주제)", required = true)
            @PathVariable String categoryId,
            @Parameter(description = "질문 순서 (1부터 시작)", required = true)
            @PathVariable Integer orderIndex
    ) {
        log.info("Fetching question with example for category: {}, order: {}", categoryId, orderIndex);
        
        com.dagaga.domain.learning.dto.QuestionWithExampleResponse response = 
                questionService.getQuestionWithExample(categoryId, orderIndex);
        
        return ResponseEntity.ok(ApiResponse.success(
                "질문 및 예시 답변 조회 성공", 
                response
        ));
    }
    
    /**
     * 학습 카테고리 목록 조회
     * 일단 조회 단이라서 고려 해보기
     */
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.SUCCESS_CODE,
                    description = "카테고리 목록 조회 성공"
            )
    })
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<java.util.List<String>>> getCategories() {
        log.info("Fetching learning categories");
        
        var categories = java.util.Arrays.asList("자기소개", "학업", "주제");
        
        return ResponseEntity.ok(ApiResponse.success("카테고리 목록 조회 성공", categories));
    }

    /**
     * 발음 평가 API (섀도잉용)
     */
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.SUCCESS_CODE,
                    description = "발음 평가 성공"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.BAD_REQUEST_CODE,
                    description = "잘못된 요청"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = ApiConstants.INTERNAL_SERVER_ERROR_CODE,
                    description = "서버 오류 또는 FastAPI 통신 오류"
            )
    })
    @PostMapping(value = "/shadowing/evaluate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<com.dagaga.domain.learning.dto.PronunciationEvaluationResponse>> evaluatePronunciation(
            @Parameter(description = "업로드할 음성 파일", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "기대하는 텍스트 (예: '제 장점은')", required = true)
            @RequestParam("expectedText") String expectedText
    ) {
        log.info("Pronunciation evaluation request - expectedText: {}", expectedText);

        try {
            // FastAPI로 전달할 URL
            String fastApiUrl = translateService.getFastApiBaseUrl() + "/api/v1/asr/evaluate/pronunciation";

            // MultipartFile을 FastAPI로 전송
            org.springframework.util.LinkedMultiValueMap<String, Object> body = 
                new org.springframework.util.LinkedMultiValueMap<>();
            
            body.add("file", new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });
            body.add("expected_text", expectedText);
            body.add("language", "ko");

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            org.springframework.http.HttpEntity<org.springframework.util.LinkedMultiValueMap<String, Object>> requestEntity = 
                new org.springframework.http.HttpEntity<>(body, headers);

            // RestTemplate으로 FastAPI 호출
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.ResponseEntity<java.util.Map> response = 
                restTemplate.postForEntity(fastApiUrl, requestEntity, java.util.Map.class);

            // FastAPI 응답 파싱
            java.util.Map<String, Object> responseBody = response.getBody();
            
            if (responseBody == null) {
                throw new RuntimeException("FastAPI returned empty response");
            }

            // 점수 파싱
            @SuppressWarnings("unchecked")
            java.util.Map<String, Double> scoresMap = 
                (java.util.Map<String, Double>) responseBody.get("scores");
            
            com.dagaga.domain.learning.dto.PronunciationScores scores = 
                com.dagaga.domain.learning.dto.PronunciationScores.builder()
                    .accuracy(scoresMap.get("accuracy"))
                    .pronunciation(scoresMap.get("pronunciation"))
                    .fluency(scoresMap.get("fluency"))
                    .overall(scoresMap.get("overall"))
                    .build();

            // 응답 DTO 생성
            com.dagaga.domain.learning.dto.PronunciationEvaluationResponse evaluationResponse = 
                com.dagaga.domain.learning.dto.PronunciationEvaluationResponse.builder()
                    .transcribedText((String) responseBody.get("transcribed_text"))
                    .expectedText((String) responseBody.get("expected_text"))
                    .scores(scores)
                    .feedback((String) responseBody.get("feedback"))
                    .isPass((Boolean) responseBody.get("is_pass"))
                    .language((String) responseBody.get("language"))
                    .build();

            log.info("Evaluation completed - Score: {}, Pass: {}", 
                scores.getOverall(), evaluationResponse.getIsPass());

            return ResponseEntity.ok(
                ApiResponse.success("발음 평가 완료", evaluationResponse)
            );

        } catch (Exception e) {
            log.error("Pronunciation evaluation failed", e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("발음 평가 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    
}
