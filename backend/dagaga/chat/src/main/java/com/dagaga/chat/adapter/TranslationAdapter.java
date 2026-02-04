package com.dagaga.chat.adapter;

import com.dagaga.chat.dto.GeminiExternalDto;
import com.dagaga.domain.chat.translate.port.TranslationPort;
import com.dagaga.domain.chat.translate.port.TranslationResult;
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
    public TranslationResult detectAndTranslate(String text, List<String> targetLangs) {
        if (targetLangs == null || targetLangs.isEmpty()) {
            return new TranslationResult("unknown", Collections.emptyMap());
        }

        if (!isTranslationEnabled) {
            log.debug("번역 기능 비활성화. Gemini API 호출을 건너뜁니다.");
            return new TranslationResult("unknown", Collections.emptyMap());
        }

        String prompt = createDetectionPrompt(text, targetLangs);
        String url = String.format(
                "https://gms.ssafy.io/gmsapi/generativelanguage.googleapis.com/v1beta/models/%s:generateContent",
                model);

        try {
            GeminiExternalDto.GeminiRequest request = GeminiExternalDto.GeminiRequest.create(prompt);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);

            HttpEntity<GeminiExternalDto.GeminiRequest> entity = new HttpEntity<>(request, headers);
            GeminiExternalDto.GeminiResponse response = restTemplate.postForObject(url, entity,
                    GeminiExternalDto.GeminiResponse.class);

            return parseDetectionResponse(response);

        } catch (Exception e) {
            log.warn("번역 실패! Error: {}", e.getMessage());
            return new TranslationResult("unknown", Collections.emptyMap());
        }
    }

    private String createDetectionPrompt(String text, List<String> targetLangs) {
        String targets = String.join(", ", targetLangs);
        return String.format("""
                You are a professional translator and language detector.
                1. Detect the language of the text provided at the end.
                2. Translate the text into the following target languages: [%s].
                
                Requirements:
                1. Output ONLY a valid JSON object.
                2. The JSON must have two root keys: "detectedLanguage" and "translations".
                3. "detectedLanguage" should be the ISO 639-1 language code of the source text (e.g., 'ko', 'en', 'zh').
                4. "translations" should be a map where keys are target language codes and values are translated text.
                5. Do NOT include the detected source language in the translations map.
                6. Ensure ALL other requested target languages are included in the translations map.
                
                Example Output:
                {
                    "detectedLanguage": "ko",
                    "translations": {
                        "vi": "Xin chào",
                        "en": "Hello"
                    }
                }
                
                --- TEXT TO TRANSLATE ---
                %s
                """, targets, text);
    }

    private TranslationResult parseDetectionResponse(GeminiExternalDto.GeminiResponse response) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            return new TranslationResult("unknown", Collections.emptyMap());
        }

        try {
            String jsonText = response.candidates().getFirst()
                    .content().parts().getFirst()
                    .text();

            jsonText = jsonText.replaceAll("```json|```", "").trim();
            log.info("번역 결과 파싱 성공! Response: {}", jsonText);

            return objectMapper.readValue(jsonText, TranslationResult.class);

        } catch (Exception e) {
            log.error("번역 결과 파싱 실패! Error: {}, Response: {}", e.getMessage(), response);
            return new TranslationResult("unknown", Collections.emptyMap());
        }
    }
}
