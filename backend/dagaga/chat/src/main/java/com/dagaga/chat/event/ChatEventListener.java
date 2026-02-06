package com.dagaga.chat.event;

import com.dagaga.chat.dto.MessageControllerDto;
import com.dagaga.chat.dto.MessageServiceDto;
import com.dagaga.chat.service.ChatMessageService;
import com.dagaga.chat.service.ChatRoomService;
import com.dagaga.chat.service.RedisPublisher;
import com.dagaga.domain.user.event.UserLocationUpdatedEvent;
import com.dagaga.domain.user.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatEventListener {

    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;
    private final RedisPublisher redisPublisher;
    
    @org.springframework.beans.factory.annotation.Qualifier("translationExecutor")
    private final java.util.concurrent.Executor translationExecutor;

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
            throw e;
        }
    }

    @EventListener
    @Transactional
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("유저 회원가입 이벤트 수신: userId={}, locationId={}", event.getUserId(), event.getLocationId());

        if (event.getLocationId() == null) {
            log.info("지역 정보가 없어 기본 채팅방 참여를 건너뜁니다.");
            return;
        }

        try {
            chatRoomService.joinDefaultRoom(event.getUserId(), event.getLocationId());
        } catch (Exception e) {
            log.error("신규 유저 기본 채팅방 참여 실패", e);
            throw e; 
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMessageSaved(ChatEvents.MessageSavedEvent event) {
        log.info("메시지 저장 완료 이벤트 수신: roomId={}", event.roomId());
        broadcast(event.originalResult(), event.roomId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMessageTranslation(ChatEvents.MessageSavedEvent event) {
        log.info("트랜잭션 커밋 완료 후 번역 작업 시작: roomId={}", event.roomId());
        
        Long messageId = event.originalResult().result().messageId();
        Integer senderId = event.originalResult().result().senderId();
        
        translationExecutor.execute(() -> chatMessageService.processTranslationAndPublish(messageId, senderId));
    }

    @EventListener
    public void handleTranslationCompleted(ChatEvents.TranslationCompletedEvent event) {
        log.info("번역 완료 이벤트 수신: roomId={}, count={}", event.roomId(), event.translatedResults().size());
        event.translatedResults().forEach(result -> broadcast(result, event.roomId()));
    }

    private void broadcast(MessageServiceDto.TargetedMessageResult result, Integer roomId) {
        MessageControllerDto.SendMessageResponse response = new MessageControllerDto.SendMessageResponse(
                result.result().messageId(),
                result.result().roomId(),
                result.result().senderId(),
                result.result().senderNickname(),
                result.result().senderProfileImage(),
                result.result().content(),
                result.result().originalContent(),
                result.result().originalLang(),
                result.result().sentAt(),
                result.result().type()
        );

        redisPublisher.publish(
                "/sub/chat/rooms/" + roomId + "/" + result.targetLang(),
                response);
    }
}
