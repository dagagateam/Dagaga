package com.dagaga.infra.redis;

import com.dagaga.domain.user.port.VerificationCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.concurrent.TimeUnit;

@Repository
@RequiredArgsConstructor
public class RedisVerificationCodeRepository implements VerificationCodeRepository {

    private final StringRedisTemplate redisTemplate;

    private static final String CODE_PREFIX = "CODE:";
    private static final String VERIFIED_PREFIX = "VERIFIED:";

    @Override
    public void save(String email, String code, long ttlSeconds) {
        redisTemplate.opsForValue().set(CODE_PREFIX + email, code, ttlSeconds, TimeUnit.SECONDS);
    }

    @Override
    public String findCode(String email) {
        return redisTemplate.opsForValue().get(CODE_PREFIX + email);
    }

    @Override
    public void delete(String email) {
        redisTemplate.delete(CODE_PREFIX + email);
    }

    @Override
    public void saveVerified(String email, long ttlSeconds) {
        redisTemplate.opsForValue().set(VERIFIED_PREFIX + email, "true", ttlSeconds, TimeUnit.SECONDS);
    }

    @Override
    public boolean isVerified(String email) {
        String value = redisTemplate.opsForValue().get(VERIFIED_PREFIX + email);
        return "true".equals(value);
    }
}
