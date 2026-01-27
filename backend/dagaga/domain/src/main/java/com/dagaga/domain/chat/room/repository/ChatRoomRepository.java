package com.dagaga.domain.chat.room.repository;

import com.dagaga.domain.chat.room.entity.ChatRoom;
import com.dagaga.domain.chat.room.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Integer> {
    Optional<ChatRoom> findByLocationIdAndRoomType(Integer locationId, RoomType roomType);
}
