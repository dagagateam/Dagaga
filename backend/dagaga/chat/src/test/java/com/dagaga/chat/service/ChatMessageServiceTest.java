package com.dagaga.chat.service;

import com.dagaga.chat.dto.ChatMessageResponse;
import com.dagaga.domain.chat.message.entity.MessageTranslation;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;

import io.lettuce.core.Consumer;

import org.springframework.data.domain.Pageable;

import com.dagaga.chat.dto.MessageServiceDto.TargetedMessageResult;
import com.dagaga.chat.dto.MessageServiceDto.SaveMessageCommand;
import com.dagaga.chat.dto.MessageServiceDto.SaveMessageResult;
import com.dagaga.domain.chat.language.repository.LanguageRepository;
import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.repository.ChatMessageRepository;
import com.dagaga.domain.chat.translate.port.TranslationPort;
import com.dagaga.domain.chat.translate.port.TranslationResult;

import org.hibernate.resource.transaction.spi.TransactionStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.util.List;
import java.util.Map;
import java.util.concurrent.Executor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChatMessageServiceTest {

        @InjectMocks
        private ChatMessageService chatMessageService;

        @Mock
        private ChatMessageRepository chatMessageRepository;

        @Mock
        private LanguageRepository languageRepository;

        @Mock
        private TranslationPort translationPort;

        @Mock
        private ChatRoomService chatRoomService;

        @Mock
        private UserRepository userRepository;

        @Mock
        private TransactionTemplate transactionTemplate;

        @Mock
        private ApplicationEventPublisher eventPublisher;

        @Mock
        private Executor translationExecutor;

        @org.junit.jupiter.api.BeforeEach
        void setUp() {
            // TransactionTemplate.execute()가 콜백을 즉시 실행하도록 설정
            lenient().when(transactionTemplate.execute(any())).thenAnswer(invocation -> {
                TransactionCallback<Object> callback = invocation.getArgument(0);
                return callback.doInTransaction(new SimpleTransactionStatus());
            });

            lenient().doAnswer(invocation -> {
                Consumer<TransactionStatus> callback = invocation.getArgument(0);
                callback.accept(new SimpleTransactionStatus());
                return null;
            }).when(transactionTemplate).executeWithoutResult(any());

            // Executor가 Runnable을 즉시 실행하도록 설정
            lenient().doAnswer(invocation -> {
                Runnable runnable = invocation.getArgument(0);
                runnable.run();
                return null;
            }).when(translationExecutor).execute(any(Runnable.class));
        }

        // Reflection Helper
        private void setMsgId(ChatMessage msg, Long id) {
            try {
                java.lang.reflect.Field field = ChatMessage.class.getDeclaredField("messageId");
                field.setAccessible(true);
                field.set(msg, id);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        @Test
        @DisplayName("Success: 원본 메시지 저장 후 이벤트 발행 및 비동기 번역 요청이 수행되어야 한다")
        void saveAndPublish_shouldSaveOriginalAndPublishEventAndTriggerTranslation() {
            // given
            int roomId = 1;
            Integer userId = 100;
            Integer locationId = 10;
            String originalText = "你好";
            String nativeLang = "en"; 

            SaveMessageCommand cmd = new SaveMessageCommand(roomId, userId, originalText, nativeLang, null, null);

            // Mock User
            User mockUser = mock(User.class);
            given(mockUser.getNickname()).willReturn("User1");
            given(mockUser.getProfileImage()).willReturn("img.png");

            given(userRepository.findById(userId)).willReturn(java.util.Optional.of(mockUser));

            // Mock Repository Save
            final ChatMessage[] capturedMsg = new ChatMessage[1];
            given(chatMessageRepository.save(any(ChatMessage.class)))
                    .willAnswer(invocation -> {
                        ChatMessage msg = invocation.getArgument(0);
                        setMsgId(msg, 123L);
                        capturedMsg[0] = msg;
                        return msg;
                    });

            // Mock FindById (for translation process)
            given(chatMessageRepository.findById(any()))
                    .willAnswer(invocation -> java.util.Optional.ofNullable(capturedMsg[0]));

            // Mock dependencies for Translation
            List<String> allActiveLangs = List.of("en", "zh", "vi");
            given(languageRepository.findAllActiveLangCodes()).willReturn(allActiveLangs);

            TranslationResult mockTranslationResult = new TranslationResult("zh", Map.of(
                    "en", "Hello",
                    "vi", "Xin chào"
            ));
            given(translationPort.detectAndTranslate(eq(originalText), anyList()))
                    .willReturn(mockTranslationResult);

            // when
            chatMessageService.saveAndPublish(cmd, locationId);

            // then
            verify(chatRoomService).getRoomAndValidateLocation(roomId, locationId);

            verify(chatMessageRepository).save(any(ChatMessage.class));
            verify(eventPublisher).publishEvent(any(com.dagaga.chat.event.ChatEvents.MessageSavedEvent.class));

            verify(translationExecutor).execute(any(Runnable.class));
            verify(translationPort).detectAndTranslate(eq(originalText), anyList());
            verify(eventPublisher).publishEvent(any(com.dagaga.chat.event.ChatEvents.TranslationCompletedEvent.class));
        }
}
