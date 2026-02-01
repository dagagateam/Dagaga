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

## 다음 단계 (Next Steps)

### 남은 과제 (Remaining Tasks)

1. **위치 기반 필터링**: 리포지토리 레벨 필터링 구현
   - `PostRepository`, `ProgramRepository` 등을 업데이트하여 locationId로 필터링
   - 서비스에서 `SecurityContextHelper.getCurrentLocationId()` 사용

2. **통합 테스트**: 테스트 커버리지 추가
   - 인증 흐름 테스트
   - 토큰 갱신 테스트
   - 동시 세션 제한 테스트

3. **OAuth 통합**: Google/LINE 로그인 구현
   - 기존 `socialProvider` 및 `socialId` 필드 사용
   - OAuth 컨트롤러 엔드포인트 생성

## 보안 알림 (Security Reminders)

- ⚠️ **프로덕션에서는 JWT_SECRET을 변경하세요!** 안전한 새 키를 생성해야 합니다.
- ⚠️ **프로덕션에서는 HTTPS를 사용하세요.** 토큰이 전송 중에 노출되지 않도록 해야 합니다.
- ⚠️ **주기적으로 비밀 키를 교체하세요.** 보안을 강화할 수 있습니다.
- ⚠️ **Redis 메모리 사용량을 모니터링하세요.** 토큰 저장으로 인해 사용량이 증가할 수 있습니다.

## 테스트 체크리스트 (Testing Checklist)

- [ ] 유효한 자격 증명으로 회원가입 가능
- [ ] 로그인 시 JWT 토큰 반환
- [ ] Access Token으로 보호된 엔드포인트 접근 가능
- [ ] 만료된 Access Token은 401 반환
- [ ] Refresh Token으로 새로운 Access Token 발급 성공
- [ ] 로그아웃 시 Access Token 블랙리스트 처리됨
- [ ] 최대 3개의 동시 세션 제한 적용됨
- [ ] 위치 기반 필터링이 올바르게 작동함
