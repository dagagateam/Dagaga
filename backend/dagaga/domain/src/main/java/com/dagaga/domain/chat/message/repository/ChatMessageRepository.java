package com.dagaga.domain.chat.message.repository;

import com.dagaga.domain.chat.message.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // roomId 기준으로 최신 메시지부터 조회
    List<ChatMessage> findByRoomIdOrderByMessageIdDesc(Integer roomId, Pageable pageable);

    // 커서 기반으로 이전 메시지 보기 -> 스크롤 위로 당기면 이전 메시지 더 보여주는 방식
    List<ChatMessage> findByRoomIdAndMessageIdLessThanOrderByMessageIdDesc(Integer roomId, Long messageId, Pageable pageable);
}
