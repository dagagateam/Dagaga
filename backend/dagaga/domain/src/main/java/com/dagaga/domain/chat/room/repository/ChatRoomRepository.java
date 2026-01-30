package com.dagaga.domain.chat.room.repository;

import com.dagaga.domain.chat.room.entity.ChatRoom;
import com.dagaga.domain.chat.room.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Integer> {
    Optional<ChatRoom> findByLocationIdAndRoomType(Integer locationId, RoomType roomType);

    // 내 지역에서 유효한 채팅방 목록 조회
    // 정렬 순서: 지역 기본 채팅방이 가장 먼저, 그 다음은 인기순 혹은 최신순
    @Query("SELECT r FROM ChatRoom r " +
            "WHERE r.locationId = :locationId " +
            "AND r.status = 'ACTIVE' " +
            "ORDER BY CASE WHEN r.roomType = 'DEFAULT' THEN 0 ELSE 1 END ASC, " +
            "CASE WHEN :sort = 'popularity' THEN (SELECT count(cru) FROM ChatRoomUser cru WHERE cru.id.roomId = r.roomId AND cru.status = 'ACTIVE') END DESC, "
            +
            "CASE WHEN :sort = 'recent' THEN r.createdAt END DESC")
    List<ChatRoom> findAllByLocationWithSort(@Param("locationId") Integer locationId, @Param("sort") String sort);

    List<ChatRoom> findAllByLocationIdOrderByRoomTypeAscRoomIdAsc(Integer locationId);
}
