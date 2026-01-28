package com.dagaga.domain.user.service;

import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public void checkEmailDuplicate(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 이메일이 존재합니다: " + email);
        }
    }

    @Transactional
    public Long register(UserRegisterDto dto) {
        checkEmailDuplicate(dto.getEmail());

        String nickname = dto.getNickname();
        if (nickname == null || nickname.isBlank()) {
            nickname = dto.getEmail().split("@")[0];
        }

        if (userRepository.existsByNickname(nickname)) {
            throw new IllegalArgumentException("닉네임이 이미 존재합니다: " + nickname);
        }

        User user = User.builder()
                .email(dto.getEmail())
                .password(dto.getPassword()) // In real world, use PasswordEncoder!
                .nickname(nickname)
                .viewLangCode(dto.getViewLangCode())
                .nativeLangCode(dto.getNativeLangCode())
                .locationId(dto.getLocationId())
                .arrivalDate(dto.getArrivalDate())
                .build();

        return userRepository.save(user).getUserId();
    }
}
