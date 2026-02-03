package com.dagaga.chat.adapter;

import com.dagaga.chat.dto.GeminiExternalDto;
import com.dagaga.domain.chat.translate.port.TranslationPort;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class TranslationAdapter implements TranslationPort {

    private final ObjectMapper objectMapper;
    private final RestOperations restTemplate = new RestTemplate();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.0-flash-lite}")
    private String model;

    @Value("${dagaga.translation.enabled:true}")
    private boolean isTranslationEnabled;

    @Override
    public Map<String, String> translate(String text, String sourceLang, List<String> targetLangs) {
        // 대상 언어가 없으면 번역하지 않음
        if (targetLangs == null || targetLangs.isEmpty()) {
            return Collections.emptyMap();
        }

        // 번역 기능 비활성화 시 빈 결과 반환
        if (!isTranslationEnabled) {
            log.debug("Translation is disabled. Skipping Gemini API call.");
            return Collections.emptyMap();
        }

        // Gemini에 보낼 프롬프트 생성
        String prompt = createPrompt(text, sourceLang, targetLangs);

        String url = String.format(
                "https://gms.ssafy.io/gmsapi/generativelanguage.googleapis.com/v1beta/models/%s:generateContent",
                model);

        try {
            // request 객체 및 header 생성
            GeminiExternalDto.GeminiRequest request = GeminiExternalDto.GeminiRequest.create(prompt);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);

            // API 호출 (POST)
            HttpEntity<GeminiExternalDto.GeminiRequest> entity = new HttpEntity<>(request, headers);
            GeminiExternalDto.GeminiResponse response = restTemplate.postForObject(url, entity,
                    GeminiExternalDto.GeminiResponse.class);

            // response 파싱해서 return
            return parseResponse(response);

        } catch (Exception e) {
            log.warn("Gemini 번역 API 호출 실패: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    private String createPrompt(String text, String sourceLang, List<String> targetLangs) {
        return String.format("""
                Translate the following text from %s to %s.
                Text: "%s"
                Output ONLY a JSON object where keys are language codes and values are translated text.
                Do not include the source language in the output.
                Example: {"ko": "안녕하세요", "en": "Hello"}
                """, sourceLang, String.join(", ", targetLangs), text);
    }

    // api 응답으로 받은 json을 map으로 변환
    private Map<String, String> parseResponse(GeminiExternalDto.GeminiResponse response) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            return Collections.emptyMap();
        }

        try {
            String jsonText = response.candidates().getFirst()
                    .content().parts().getFirst()
                    .text();

            jsonText = jsonText.replaceAll("```json|```", "").trim();
            log.debug("Raw Translation Response: {}", jsonText);

            // 배열([])로 감싸져서 오는 경우 처리
            if (jsonText.startsWith("[")) {
                 List<Map<String, String>> list = objectMapper.readValue(jsonText, new TypeReference<>() {});
                 return list.isEmpty() ? Collections.emptyMap() : list.get(0);
            }

            // json 문자열을 Map으로 변환
            return objectMapper.readValue(jsonText, new TypeReference<>() {
            });

        } catch (Exception e) {
            log.error("번역 결과 파싱 실패. Error: {}, Response: {}", e.getMessage(), response);
            return Collections.emptyMap();
        }
    }
}
