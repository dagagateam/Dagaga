package com.dagaga.domain.chat.translate.port;

import java.util.List;

public interface TranslationPort {


    TranslationResult detectAndTranslate(String text, List<String> targetLangs);
}
