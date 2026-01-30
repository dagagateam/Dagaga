package com.dagaga.domain.translate.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranslateResultDto {
    @JsonProperty("translated_text")
    private String translatedText;
    
    @JsonProperty("words")
    private List<String> words;
    
    @JsonProperty("pronunciation_guide")
    private List<String> pronunciationGuide;
}
