package com.dagaga.chat.event;

import com.dagaga.chat.dto.MessageServiceDto.TargetedMessageResult;
import java.util.List;

public class ChatEvents {
    
    public record MessageSavedEvent(
            TargetedMessageResult originalResult,
            String originalText,
            Integer roomId
    ) {}

    public record TranslationCompletedEvent(
            List<TargetedMessageResult> translatedResults,
            Integer roomId
    ) {}
}
