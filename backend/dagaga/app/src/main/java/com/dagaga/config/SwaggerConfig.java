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

        // JWT 보안 스키마 정의
        String jwtSchemeName = "jwtAuth";
        io.swagger.v3.oas.models.security.SecurityScheme securityScheme = new io.swagger.v3.oas.models.security.SecurityScheme()
                .name(jwtSchemeName)
                .type(io.swagger.v3.oas.models.security.SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT");

        // 모든 API에 대해 JWT 인증 적용
        io.swagger.v3.oas.models.security.SecurityRequirement securityRequirement = new io.swagger.v3.oas.models.security.SecurityRequirement()
                .addList(jwtSchemeName);

        return new OpenAPI()
                .servers(List.of(server))
                .components(new io.swagger.v3.oas.models.Components().addSecuritySchemes(jwtSchemeName, securityScheme))
                .addSecurityItem(securityRequirement);
    }
}
