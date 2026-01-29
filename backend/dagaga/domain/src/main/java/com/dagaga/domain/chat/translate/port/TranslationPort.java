package com.dagaga.domain.chat.translate.port;

import java.util.List;
import java.util.Map;

public interface TranslationPort {
    Map<String, String> translate(String text, String sourceLang, List<String> targetLangs);
}
