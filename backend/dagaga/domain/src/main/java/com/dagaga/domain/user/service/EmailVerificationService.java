package com.dagaga.domain.user.service;

import com.dagaga.domain.user.port.EmailPort;
import com.dagaga.domain.user.port.VerificationCodeRepository;
import com.dagaga.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailPort emailPort;
    private final VerificationCodeRepository verificationCodeRepository;
    private final UserRepository userRepository;

    private static final long CODE_TTL_SECONDS = 180; // 3 minutes
    private static final long VERIFIED_TTL_SECONDS = 1800; // 30 minutes

    @Transactional(readOnly = true)
    public void sendVerificationCode(String email) {
        if (userRepository.existsByEmail(email)) {
             throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        String code = generateCode();
        verificationCodeRepository.save(email, code, CODE_TTL_SECONDS);
        emailPort.sendVerificationEmail(email, code);
    }

    public void verifyCode(String email, String code) {
        String storedCode = verificationCodeRepository.findCode(email);
        
        if (storedCode == null || !storedCode.equals(code)) {
            throw new IllegalArgumentException("인증 코드가 유효하지 않습니다.");
        }

        verificationCodeRepository.delete(email);
        verificationCodeRepository.saveVerified(email, VERIFIED_TTL_SECONDS);
    }

    public boolean isVerified(String email) {
        return verificationCodeRepository.isVerified(email);
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        int num = random.nextInt(1000000);
        return String.format("%06d", num);
    }
}
