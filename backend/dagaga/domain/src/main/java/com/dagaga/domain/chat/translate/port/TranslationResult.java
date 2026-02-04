package com.dagaga.domain.chat.translate.port;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TranslationResult {
    private String detectedLanguage;
    private Map<String, String> translations;
}
