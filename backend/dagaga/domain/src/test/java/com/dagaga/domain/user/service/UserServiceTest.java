package com.dagaga.domain.user.service;

import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Test
    @DisplayName("Register: Success with generated nickname")
    void register_success_with_generated_nickname() {
        UserRegisterDto dto = UserRegisterDto.builder()
                .email("tester@naver.com")
                .password("Password123+")
                .nickname("") // Blank nickname
                .build();

        given(userRepository.existsByEmail(dto.getEmail())).willReturn(false);
        given(userRepository.existsByNickname("tester")).willReturn(false); // Should check "tester"
        given(userRepository.save(any(User.class))).willReturn(User.builder().build());

        userService.register(dto);

        verify(userRepository).existsByNickname("tester");
        verify(userRepository).save(any(User.class));
    }
}
