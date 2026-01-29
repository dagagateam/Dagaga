package com.dagaga.chat.adapter.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

public class GeminiExternalDto {

    public record GeminiRequest(List<Content> contents, GenerationConfig generationConfig) {
        public static GeminiRequest create(String text) {
            return new GeminiRequest(
                    List.of(new Content(List.of(new Part(text)))),
                    new GenerationConfig("application/json"));
        }
    }

    public record Content(List<Part> parts) {
    }

    public record Part(String text) {
    }

    public record GenerationConfig(String response_mime_type) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GeminiResponse(List<Candidate> candidates) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Candidate(Content content) {
    }
}
