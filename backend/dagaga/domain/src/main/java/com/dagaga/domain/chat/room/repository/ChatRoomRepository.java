package com.dagaga.domain.chat.room.repository;

import com.dagaga.domain.chat.room.entity.RoomType;
import com.dagaga.domain.chat.room.entity.ChatRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Integer> {
    Page<ChatRoom> findByLocationId(Integer locationId, Pageable pageable);
    Page<ChatRoom> findByRoomType(RoomType roomType, Pageable pageable);
}
