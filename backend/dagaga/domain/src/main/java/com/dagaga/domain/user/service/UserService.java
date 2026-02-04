package com.dagaga.domain.user.service;

import com.dagaga.domain.user.dto.SocialSignupDto;
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

import java.util.Optional;
import java.util.Random;

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
            nickname = generateUniqueNickname(dto.getEmail());
        } else {
            checkNicknameDuplicate(nickname);
        }

        // 비밀번호 암호화
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

    @Transactional
    public User registerSocialUser(SocialSignupDto dto) {
        checkEmailDuplicate(dto.getEmail());
        checkNicknameDuplicate(dto.getNickname());

        User user = User.builder()
                .email(dto.getEmail())
                .password(null) // 소셜 로그인은 비밀번호 없음
                .nickname(dto.getNickname())
                .viewLangCode(dto.getViewLangCode())
                .nativeLangCode(dto.getNativeLangCode())
                .locationId(dto.getLocationId())
                .arrivalDate(dto.getArrivalDate())
                .socialProvider("google")
                .isActive(true)
                .build();

        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
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

        // 비밀번호가 제공된 경우 업데이트
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.updatePassword(passwordEncoder.encode(dto.getPassword()));
        }

        // 닉네임 처리
        String newNickname = dto.getNickname();
        if (newNickname != null && !newNickname.equals(user.getNickname())) {
            if (newNickname.isBlank()) {
                // 닉네임이 비어있으면 이메일 기반으로 자동 생성
                newNickname = generateUniqueNickname(user.getEmail());
            } else {
                // 직접 입력한 닉네임은 중복 체크
                checkNicknameDuplicate(newNickname);
            }
        }

        user.updateProfile(
                newNickname,
                dto.getViewLangCode(),
                dto.getNativeLangCode(),
                dto.getLocationId(),
                dto.getArrivalDate(),
                dto.getProfileImage());

        return UserResponseDto.from(user);
    }

    public void verifyPassword(Integer userId, String password) {
        User user = getUserById(userId);

        // 비밀번호가 없는 사용자(소셜 로그인 전용 등)는 검증 패스
        if (user.getPassword() == null) {
            return;
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
    }

    /**
     * 유니크한 닉네임 생성 (이메일 아이디 기반 + 필요 시 4자리 랜덤 숫자)
     */
    private String generateUniqueNickname(String email) {
        String baseNickname = email.split("@")[0];
        String nickname = baseNickname;

        int attempts = 0;
        Random random = new Random();

        while (userRepository.existsByNickname(nickname) && attempts < 5) {
            nickname = baseNickname + "#" + String.format("%04d", random.nextInt(10000));
            attempts++;
        }

        // 5번 시도 후에도 중복이면 그냥 마지막 생성된 값 사용 (드문 케이스)
        // 또는 명시적으로 예외 발생 가능
        return nickname;
    }
}
