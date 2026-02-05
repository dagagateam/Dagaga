package com.dagaga.infra.mail;

import com.dagaga.domain.user.port.EmailPort;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SmtpEmailAdapter implements EmailPort {

    private final JavaMailSender javaMailSender;

    @Override
    public void sendVerificationEmail(String email, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("[DAGAGA] 이메일 인증 코드입니다.");
        message.setText("인증 코드: " + code + "\n\n3분 이내에 입력해주세요.");

        javaMailSender.send(message);
    }

    @Override
    public void sendTempPasswordEmail(String email, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("[DAGAGA] 임시 비밀번호 발급 안내");
        message.setText("회원님의 임시 비밀번호는 다음과 같습니다.\n\n" +
                tempPassword +
                "\n\n로그인 후 반드시 비밀번호를 변경해주세요.");

        javaMailSender.send(message);
    }
}
