package com.dagaga.chat.service;

import com.dagaga.chat.dto.ChatMessageResponse;
import com.dagaga.domain.chat.message.entity.MessageTranslation;
import com.dagaga.domain.user.repository.UserRepository;
import org.springframework.data.domain.Pageable;

import com.dagaga.chat.dto.MessageServiceDto.SaveMessageCommand;
import com.dagaga.chat.dto.MessageServiceDto.SaveMessageResult;
import com.dagaga.domain.chat.language.repository.LanguageRepository;
import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.repository.ChatMessageRepository;
import com.dagaga.domain.chat.translate.port.TranslationPort;
import com.dagaga.domain.chat.translate.port.TranslationResult;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
        private org.springframework.transaction.support.TransactionTemplate transactionTemplate;

        @org.junit.jupiter.api.BeforeEach
        void setUp() {
            // TransactionTemplate.execute()가 콜백을 즉시 실행하도록 설정
            lenient().when(transactionTemplate.execute(any())).thenAnswer(invocation -> {
                org.springframework.transaction.support.TransactionCallback<Object> callback = invocation.getArgument(0);
                return callback.doInTransaction(new org.springframework.transaction.support.SimpleTransactionStatus());
            });

            lenient().doAnswer(invocation -> {
                java.util.function.Consumer<org.springframework.transaction.TransactionStatus> callback = invocation.getArgument(0);
                callback.accept(new org.springframework.transaction.support.SimpleTransactionStatus());
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
        @DisplayName("Success: 모든 활성화된 언어(본인 제외)로 번역을 수행해야 한다")
        void save_shouldTranslateToAllSupportedLanguages_exceptOriginal() {
                // given
                int roomId = 1;
                Integer senderId = 100;
                String originalText = "你好"; // 중국어
                String initialLang = "unknown"; // 처음에는 모를 수 있음

                SaveMessageCommand cmd = new SaveMessageCommand(roomId, senderId, originalText, initialLang, null,
                                null);

                // 서비스에서 지원하고 있는 모든 언어 조회 (ko, zh, vi)
                List<String> allActiveLangs = List.of("ko", "zh", "vi");
                given(languageRepository.findAllActiveLangCodes())
                                .willReturn(allActiveLangs);

                // 번역 포트 호출 결과 Mocking
                // Gemini가 zh로 감지하고, 나머지 언어로 번역 결과를 반환한다고 가정
                TranslationResult mockResult = new TranslationResult("zh", Map.of(
                                "ko", "안녕하세요",
                                "vi", "Xin chào"));

                given(translationPort.detectAndTranslate(originalText, allActiveLangs))
                                .willReturn(mockResult);

                // 메시지 저장 Mocking
                final ChatMessage[] capturedMsg = new ChatMessage[1];
                given(chatMessageRepository.save(any(ChatMessage.class)))
                                .willAnswer(invocation -> {
                                    ChatMessage msg = invocation.getArgument(0);
                                    // ID 세팅 시늉 (실제로는 JPA가 함)
                                    setMsgId(msg, 123L);
                                    capturedMsg[0] = msg;
                                    return msg;
                                });
                
                // 메시지 조회 Mocking (saveTranslations용)
                // 저장된 객체를 공유해야 업데이트가 반영됨
                given(chatMessageRepository.findById(any()))
                                .willAnswer(invocation -> java.util.Optional.ofNullable(capturedMsg[0]));

                // when
                SaveMessageResult result = chatMessageService.save(cmd);

                // then
                // TranslationPort가 올바른 타겟 언어들로 호출되었는지 검증
                verify(translationPort, times(1)).detectAndTranslate(originalText, allActiveLangs);

                // Repository 저장 1회 호출 검증 (saveOriginalMessage)
                verify(chatMessageRepository, times(1)).save(any(ChatMessage.class));
                
                // 조회 2회 (saveOriginalMessage 후, saveTranslations 전 / 후)
                verify(chatMessageRepository, atLeastOnce()).findById(any());

                // 반환값 검증: 번역된 결과 개수 (2개 -> 베트남어, 한국어)
                assertThat(result.translations()).hasSize(2);

                // 원본 언어가 업데이트 되었는지 확인 (unknown -> zh)
                assertThat(result.message().getOriginalLang()).isEqualTo("zh");

                // 특정 언어 번역 확인
                assertThat(result.translations())
                                .extracting("targetLang")
                                .containsExactlyInAnyOrder("vi", "ko");
        }

        @Test
        @DisplayName("Success: 활성 언어가 본인 언어 감지 후 다른 언어가 없다면 번역 저장을 하지 않는다")
        void save_shouldSkipTranslation_whenNoOtherLanguagesActive() {
                // given
                SaveMessageCommand cmd = new SaveMessageCommand(1, 100, "你好", "unknown", null, null);

                // 시스템에 활성 언어가 'zh' 하나밖에 없다고 가정
                List<String> activeLangs = List.of("zh");
                given(languageRepository.findAllActiveLangCodes())
                                .willReturn(activeLangs);
                
                // Gemini 감지 결과: zh
                TranslationResult mockResult = new TranslationResult("zh", Map.of());
                given(translationPort.detectAndTranslate("你好", activeLangs))
                                .willReturn(mockResult);

                // 메시지 저장 & 조회 Mocking
                // 저장된 객체를 캡처해서 findById가 반환하도록 설정 (Stateful Mock)
                final ChatMessage[] capturedMsg = new ChatMessage[1];
                
                given(chatMessageRepository.save(any(ChatMessage.class)))
                                .willAnswer(invocation -> {
                                    ChatMessage msg = invocation.getArgument(0);
                                    setMsgId(msg, 100L);
                                    capturedMsg[0] = msg;
                                    return msg;
                                });

                given(chatMessageRepository.findById(any()))
                                .willAnswer(invocation -> java.util.Optional.ofNullable(capturedMsg[0]));

                // when
                SaveMessageResult result = chatMessageService.save(cmd);

                // then
                verify(translationPort).detectAndTranslate("你好", activeLangs);

                // 저장은 수행되어야 함
                verify(chatMessageRepository, times(1)).save(any(ChatMessage.class));

                // 반환값 검증: 번역 목록이 비어있어야 함
                assertThat(result.translations()).isEmpty();
                 // 원본 언어 업데이트 확인
                assertThat(result.message().getOriginalLang()).isEqualTo("zh");
        }

        @Test
        @DisplayName("Fail: 번역 API 호출이 실패하더라도 메시지 저장은 성공해야 한다")
        void save_shouldSucceedToSaveMessage_whenTranslationApiThrowsException() {
                // given
                SaveMessageCommand cmd = new SaveMessageCommand(1, 100, "你好", "zh", null, null);

                // 다른 언어들이 존재함
                List<String> activeLangs = List.of("ko", "zh");
                given(languageRepository.findAllActiveLangCodes())
                                .willReturn(activeLangs);

                // 번역 포트에서 예외 발생
                given(translationPort.detectAndTranslate(any(), any()))
                                .willThrow(new RuntimeException("External API Error"));

                given(chatMessageRepository.save(any(ChatMessage.class)))
                                .willAnswer(invocation -> invocation.getArgument(0));

                // when
                SaveMessageResult result = chatMessageService.save(cmd);

                // then
                verify(translationPort).detectAndTranslate(anyString(), anyList());
                verify(chatMessageRepository).save(any(ChatMessage.class));
                assertThat(result.translations()).isEmpty();
        }


        @Test
        @DisplayName("Success: 사용자의 모국어에 맞는 메시지가 반환되어야 한다")
        void getMessages_shouldReturnLocalizedContent() {
            // given
            int roomId = 1;
            int userLocationId = 10;
            int userId = 100;
            String nativeLang = "ko";

            // User Mock (Removed as userId is no longer used)
            // given(userRepository.findById(userId)).willReturn(Optional.of(user));

            // 메시지 1: Original(zh), Translation(ko) -> 번역본 반환해야 함
            ChatMessage msg1 = ChatMessage.create(roomId, 2, "你好", "zh");
            MessageTranslation trans1 = MessageTranslation.create(msg1, "ko", "안녕하세요");
            msg1.addTranslation(trans1);

            // 메시지 2: Original(ko) -> 원본 반환해야 함
            ChatMessage msg2 = ChatMessage.create(roomId, 2, "반갑습니다", "ko");

            given(chatMessageRepository.findByRoomIdOrderByMessageIdDesc(eq(roomId), any(Pageable.class)))
                    .willReturn(List.of(msg1, msg2));

            // when
            List<ChatMessageResponse> result = chatMessageService.getMessages(roomId, userLocationId, nativeLang, null, 30);

            // then
            verify(chatRoomService).getRoomAndValidateLocation(roomId, userLocationId);
            
            assertThat(result).hasSize(2);
            assertThat(result.get(0).content()).isEqualTo("안녕하세요");
            assertThat(result.get(0).isTranslated()).isTrue();
            
            assertThat(result.get(1).content()).isEqualTo("반갑습니다");
            assertThat(result.get(1).isTranslated()).isFalse();
        }
}
