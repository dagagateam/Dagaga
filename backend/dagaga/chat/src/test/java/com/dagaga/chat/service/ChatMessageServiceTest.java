package com.dagaga.chat.service;

import com.dagaga.chat.dto.ChatMessageResponse;
import com.dagaga.domain.chat.message.entity.MessageTranslation;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

import com.dagaga.chat.dto.MessageServiceDto.SaveMessageCommand;
import com.dagaga.chat.dto.MessageServiceDto.SaveMessageResult;
import com.dagaga.domain.chat.language.repository.LanguageRepository;
import com.dagaga.domain.chat.message.entity.ChatMessage;
import com.dagaga.domain.chat.message.repository.ChatMessageRepository;
import com.dagaga.domain.chat.translate.port.TranslationPort;

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
class ChatMessageServiceTest {

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

        @Test
        @DisplayName("Success: 모든 활성화된 언어(본인 제외)로 번역을 수행해야 한다")
        void save_shouldTranslateToAllSupportedLanguages_exceptOriginal() {
                // given
                int roomId = 1;
                Integer senderId = 100;
                String originalText = "你好"; // 중국어
                String originalLang = "zh";

                SaveMessageCommand cmd = new SaveMessageCommand(roomId, senderId, originalText, originalLang, null,
                                null);

                // 서비스에서 지원하고 있는 모든 언어 조회 (ko, zh, vi)
                given(languageRepository.findAllActiveLangCodes())
                                .willReturn(List.of("ko", "zh", "vi"));

                // 번역 포트 호출 결과 Mocking
                // 본인 언어(zh)를 제외한 vi, ko 로 번역 요청이 가야 함
                List<String> expectedTargetLangs = List.of("ko", "vi");

                given(translationPort.translate(originalText, originalLang, expectedTargetLangs))
                                .willReturn(Map.of(
                                                "ko", "안녕하세요",
                                                "vi", "Xin chào"));

                // 메시지 저장 Mocking
                given(chatMessageRepository.save(any(ChatMessage.class)))
                                .willAnswer(invocation -> invocation.getArgument(0));

                // when
                SaveMessageResult result = chatMessageService.save(cmd);

                // then
                // TranslationPort가 올바른 타겟 언어들로 호출되었는지 검증
                verify(translationPort, times(1)).translate(originalText, originalLang, expectedTargetLangs);

                // Repository 저장 1회 호출 검증
                verify(chatMessageRepository, times(1)).save(any(ChatMessage.class));

                // 반환값 검증: 번역된 결과 개수 (2개 -> 베트남어, 한국어)
                assertThat(result.translations()).hasSize(2);

                // 특정 언어 번역 확인
                assertThat(result.translations())
                                .extracting("targetLang")
                                .containsExactlyInAnyOrder("vi", "ko");
        }

        @Test
        @DisplayName("Success: 활성 언어가 본인 언어뿐이라면 번역을 수행하지 않는다")
        void save_shouldSkipTranslation_whenNoOtherLanguagesActive() {
                // given
                SaveMessageCommand cmd = new SaveMessageCommand(1, 100, "你好", "zh", null, null);

                // 시스템에 활성 언어가 'en' 하나밖에 없다고 가정
                given(languageRepository.findAllActiveLangCodes())
                                .willReturn(List.of("zh"));

                given(chatMessageRepository.save(any(ChatMessage.class)))
                                .willAnswer(invocation -> invocation.getArgument(0));

                // when
                SaveMessageResult result = chatMessageService.save(cmd);

                // then
                // 번역 메서드는 절대 호출되지 않아야 함
                verify(translationPort, never()).translate(anyString(), anyString(), anyList());

                // 저장은 수행되어야 함
                verify(chatMessageRepository, times(1)).save(any(ChatMessage.class));

                // 반환값 검증: 번역 목록이 비어있어야 함
                assertThat(result.translations()).isEmpty();
        }

        @Test
        @DisplayName("Fail: 번역 API 호출이 실패하더라도 메시지 저장은 성공해야 한다")
        void save_shouldSucceedToSaveMessage_whenTranslationApiThrowsException() {
                // given
                SaveMessageCommand cmd = new SaveMessageCommand(1, 100, "你好", "zh", null, null);

                // 다른 언어들이 존재함
                given(languageRepository.findAllActiveLangCodes())
                                .willReturn(List.of("ko", "vi"));

                // 번역 포트에서 예외 발생
                given(translationPort.translate(any(), any(), any()))
                                .willThrow(new RuntimeException("External API Error"));

                given(chatMessageRepository.save(any(ChatMessage.class)))
                                .willAnswer(invocation -> invocation.getArgument(0));

                // when
                SaveMessageResult result = chatMessageService.save(cmd);

                // then
                verify(translationPort).translate(anyString(), anyString(), anyList());
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

            // User Mock
            User user = User.builder().nativeLangCode(nativeLang).build();
            given(userRepository.findById(userId)).willReturn(Optional.of(user));

            // 메시지 1: Original(zh), Translation(ko) -> 번역본 반환해야 함
            ChatMessage msg1 = ChatMessage.create(roomId, 2, "你好", "zh");
            MessageTranslation trans1 = MessageTranslation.create(msg1, "ko", "안녕하세요");
            msg1.addTranslation(trans1);

            // 메시지 2: Original(ko) -> 원본 반환해야 함
            ChatMessage msg2 = ChatMessage.create(roomId, 2, "반갑습니다", "ko");

            given(chatMessageRepository.findByRoomIdOrderByMessageIdDesc(eq(roomId), any(Pageable.class)))
                    .willReturn(List.of(msg1, msg2));

            // when
            List<ChatMessageResponse> result = chatMessageService.getMessages(roomId, userLocationId, userId, null, 30);

            // then
            verify(chatRoomService).getRoomAndValidateLocation(roomId, userLocationId);
            
            assertThat(result).hasSize(2);
            assertThat(result.get(0).content()).isEqualTo("안녕하세요");
            assertThat(result.get(0).isTranslated()).isTrue();
            
            assertThat(result.get(1).content()).isEqualTo("반갑습니다");
            assertThat(result.get(1).isTranslated()).isFalse();
        }
}
