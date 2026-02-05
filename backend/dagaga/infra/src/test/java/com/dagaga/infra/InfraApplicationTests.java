package com.dagaga.infra;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.mail.javamail.JavaMailSender;

@SpringBootTest
class InfraApplicationTests {

    @MockitoBean
    private JavaMailSender javaMailSender;

    @Test
    void contextLoads() {
    }

}
