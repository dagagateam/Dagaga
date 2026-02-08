# JWT 인증 구현 - 설정 가이드

## 사전 요구 사항 (Prerequisites)

1. **Docker**: Docker Desktop이 실행 중이어야 합니다.
2. **Java 21**: Spring Boot 3.4.2에 필요합니다.
3. **PostgreSQL**: 데이터베이스에 접근 가능해야 합니다 (RDS 또는 로컬).

## 로컬 개발 설정 (Local Development Setup)

### 1. Redis 시작 (Start Redis)

```bash
# 프로젝트 루트로 이동
cd /Users/arinkim/GitHub/S14P11B110

# Redis 컨테이너 시작
docker compose -f docker-compose.local.yml up -d

# Redis 실행 확인
docker exec -it dagaga-redis-local redis-cli PING
# 예상 출력: PONG
```

### 2. 데이터베이스 마이그레이션 (Database Migration)

`users` 테이블에 새 필드를 추가하기 위해 마이그레이션 스크립트를 실행합니다:

```bash
# PostgreSQL 데이터베이스에 접속
psql -h dagaga.c7ymeaowsoi7.ap-northeast-2.rds.amazonaws.com -U root -d postgres

# 또는 선호하는 SQL 클라이언트를 사용합니다.
```

`docs/migrations/001_add_jwt_authentication_fields.sql`의 SQL을 실행합니다.

### 3. 백엔드 실행 (Run Backend)

```bash
cd backend/dagaga

# Gradle 사용
./gradlew bootRun

# 애플리케이션은 로컬 개발용으로 .env.local을 로드합니다.
```

### 4. 인증 테스트 (Test Authentication)

`docs/api/authentication-api.md`의 예제를 사용하거나 cURL로 테스트합니다:

```bash
# 새로운 사용자 회원가입
curl -X POST http://localhost:8080/api/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nickname": "testuser",
    "viewLangCode": "en",
    "nativeLangCode": "ko",
    "locationId": 1,
    "arrivalDate": "2026-02-01"
  }'

# 로그인
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## EC2 배포 (EC2 Deployment)

### 1. Git에 변경 사항 푸시 (Push Changes to Git)

```bash
git add .
git commit -m "feat: implement JWT authentication with Redis"
git push origin develop
```

### 2. Jenkins 자동 작업 (Jenkins will automatically):
- 업데이트된 코드로 Docker 이미지 빌드
- Docker Hub에 푸시
- EC2에서 이미지를 Pull하고 Redis 서비스와 함께 컨테이너 재시작

### 3. EC2 환경 업데이트 (Update EC2 Environment)

EC2에 SSH로 접속하여 `/home/ubuntu/.env` 파일에 다음 내용을 추가합니다:
```properties
# /home/ubuntu/.env 파일에 다음 줄 추가
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=kdMcHvZ7rO+h0rxI3WaJ4qQVLb1xH1pLUK2ttpPIyvQRM1TyBOOCuUmQRZFG0wX6FzhcIBKLbA5vDqIE1MsuoA==
JWT_ACCESS_TOKEN_EXPIRY=1800
JWT_REFRESH_TOKEN_EXPIRY=604800
MAX_CONCURRENT_SESSIONS=3
```

### 4. RDS에서 데이터베이스 마이그레이션 실행

RDS에 접속하여 마이그레이션 SQL을 실행합니다.

## 문제 해결 (Troubleshooting)

### Redis 연결 문제 (Redis Connection Issues)

```bash
# Redis 실행 여부 확인
docker ps | grep redis

# Redis 로그 확인
docker logs dagaga-redis-local

# Redis 재시작
docker compose -f docker-compose.local.yml restart
```

### 애플리케이션 시작 실패 (Application Fails to Start)

다음 항목을 확인하세요:
1. 데이터베이스 마이그레이션이 적용되지 않음
2. Redis가 실행 중이지 않음
3. 환경 변수 누락

```bash
# 애플리케이션 로그 확인
./gradlew bootRun

# 다음과 관련된 오류를 찾으세요:
# - JPA 스키마 검증 (Schema validation)
# - Redis 연결 (Redis connection)
# - JWT 설정 (JWT configuration)
```

### 토큰 문제 (Token Issues)

```bash
# Redis에 접속하여 검사
docker exec -it dagaga-redis-local redis-cli

# 저장된 토큰 확인
KEYS *
KEYS refresh_token:*
KEYS blacklist:*
KEYS user_sessions:*

# TTL 확인
TTL refresh_token:1:{tokenId}
```

## 최근 아키텍처 변경 사항 (Recent Architecture Changes)

### 1. 보안 모듈화 (Security Modularity)
- 보안 관련 모든 로직이 `:security` 모듈로 분리되었습니다.
- JWT 생성/검증, Redis 기반 토큰 관리, Spring Security 필터 체인이 포함됩니다.

### 2. 쿠키 기반 Refresh Token (Cookie-based Refresh Token)
- Refresh Token은 이제 브라우저의 `httpOnly` 쿠키(`refresh_token`)로 관리됩니다.
- 클라이언트 측에서 직접 토큰을 저장하거나 관리할 필요가 없어 보안성이 강화되었습니다.

### 3. JWT 데이터 자동 추출 (Automated JWT Data Extraction)
- Access Token의 페이로드에 `userId`, `locationId`, `viewLangCode`, `nativeLangCode`가 포함됩니다.
- 백엔드 컨트롤러에서는 `CurrentUser` 추상화를 통해 이 데이터를 자동으로 주입받아 사용합니다.

## 다음 단계 (Next Steps)

### 남은 과제 (Remaining Tasks)

1. **OAuth2 프로바이더 확장**: Google/LINE 외 추가 프로바이더 지원 고려.
2. **프론트엔드 최적화**: JWT 만료 시 자동 갱신 흐름(Axios Interceptor) 안정성 강화.

## 테스트 체크리스트 (Testing Checklist)

- [x] 유효한 자격 증명으로 회원가입 가능
- [x] 로그인 시 JWT 토큰 및 쿠키 발급 성공
- [x] Access Token으로 보호된 엔드포인트 접근 가능
- [x] 만료된 Access Token은 401 반환
- [x] Refresh Token 쿠키를 사용하여 새로운 Access Token 발급 성공
- [x] 로그아웃 시 Access Token 블랙리스트 및 쿠키 삭제 처리됨
- [x] 위치 기반 필터링이 JWT 데이터를 통해 자동으로 작동함
