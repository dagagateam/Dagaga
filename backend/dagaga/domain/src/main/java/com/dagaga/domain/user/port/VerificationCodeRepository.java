package com.dagaga.domain.user.port;

public interface VerificationCodeRepository {
    void save(String email, String code, long ttlSeconds);
    String findCode(String email);
    void delete(String email);
    
    void saveVerified(String email, long ttlSeconds);
    boolean isVerified(String email);
}
