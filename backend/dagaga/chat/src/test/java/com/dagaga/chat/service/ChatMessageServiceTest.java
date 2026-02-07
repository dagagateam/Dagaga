package com.dagaga.chat.service;

import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;

import java.util.function.Consumer;


import com.dagaga.chat.dto.MessageServiceDto.SaveMessageCommand;
import com.dagaga.domain.chat.language.repository.LanguageRepository;
import com.dagaga.domain.chat.user.entity.ChatRoomUser;
import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.repository.ChatMessageRepository;
import com.dagaga.domain.common.translate.port.TranslationPort;
import com.dagaga.domain.common.translate.port.TranslationResult;

import org.springframework.transaction.TransactionStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.ArgumentCaptor;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.util.List;
import java.util.Map;

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
        @DisplayName("Success: 원본 메시지 저장 후 이벤트만 발행되어야 한다 (번역 트리거는 리스너로 이임)")
        void saveAndPublish_shouldSaveOriginalAndPublishEvent() {
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

            // when
            chatMessageService.saveAndPublish(cmd, locationId);

            // then
            verify(chatRoomService).getRoomAndValidateLocation(roomId, locationId);
            verify(chatMessageRepository).save(any(ChatMessage.class));
            verify(eventPublisher).publishEvent(any(com.dagaga.chat.event.ChatEvents.MessageSavedEvent.class));
            
            // 번역 로직은 실행되지 않아야 함
            verify(translationPort, never()).detectAndTranslate(any(), any());
        }

        @Test
        @DisplayName("Success: processTranslationAndPublish 호출 시 번역 후 이벤트 발행")
        void processTranslationAndPublish_shouldTranslateAndPublishEvent() {
            // given
            Long messageId = 123L;
            Integer senderId = 100;
            String originalText = "你好";

            // Mock User
            User mockUser = mock(User.class);
            given(mockUser.getNickname()).willReturn("User1");
            given(mockUser.getProfileImage()).willReturn("img.png");
            given(userRepository.findById(senderId)).willReturn(java.util.Optional.of(mockUser));

            // Use Real ChatMessage instead of Mock
            ChatMessage realMsg = ChatMessage.create(1, senderId, originalText, "zh");
            setMsgId(realMsg, messageId);
            // Updated message mock behavior
            given(chatMessageRepository.findById(messageId)).willReturn(java.util.Optional.of(realMsg));

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
            chatMessageService.processTranslationAndPublish(messageId, senderId);

            // then
            verify(translationPort).detectAndTranslate(eq(originalText), anyList());
            verify(transactionTemplate).executeWithoutResult(any()); // Save translations called
            verify(eventPublisher).publishEvent(any(com.dagaga.chat.event.ChatEvents.TranslationCompletedEvent.class));
        }

        @Test
        @DisplayName("Success: 번역 실패 시 원문으로 Fallback 이벤트 발행")
        void processTranslationAndPublish_shouldFallbackToOriginalText_WhenTranslationFails() {
            // given
            Long messageId = 124L;
            Integer senderId = 101;
            String originalText = "Review Needed";
            String originalLang = "en";

            // Mock User
            User mockUser = mock(User.class);
            given(mockUser.getNickname()).willReturn("UserFail");
            given(mockUser.getProfileImage()).willReturn("img.png");
            given(userRepository.findById(senderId)).willReturn(java.util.Optional.of(mockUser));

            // Real Message
            ChatMessage realMsg = ChatMessage.create(1, senderId, originalText, originalLang);
            setMsgId(realMsg, messageId);
            
            given(chatMessageRepository.findById(messageId)).willReturn(java.util.Optional.of(realMsg));

            // Mock dependencies
            List<String> allActiveLangs = List.of("en", "ko", "ja"); // Targets
            given(languageRepository.findAllActiveLangCodes()).willReturn(allActiveLangs);

            // Mock Translation Failure
            given(translationPort.detectAndTranslate(eq(originalText), anyList()))
                    .willThrow(new RuntimeException("API Failure"));

            // when
            chatMessageService.processTranslationAndPublish(messageId, senderId);

            // then
            verify(translationPort).detectAndTranslate(eq(originalText), anyList());

            // Fallback Event
            ArgumentCaptor<com.dagaga.chat.event.ChatEvents.TranslationCompletedEvent> captor = 
                ArgumentCaptor.forClass(com.dagaga.chat.event.ChatEvents.TranslationCompletedEvent.class);
            
            verify(eventPublisher).publishEvent(captor.capture());
            
            com.dagaga.chat.event.ChatEvents.TranslationCompletedEvent event = captor.getValue();
            assertThat(event.roomId()).isEqualTo(1);
            
            assertThat(event.translatedResults()).hasSize(2);
            
            // Verify 'ko' result
            var koResult = event.translatedResults().stream().filter(r -> r.targetLang().equals("ko")).findFirst();
            assertThat(koResult).isPresent();
            assertThat(koResult.get().result().content()).isEqualTo(originalText); // Fallback!

             // Verify 'ja' result
            var jaResult = event.translatedResults().stream().filter(r -> r.targetLang().equals("ja")).findFirst();
            assertThat(jaResult).isPresent();
            assertThat(jaResult.get().result().content()).isEqualTo(originalText); // Fallback!
        }
}
