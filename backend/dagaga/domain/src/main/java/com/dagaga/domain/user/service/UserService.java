package com.dagaga.domain.user.service;

import com.dagaga.domain.user.dto.UserLoginDto;
import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.dto.UserResponseDto;
import com.dagaga.domain.user.dto.UserUpdateDto;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
    public User register(UserRegisterDto dto) {
        checkEmailDuplicate(dto.getEmail());

        String nickname = dto.getNickname();
        if (nickname == null || nickname.isBlank()) {
            nickname = dto.getEmail().split("@")[0];
        }

        if (userRepository.existsByNickname(nickname)) {
            throw new IllegalArgumentException("닉네임이 이미 존재합니다: " + nickname);
        }

        // Encode password
        String encodedPassword = passwordEncoder.encode(dto.getPassword());

        User user = User.builder()
                .email(dto.getEmail())
                .password(encodedPassword)
                .nickname(nickname)
                .viewLangCode(dto.getViewLangCode())
                .nativeLangCode(dto.getNativeLangCode())
                .locationId(dto.getLocationId())
                .arrivalDate(dto.getArrivalDate())
                .build();

        return userRepository.save(user);
    }

    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다");
        }

        return user;
    }

    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
    }

    public UserResponseDto getUserResponse(Integer userId) {
        User user = getUserById(userId);
        return UserResponseDto.from(user);
    }

    @Transactional
    public UserResponseDto updateUser(Integer userId, UserUpdateDto dto) {
        User user = getUserById(userId);

        // Update password if provided
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.updatePassword(passwordEncoder.encode(dto.getPassword()));
        }

        // Handle nickname
        String newNickname = dto.getNickname();
        if (newNickname != null && !newNickname.equals(user.getNickname())) {
            if (newNickname.isBlank()) {
                newNickname = user.getEmail().split("@")[0];
                // Generated nickname should also be checked for duplicates
                if (userRepository.existsByNickname(newNickname)) {
                    // If generated nickname exists, add some randomness or just fail
                    // For now, let's keep it simple and throw if both original and generated exist
                    // But typically register already handled this.
                }
            }
            checkNicknameDuplicate(newNickname);
        }

        user.updateProfile(
                newNickname,
                dto.getViewLangCode(),
                dto.getNativeLangCode(),
                dto.getLocationId(),
                dto.getArrivalDate(),
                dto.getProfileImage()
        );

        return UserResponseDto.from(user);
    }
}
