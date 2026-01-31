package com.dagaga.domain.user.service;

import com.dagaga.domain.user.dto.UserLoginDto;
import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public void checkNicknameDuplicate(String nickname) {
        if (userRepository.existsByNickname(nickname)) {
            throw new IllegalArgumentException("닉네임이 이미 존재합니다: " + nickname);
        }
    }

    @Transactional
    public Integer register(UserRegisterDto dto) {
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

    public Integer login(UserLoginDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다"));

        if (!user.getPassword().equals(dto.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다");
        }

        return user.getUserId();
    }
}
