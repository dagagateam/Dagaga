package com.dagaga.controller;

import com.dagaga.common.constants.ApiConstants;
import com.dagaga.common.response.ApiResponse;
import com.dagaga.domain.translate.dto.TranslateResultDto;
import com.dagaga.domain.translate.service.TranslateService;
import com.dagaga.domain.learning.service.QuestionService;
import com.dagaga.domain.learning.dto.QuestionResponse;
import com.dagaga.domain.learning.dto.QuestionWithExampleResponse;
import com.dagaga.domain.translate.dto.TranslateFileData;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.dagaga.security.context.SecurityContextHelper;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/learning")
@RequiredArgsConstructor
@Tag(name = "Learning API", description = "학습 관련 API")
public class LearningController {

        private final TranslateService translateService;
        private final QuestionService questionService;

        @Value("${gms.api.url}")
        private String gmsApiUrl;

        // swagger check
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.SUCCESS_CODE, description = "음성 파일 번역 성공", content = @Content(schema = @Schema(implementation = TranslateResultDto.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.BAD_REQUEST_CODE, description = "잘못된 요청 (파일 형식 오류, 파일 크기 초과 등)"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.PAYLOAD_TOO_LARGE_CODE, description = "파일 크기 초과 (최대 10MB)"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.INTERNAL_SERVER_ERROR_CODE, description = "서버 오류 또는 FastAPI 통신 오류")
        })

        /**
         * 음성 번역 로직
         */
        @PostMapping(value = "/translate/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<TranslateResultDto>> translateAudio(
                        @Parameter(description = "업로드할 음성 파일 mp3로 요구됩니다.", required = true) @RequestParam("file") MultipartFile file) {
                log.info("Received audio translate request: {}", file.getOriginalFilename());

                try {
                        // MultipartFile을 TranslateFileData로 변환
                        var fileData = new TranslateFileData(
                                        file.getBytes(),
                                        file.getOriginalFilename(),
                                        file.getSize());

                        var response = translateService.translateAudioFile(fileData);
                        String translatedText = response.getTranslatedText();

                        // GMS API를 호출하여 번역된 텍스트를 단어 단위로 분리
                        List<String> words = callGmsTokenizeApi(translatedText);

                        // GMS API를 호출하여 발음 가이드 생성
                        List<String> pronunciationGuide = callGmsPronunciationGuideApi(words);

                        // 번역 텍스트, 단어 리스트, 발음 가이드 반환
                        TranslateResultDto result = TranslateResultDto.builder()
                                        .translatedText(translatedText)
                                        .words(words)
                                        .pronunciationGuide(pronunciationGuide)
                                        .build();

                        return ResponseEntity.ok(ApiResponse.success("음성 파일 번역이 완료", result));
                } catch (IOException e) {
                        log.error("Failed to read file: {}", file.getOriginalFilename(), e);
                        throw new RuntimeException("파일을 읽는 중 오류가 발생했습니다.", e);
                }
        }

        /**
         * GMS API를 호출하여 텍스트를 단어 단위로 분리
         */
        private List<String> callGmsTokenizeApi(String text) {
                try {
                        String apiUrl = gmsApiUrl + "/api/v1/tokenize";

                        // 요청 본문 생성
                        Map<String, String> requestBody = new HashMap<>();
                        requestBody.put("text", text);

                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);

                        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

                        // RestTemplate으로 GMS API 호출
                        RestTemplate restTemplate = new RestTemplate();
                        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                                        apiUrl,
                                        HttpMethod.POST,
                                        requestEntity,
                                        new ParameterizedTypeReference<Map<String, Object>>() {
                                        });

                        // 응답에서 words 추출
                        Map<String, Object> responseBody = response.getBody();
                        if (responseBody != null && responseBody.containsKey("words")) {
                                @SuppressWarnings("unchecked")
                                List<String> words = (List<String>) responseBody.get("words");
                                log.info("GMS tokenization completed: {} words", words.size());
                                return words;
                        }

                        return Collections.emptyList();
                } catch (Exception e) {
                        log.error("GMS API call failed: {}", e.getMessage());
                        // GMS API 실패 시 빈 리스트 반환
                        return Collections.emptyList();
                }
        }

        /**
         * GMS API를 호출하여 발음 가이드 생성
         */
        private List<String> callGmsPronunciationGuideApi(List<String> words) {
                try {
                        String apiUrl = gmsApiUrl + "/api/v1/pronunciation-guide";

                        // 요청 본문 생성
                        Map<String, Object> requestBody = new HashMap<>();
                        requestBody.put("words", words);

                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);

                        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

                        // RestTemplate으로 GMS API 호출
                        RestTemplate restTemplate = new RestTemplate();
                        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                                        apiUrl,
                                        HttpMethod.POST,
                                        requestEntity,
                                        new ParameterizedTypeReference<Map<String, Object>>() {
                                        });

                        // 응답에서 pronunciation_guide 추출
                        Map<String, Object> responseBody = response.getBody();
                        if (responseBody != null && responseBody.containsKey("pronunciation_guide")) {
                                @SuppressWarnings("unchecked")
                                List<String> pronunciationGuide = (List<String>) responseBody
                                                .get("pronunciation_guide");
                                log.info("GMS pronunciation guide completed: {} pronunciations",
                                                pronunciationGuide.size());
                                return pronunciationGuide;
                        }

                        // 실패 시 원본 단어 그대로 반환
                        return words;
                } catch (Exception e) {
                        log.error("GMS pronunciation guide API call failed: {}", e.getMessage());
                        // GMS API 실패 시 원본 단어 그대로 반환
                        return words;
                }
        }

        /**
         * 특정 카테고리의 질문 목록 조회
         */
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.SUCCESS_CODE, description = "질문 목록 조회 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.BAD_REQUEST_CODE, description = "잘못된 카테고리")
        })
        @GetMapping("/categories/{categoryId}/stages")
        public ResponseEntity<ApiResponse<List<QuestionResponse>>> getQuestionsByCategory(
                        @Parameter(description = "카테고리명 (예: 자기소개, 학업, 의료)", required = true) @PathVariable String categoryId) {
                log.info("Fetching questions for category: {}", categoryId);

                List<QuestionResponse> questions = questionService.getQuestionsByCategory(categoryId);

                return ResponseEntity.ok(ApiResponse.success(
                                String.format("'%s' 카테고리 질문 조회 성공", categoryId),
                                questions));
        }

        /**
         * 카테고리와 순서로 질문 텍스트 조회 (모국어 모드)
         */
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.SUCCESS_CODE, description = "질문 텍스트 조회 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.BAD_REQUEST_CODE, description = "잘못된 카테고리 또는 순서")
        })
        @GetMapping("/categories/{categoryId}/stages/{orderIndex}/native")
        public ResponseEntity<ApiResponse<String>> getQuestionTextForNativeMode(
                        @Parameter(description = "카테고리명 (예: 자기소개, 학업, 의료)", required = true) @PathVariable String categoryId,
                        @Parameter(description = "질문 순서 (1부터 시작)", required = true) @PathVariable Integer orderIndex) {
                log.info("Fetching native question text for category: {}, order: {}", categoryId, orderIndex);

                String questionText = questionService.getQuestionText(categoryId, orderIndex);

                return ResponseEntity.ok(ApiResponse.success(
                                "질문 조회 성공",
                                questionText));
        }

        /**
         * 카테고리와 순서로 질문과 예시 답변 조회 (예시 모드)
         */
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.SUCCESS_CODE, description = "질문 및 예시 답변 조회 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.BAD_REQUEST_CODE, description = "잘못된 카테고리 또는 순서")
        })
        @GetMapping("/categories/{categoryId}/stages/{orderIndex}/example")
        public ResponseEntity<ApiResponse<QuestionWithExampleResponse>> getQuestionWithExample(
                        @Parameter(description = "카테고리명 (예: 자기소개, 학업, 의료)", required = true) @PathVariable String categoryId,
                        @Parameter(description = "질문 순서 (1부터 시작)", required = true) @PathVariable Integer orderIndex) {
                log.info("Fetching question with example for category: {}, order: {}", categoryId, orderIndex);

                QuestionWithExampleResponse originalResponse = questionService.getQuestionWithExample(categoryId,
                                orderIndex);

                // GMS API를 통해 단어 분리 및 발음 가이드 생성
                String exampleAnswer = originalResponse.getExampleAnswer();
                List<String> words = callGmsTokenizeApi(exampleAnswer);
                List<String> pronunciationGuide = callGmsPronunciationGuideApi(words);

                // 새로운 응답 객체 생성 (빌더 패턴 사용)
                QuestionWithExampleResponse enhancedResponse = QuestionWithExampleResponse.builder()
                                .questionText(originalResponse.getQuestionText())
                                .exampleAnswer(exampleAnswer)
                                .words(words)
                                .pronunciationGuide(pronunciationGuide)
                                .build();

                return ResponseEntity.ok(ApiResponse.success(
                                "질문 및 예시 답변 조회 성공",
                                enhancedResponse));
        }

        /*
         * 학습 카테고리 목록 조회
         * 일단 조회 단이라서 고려 해보기
         */
        /*
         * @ApiResponses(value = {
         * 
         * @io.swagger.v3.oas.annotations.responses.ApiResponse(
         * responseCode = ApiConstants.SUCCESS_CODE,
         * description = "카테고리 목록 조회 성공"
         * )
         * })
         * 
         * @GetMapping("/categories")
         * public ResponseEntity<ApiResponse<List<String>>> getCategories() {
         * log.info("Fetching learning categories");
         * 
         * var categories = Arrays.asList("자기소개", "학업", "의료");
         * 
         * return ResponseEntity.ok(ApiResponse.success("카테고리 목록 조회 성공", categories));
         * }
         */

        /**
         * 발음 평가 API (섀도잉용)
         */
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.SUCCESS_CODE, description = "발음 평가 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.BAD_REQUEST_CODE, description = "잘못된 요청"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.INTERNAL_SERVER_ERROR_CODE, description = "서버 오류 또는 FastAPI 통신 오류")
        })
        @PostMapping(value = "/shadowing/evaluate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<Boolean>> evaluatePronunciation(
                        @Parameter(description = "업로드할 음성 파일", required = true) @RequestParam("file") MultipartFile file,
                        @Parameter(description = "기대하는 텍스트 (예: '제 장점은')", required = true) @RequestParam("expectedText") String expectedText,
                        @Parameter(description = "현재 시도 횟수 (5번 이상 시 자동 합격)", required = false) @RequestParam(value = "retryCount", defaultValue = "0") Integer retryCount) {
                log.info("Pronunciation evaluation request - expectedText: {}, retryCount: {}", expectedText,
                                retryCount);

                try {
                        // FastAPI로 전달할 URL
                        String fastApiUrl = translateService.getFastApiBaseUrl() + "/api/v1/asr/evaluate/pronunciation";

                        // MultipartFile을 FastAPI로 전송
                        LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                        body.add("file", new ByteArrayResource(file.getBytes()) {
                                @Override
                                public String getFilename() {
                                        return file.getOriginalFilename() != null ? file.getOriginalFilename()
                                                        : "evaluation.wav";
                                }
                        });
                        body.add("expected_text", expectedText);
                        body.add("retry_count", retryCount);
                        body.add("language", "ko");

                        HttpHeaders headers = new HttpHeaders();
                        // headers.setContentType(MediaType.MULTIPART_FORM_DATA); // Boundary 생성은
                        // RestTemplate에 위임

                        HttpEntity<LinkedMultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

                        // RestTemplate으로 FastAPI 호출
                        RestTemplate restTemplate = new RestTemplate();
                        ResponseEntity<Map> response = restTemplate.postForEntity(fastApiUrl, requestEntity, Map.class);

                        // FastAPI 응답 파싱
                        Map<String, Object> responseBody = response.getBody();

                        if (responseBody == null) {
                                throw new RuntimeException("FastAPI returned empty response");
                        }

                        // isPass 값만 추출
                        Boolean isPass = (Boolean) responseBody.get("is_pass");

                        log.info("Evaluation completed - Pass: {}", isPass);

                        return ResponseEntity.ok(
                                        ApiResponse.success("발음 평가 완료", isPass));

                } catch (Exception e) {
                        log.error("Pronunciation evaluation failed", e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ApiResponse.error("발음 평가 중 오류가 발생했습니다: " + e.getMessage()));
                }
        }

        /**
         * 텍스트를 음성으로 변환 (TTS)
         */
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.SUCCESS_CODE, description = "TTS 변환 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.BAD_REQUEST_CODE, description = "잘못된 요청"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.INTERNAL_SERVER_ERROR_CODE, description = "서버 오류 또는 FastAPI 통신 오류")
        })
        @PostMapping("/tts")
        public ResponseEntity<byte[]> synthesizeSpeech(
                        @Parameter(description = "음성으로 변환할 텍스트", required = true) @RequestParam("text") String text) {
                // JWT에서 사용자의 화면 표시 언어 코드 추출
                String language = SecurityContextHelper.getCurrentViewLangCode();
                log.info("TTS request - text: {}, language: {} (from JWT)", text, language);

                try {
                        // FastAPI로 전달할 URL
                        String fastApiUrl = translateService.getFastApiBaseUrl() + "/api/v1/tts/synthesize";

                        // Form 데이터 준비
                        LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                        body.add("text", text);
                        body.add("language", language);

                        HttpHeaders headers = new HttpHeaders();
                        // headers.setContentType(MediaType.MULTIPART_FORM_DATA); // Boundary 생성을 위해 제거

                        HttpEntity<LinkedMultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

                        // RestTemplate으로 FastAPI 호출
                        RestTemplate restTemplate = new RestTemplate();
                        ResponseEntity<byte[]> response = restTemplate.postForEntity(fastApiUrl, requestEntity,
                                        byte[].class);

                        log.info("TTS synthesis completed successfully");

                        // 응답 헤더 설정
                        HttpHeaders responseHeaders = new HttpHeaders();
                        responseHeaders.setContentType(MediaType.parseMediaType("audio/mpeg"));
                        responseHeaders.setContentDispositionFormData("attachment", "tts_" + language + ".mp3");

                        return ResponseEntity.ok()
                                        .headers(responseHeaders)
                                        .body(response.getBody());

                } catch (Exception e) {
                        log.error("TTS synthesis failed", e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(null);
                }
        }

}
