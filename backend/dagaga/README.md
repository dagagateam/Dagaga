## 프로젝트 구조

Gradle 멀티모듈 기반 구성

`dagaga/`
- `app/` : Spring Boot 실행 모듈
- `domain/` : 비즈니스 도메인 모듈
- `chat/` : 채팅(WebSocket/STOMP) 모듈
- `common/` : 공통 유틸/응답/예외 처리 모듈
- `infra/` : 배포/운영 관련 파일(도커, CI/CD 등)

---

## 실행 환경

### 버전
- Java 17+
- Spring boot 5.0.2

### 실행 모듈
- 서버 실행은 `app` 모듈에서만 수행

---

## 실행 방법

### 1. 전체 빌드
```bash
./gradlew build
```
### 2. 백엔드 실행 (Spring Boot)
```bash
./gradlew -t :app:classes
./gradlew :app:bootRun
```

### 3. API 문서 (Swagger)

Swagger UI:
http://localhost:8080/swagger-ui/index.html

OpenAPI JSON:
http://localhost:8080/v3/api-docs

### 4. 개발 편의 기능 (Hot Reload)

**IntelliJ 설정**

Settings > Compiler

✅ Build project automatically

Settings > Advanced Settings

✅ Allow auto-make to start even if developed application is currently running


터미널을 2개 열어 아래처럼 실행.

터미널 1:

```bash
./gradlew -t :app:classes
```
터미널 2:

```bash
./gradlew :app:bootRun
```
