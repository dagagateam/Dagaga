package com.dagaga.domain.chat.message.repository;

import com.dagaga.domain.chat.message.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findByRoomIdOrderByMessageIdDesc(Integer roomId, Pageable pageable);
}
