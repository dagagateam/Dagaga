package com.dagaga.domain.chat.user.repository;

import com.dagaga.domain.chat.user.entity.ChatRoomUser;
import com.dagaga.domain.chat.user.entity.ChatRoomUserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatRoomUserRepository extends JpaRepository<ChatRoomUser, ChatRoomUserId> {
    // Optional<ChatRoomUser> findByRoomIdAndUserId(Integer roomId, Integer userId);
    // List<ChatRoomUser> findAllByUserIdAndStatus(Integer userId, UserStatus
    // status);

    @Query("SELECT u.nativeLangCode " +
            "FROM ChatRoomUser cru " +
            "JOIN User u ON cru.id.userId = u.userId " +
            "WHERE cru.id.roomId = :roomId AND cru.status = 'ACTIVE'")
    List<String> findActiveUserLanguages(@Param("roomId") Integer roomId);
}
