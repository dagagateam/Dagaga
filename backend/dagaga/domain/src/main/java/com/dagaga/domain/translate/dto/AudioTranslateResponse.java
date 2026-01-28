package com.dagaga.domain.translate.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioTranslateResponse {
    @JsonProperty("original_text")
    private String originalText;
    
    @JsonProperty("original_language")
    private String originalLanguage;
    
    @JsonProperty("translated_text")
    private String translatedText;
    
    @JsonProperty("target_language")
    private String targetLanguage;
}
