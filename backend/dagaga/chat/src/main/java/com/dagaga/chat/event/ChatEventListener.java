package com.dagaga.chat.event;

import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.domain.user.event.UserLocationUpdatedEvent;
import com.dagaga.domain.user.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatEventListener {

    private final ChatRoomService chatRoomService;

    @EventListener
    @Transactional
    public void handleUserLocationUpdated(UserLocationUpdatedEvent event) {
        log.info("유저 지역 변경 이벤트 수신: userId={}, oldLoc={}, newLoc={}",
                event.getUserId(), event.getOldLocationId(), event.getNewLocationId());
        
        try {
            chatRoomService.handleUserLocationChange(
                    event.getUserId(),
                    event.getOldLocationId(),
                    event.getNewLocationId()
            );
        } catch (Exception e) {
            log.error("채팅방 지역 변경 처리 실패", e);
            throw e; // Rethrow to rollback transaction if needed (sync event)
        }
    }

    @EventListener
    @Transactional
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("유저 회원가입 이벤트 수신: userId={}, locationId={}", event.getUserId(), event.getLocationId());

        try {
            chatRoomService.joinDefaultRoom(event.getUserId(), event.getLocationId());
        } catch (Exception e) {
            log.error("신규 유저 기본 채팅방 참여 실패", e);
            // Don't rethrow here to avoid failing registration if chat room join fails (as per original logic)
            // Or maybe rethrow if strict consistency is needed. Original code logged error.
            // "채팅방 참여 실패가 회원가입 전체 실패로 이어지지 않도록 로그만 남김"
        }
    }
}
