package com.dagaga.domain.user.service;

import com.dagaga.domain.user.dto.SocialSignupDto;
import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.dto.UserResponseDto;
import com.dagaga.domain.user.dto.UserUpdateDto;
import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import com.dagaga.domain.user.port.EmailPort;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.ApplicationEventPublisher;
import com.dagaga.domain.user.event.UserLocationUpdatedEvent;
import com.dagaga.domain.user.event.UserRegisteredEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Random;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final EmailVerificationService emailVerificationService;
    private final EmailPort emailPort;

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

        if (!emailVerificationService.isVerified(dto.getEmail())) {
            throw new IllegalArgumentException("이메일 인증이 완료되지 않았습니다.");
        }

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
                .profileImage(generateProfileImage(nickname))
                .build();

        User savedUser = userRepository.save(user);
        eventPublisher.publishEvent(new UserRegisteredEvent(savedUser.getUserId(), savedUser.getLocationId()));
        return savedUser;
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
                .profileImage(generateProfileImage(dto.getNickname()))
                .build();

        User savedUser = userRepository.save(user);
        eventPublisher.publishEvent(new UserRegisteredEvent(savedUser.getUserId(), savedUser.getLocationId()));
        return savedUser;
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
        Integer oldLocationId = user.getLocationId();

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

        // 지역이 변경되었으면 이벤트 발행
        Integer newLocationId = user.getLocationId();
        if (newLocationId != null && !newLocationId.equals(oldLocationId)) {
            eventPublisher.publishEvent(new UserLocationUpdatedEvent(userId, oldLocationId, newLocationId));
        }

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

    @Transactional
    public void findPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않았습니다"));

        // 소셜 로그인 사용자는 비밀번호 변경 불가 (또는 별도 처리)
        if (user.getSocialProvider() != null) {
            throw new IllegalArgumentException("소셜 로그인 사용자는 비밀번호를 찾을 수 없습니다.");
        }

        String tempPassword = generateTempPassword();
        user.updatePassword(passwordEncoder.encode(tempPassword));

        emailPort.sendTempPasswordEmail(email, tempPassword);
    }

    private String generateTempPassword() {
        int length = 8;
        String letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String specials = "*+-";
        String allChars = letters + digits + specials;

        StringBuilder sb = new StringBuilder();
        Random random = new Random();

        // 각 필수 카테고리에서 최소 1개씩 추가
        sb.append(letters.charAt(random.nextInt(letters.length())));
        sb.append(digits.charAt(random.nextInt(digits.length())));
        sb.append(specials.charAt(random.nextInt(specials.length())));

        // 나머지 길이는 모든 허용 문자로 채움
        for (int i = 0; i < length - 3; i++) {
            sb.append(allChars.charAt(random.nextInt(allChars.length())));
        }

        // 섞어서 무작위성 보장
        return shuffleString(sb.toString());
    }

    private String shuffleString(String input) {
        char[] characters = input.toCharArray();
        Random random = new Random();
        for (int i = 0; i < characters.length; i++) {
            int randomIndex = random.nextInt(characters.length);
            char temp = characters[i];
            characters[i] = characters[randomIndex];
            characters[randomIndex] = temp;
        }
        return new String(characters);
    }

    private String generateProfileImage(String nickname) {
        String encodedNickname = URLEncoder.encode(nickname, StandardCharsets.UTF_8);
        return "https://api.dicebear.com/9.x/big-smile/svg?seed=" + encodedNickname;
    }
}
