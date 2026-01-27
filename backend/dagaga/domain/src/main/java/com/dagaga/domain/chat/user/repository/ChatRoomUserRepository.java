package com.dagaga.domain.chat.user.repository;

import com.dagaga.domain.chat.user.entity.ChatRoomUser;
import com.dagaga.domain.chat.user.entity.ChatRoomUserId;
import com.dagaga.domain.chat.user.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomUserRepository extends JpaRepository<ChatRoomUser, ChatRoomUserId> {
    Optional<ChatRoomUser> findByRoomIdAndUserId(Integer roomId, Integer userId);
    List<ChatRoomUser> findAllByUserIdAndStatus(Integer userId, UserStatus status);
}
