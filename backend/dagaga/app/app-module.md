# app 모듈

Spring Boot 실행 모듈로, 서버를 실제로 띄우는 `@SpringBootApplication`이 존재함.
domain 모듈의 service를 호출하여 사용.

### 담당 범위
- 애플리케이션 실행
- Controller
- Configuration
    - WebMvc 설정, CORS, Swagger 등
- 인증/인가(SecurityConfig, JWT Filter/Interceptor)

### 의존성
- domain, chat, common 참조
