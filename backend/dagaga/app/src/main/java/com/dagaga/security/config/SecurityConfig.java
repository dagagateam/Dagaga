package com.dagaga.security.config;

import com.dagaga.security.jwt.JwtAuthenticationEntryPoint;
import com.dagaga.security.jwt.JwtAuthenticationFilter;
import com.dagaga.security.oauth.CustomOAuth2SuccessHandler;
import com.dagaga.security.oauth.CustomOAuth2FailureHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
        private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;
        private final CustomOAuth2FailureHandler customOAuth2FailureHandler;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                // REST API이므로 CSRF 보안 비활성화
                                .csrf(AbstractHttpConfigurer::disable)

                                // CORS 설정 적용
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // X-Frame-Options 설정 (SockJS 지원을 위해 sameOrigin 허용)
                                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()))

                                // 세션 관리 - Stateless
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // 요청 권한 설정
                                .authorizeHttpRequests(auth -> auth
                                                // 공개 엔드포인트
                                                .requestMatchers(
                                                                "/api/v1/users/signup",
                                                                "/api/v1/users/social-signup",
                                                                "/api/v1/users/login",
                                                                "/api/v1/users/refresh",
                                                                "/api/v1/users/check-email",
                                                                "/api/v1/users/check-email",
                                                                "/api/v1/users/check-nickname",
                                                                // 이메일 인증 엔드포인트
                                                                "/api/v1/email-verification/**",
                                                                "/api/v1/users/find-password",
                                                                // 테스트용 토큰 발급 엔드포인트
                                                                "/api/v1/auth/test-token",
                                                                // WebSocket Endpoint
                                                                "/ws-chat/**",
                                                                // Swagger 엔드포인트
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/swagger-resources/**",
                                                                "/webjars/**")
                                                .permitAll()

                                                // 그 외 모든 요청은 인증 필요
                                                .anyRequest().authenticated())

                                // HTTP 보안 헤더 설정 (XSS 방어)
                                .headers(headers -> headers
                                                // XSS Protection - 브라우저의 XSS 필터 활성화
                                                .xssProtection(xss -> xss
                                                                .headerValue(org.springframework.security.web.header.writers.XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                                                // Content-Type Options - MIME 타입 스니핑 방지
                                                .contentTypeOptions(contentType -> {
                                                })
                                                // Frame Options - Clickjacking 공격 방지
                                                .frameOptions(frame -> frame.deny())
                                                // Content Security Policy - 허용된 리소스만 로드
                                                .contentSecurityPolicy(csp -> csp
                                                                .policyDirectives(
                                                                                "default-src 'self'; " +
                                                                                                "script-src 'self' 'unsafe-inline' https://accounts.google.com; "
                                                                                                +
                                                                                                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                                                                                                +
                                                                                                "font-src 'self' https://fonts.gstatic.com; "
                                                                                                +
                                                                                                "img-src 'self' data: https:; "
                                                                                                +
                                                                                                "connect-src 'self' https://api.example.io;")))

                                // OAuth2 로그인 설정 추가
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler(customOAuth2SuccessHandler)
                                                .failureHandler(customOAuth2FailureHandler))

                                // 예외 처리
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(jwtAuthenticationEntryPoint))

                                // JWT 필터 추가
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                // 보안 감사 조치: 와일드카드(*) 제거 및 명시적 도메인 허용
                configuration.setAllowedOriginPatterns(Arrays.asList(
                                "https://i14b110.p.example.io", // 배포 환경
                                "http://localhost:5173", // 로컬 개발 (Vite)
                                "http://localhost:3000" // 로컬 개발 (React/Next)
                ));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("*"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
