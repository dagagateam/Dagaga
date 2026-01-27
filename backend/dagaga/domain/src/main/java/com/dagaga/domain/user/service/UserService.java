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

    private static final String EMAIL_REGEX = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);

    // Password: 8+ chars, English, Number, Special(*+-) only.
    private static final String PASSWORD_REGEX = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[*+-])[A-Za-z\\d*+-]{8,}$";
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(PASSWORD_REGEX);

    public void checkEmailDuplicate(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 이메일이 존재합니다: " + email);
        }
    }

    public void validateEmailFormat(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("이메일 형식이 유효하지 않습니다: " + email);
        }
    }

    public void validatePassword(String password) {
        if (password == null) {
            throw new IllegalArgumentException("비밀번호는 비어있을 수 없습니다");
        }
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException("비밀번호는 최소 8자 이상, 영문, 숫자, 특수문자(*, +, -)만 포함해야 합니다");
        }
    }

    @Transactional
    public Long register(UserRegisterDto dto) {
        validateEmailFormat(dto.getEmail());
        checkEmailDuplicate(dto.getEmail());
        validatePassword(dto.getPassword());

        if (userRepository.existsByNickname(dto.getNickname())) {
            throw new IllegalArgumentException("닉네임이 이미 존재합니다: " + dto.getNickname());
        }

        User user = User.builder()
                .email(dto.getEmail())
                .password(dto.getPassword()) // In real world, use PasswordEncoder!
                .nickname(dto.getNickname())
                .viewLangCode(dto.getViewLangCode())
                .nativeLangCode(dto.getNativeLangCode())
                .locationId(dto.getLocationId())
                .arrivalDate(dto.getArrivalDate())
                .build();

        return userRepository.save(user).getUserId();
    }
}
