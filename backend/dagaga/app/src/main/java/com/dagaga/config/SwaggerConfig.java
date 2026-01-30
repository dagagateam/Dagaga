package com.dagaga.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        // EC2에서 접속 시 상대 경로(/)를 사용하여 현재 호스트 주소를 자동으로 따라가게 함
        Server server = new Server();
        server.setUrl("/");
        server.setDescription("Default Server URL");

        return new OpenAPI()
                .servers(List.of(server));
    }
}
