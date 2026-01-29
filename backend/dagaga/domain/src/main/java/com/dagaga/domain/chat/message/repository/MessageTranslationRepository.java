package com.dagaga.domain.chat.message.repository;

import com.dagaga.domain.chat.message.entity.MessageTranslation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MessageTranslationRepository
                extends JpaRepository<MessageTranslation, Long> {

        // 특정 메시지의 특정 언어 번역 조회
        Optional<MessageTranslation> findByChatMessageMessageIdAndTargetLang(
                        Long messageId,
                        String targetLang);

        // 특정 메시지의 모든 번역 조회
        // List<MessageTranslation> findAllByMessageId(Long messageId);
}
