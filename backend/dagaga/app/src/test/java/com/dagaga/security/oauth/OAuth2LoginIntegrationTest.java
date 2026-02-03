package com.dagaga.security.oauth;

import com.dagaga.domain.user.entity.User;
import com.dagaga.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class OAuth2LoginIntegrationTest {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private CustomOAuth2SuccessHandler successHandler;

        @BeforeEach
        void setUp() {
                userRepository.deleteAll();
        }

        @Test
        @DisplayName("신규 유저 구글 로그인 시 회원가입 페이지로 리다이렉트")
        void newUserRedirectsToSignup() throws Exception {
                Map<String, Object> attributes = new HashMap<>();
                attributes.put("sub", "new-user-123");
                attributes.put("email", "newuser@gmail.com");
                attributes.put("name", "New User");

                OAuth2User principal = new DefaultOAuth2User(
                                AuthorityUtils.createAuthorityList("ROLE_USER"),
                                attributes,
                                "email");

                Authentication authentication = new OAuth2AuthenticationToken(
                                principal,
                                principal.getAuthorities(),
                                "google");

                MockHttpServletRequest request = new MockHttpServletRequest();
                MockHttpServletResponse response = new MockHttpServletResponse();

                successHandler.onAuthenticationSuccess(request, response, authentication);

                assertThat(response.getRedirectedUrl()).contains("/social-signup");
                assertThat(response.getRedirectedUrl()).contains("email=newuser@gmail.com");
        }

        @Test
        @DisplayName("기존 유저 구글 로그인 시 성공 페이지로 리다이렉트 (토큰 포함)")
        void existingUserRedirectsToSuccess() throws Exception {
                // 기존 유저 미리 생성
                User existingUser = User.builder()
                                .email("existing@gmail.com")
                                .nickname("tester")
                                .viewLangCode("ko")
                                .nativeLangCode("ko")
                                .role("ROLE_USER")
                                .isActive(true)
                                .build();
                userRepository.save(existingUser);

                Map<String, Object> attributes = new HashMap<>();
                attributes.put("sub", "existing-user-123");
                attributes.put("email", "existing@gmail.com");
                attributes.put("name", "Existing User");

                OAuth2User principal = new DefaultOAuth2User(
                                AuthorityUtils.createAuthorityList("ROLE_USER"),
                                attributes,
                                "email");

                Authentication authentication = new OAuth2AuthenticationToken(
                                principal,
                                principal.getAuthorities(),
                                "google");

                MockHttpServletRequest request = new MockHttpServletRequest();
                MockHttpServletResponse response = new MockHttpServletResponse();

                successHandler.onAuthenticationSuccess(request, response, authentication);

                assertThat(response.getRedirectedUrl()).contains("/auth-success");
                assertThat(response.getRedirectedUrl()).contains("accessToken=");
                assertThat(response.getRedirectedUrl()).contains("refreshToken=");
        }
}
