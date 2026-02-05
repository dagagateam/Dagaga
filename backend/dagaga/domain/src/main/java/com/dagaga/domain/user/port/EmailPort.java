package com.dagaga.domain.user.port;

public interface EmailPort {
    void sendVerificationEmail(String email, String code);

    void sendTempPasswordEmail(String email, String tempPassword);
}
