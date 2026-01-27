package com.dagaga.domain.chat.user.repository;

import com.dagaga.domain.chat.user.entity.UserStatus;
import com.dagaga.domain.chat.user.entity.ChatRoomUser;
import com.dagaga.domain.chat.user.entity.ChatRoomUserId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomUserRepository extends JpaRepository<ChatRoomUser, ChatRoomUserId> {
    Optional<ChatRoomUser> findByIdRoomIdAndIdUserId(Integer roomId, Integer userId);
    long countByIdRoomIdAndStatus(Integer roomId, UserStatus status);
}
