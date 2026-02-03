# 사용자 및 인증 API 명세서 (User & Authentication API)

## 개요
사용자 등록, 로그인(JWT), 토큰 관리(갱신/로그아웃), 중복 확인 등 사용자 관련 모든 기능을 제공하는 API입니다.
Access Token과 Refresh Token을 사용하는 JWT 기반 인증 시스템을 포함하며, Redis를 통해 세션 및 블랙리스트를 관리합니다.

**기본 URL:** `/api/v1/users`

---

## 엔드포인트

### 1. 회원가입 (Signup)

새로운 사용자 계정을 생성합니다.

**엔드포인트:** `POST /api/v1/users/signup`

**인증:** 불필요

**요청 본문 (Request Body):**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "nickname": "username",
  "viewLangCode": "en",
  "nativeLangCode": "ko",
  "locationId": 1,
  "arrivalDate": "2026-02-01"
}
```

**응답 (Response):**
```json
200 OK
123
```

**오류 응답:**
- `400 Bad Request` - 유효성 검사 오류 또는 중복된 이메일/닉네임
```json
{
  "error": "Bad Request",
  "message": "이미 이메일이 존재합니다: user@example.com"
}
```

---

### 2. 로그인 (Login)

사용자 인증 후 JWT 토큰을 발급받습니다.

**엔드포인트:** `POST /api/v1/users/login`

**인증:** 불필요

**요청 본문 (Request Body):**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**응답 (Response):**
```json
200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 1800,
  "userId": 123
}
```

**토큰 상세:**
- `accessToken`: API 인증을 위한 단기 토큰 (30분)
  - JWT 페이로드에 `userId`, `locationId`, `viewLangCode`, `nativeLangCode`, `email`, `nickname` 포함
- `refreshToken`: 새로운 Access Token 발급을 위한 장기 토큰 (7일)
  - **보안**: `httpOnly` 쿠키(`refresh_token`)로 전송되며 클라이언트 스크립트에서 접근 불가
- `expiresIn`: Access Token 만료 시간 (초 단위)
- `userId`: 로그인한 사용자의 고유 ID

**오류 응답:**
- `400 Bad Request` - 자격 증명 오류
```json
{
  "error": "Bad Request",
  "message": "이메일 또는 비밀번호가 올바르지 않습니다"
}
```

---

### 3. Access Token 갱신 (Refresh Access Token)

Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.

**엔드포인트:** `POST /api/v1/users/refresh`

**인증:** 불필요 (Cookie에 Refresh Token 포함)

**요청 본문 (Request Body):** 없음 (빈 본문)

**응답 (Response):**
```json
200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 1800
}
```

**오류 응답:**
- `400 Bad Request` - 유효하지 않거나 만료된 Refresh Token, 또는 토큰이 존재하지 않음
```json
{
  "error": "Bad Request",
  "message": "Refresh token not found or expired"
}
```

---

### 4. 로그아웃 (Logout)

Access Token을 무효화하고 세션을 삭제합니다.

**엔드포인트:** `POST /api/v1/users/logout`

**인증:** 필요 (Bearer token)

**헤더 (Headers):**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답 (Response):**
```json
200 OK
```

**오류 응답:**
- `401 Unauthorized` - 토큰이 없거나 유효하지 않음
- `400 Bad Request` - 유효하지 않은 인증 헤더

**참고:**
- Access Token은 만료될 때까지 Redis 블랙리스트에 추가됩니다.
- 완전한 로그아웃을 위해 클라이언트에서도 저장된 토큰을 삭제해야 합니다.

---

### 5. 이메일 중복 확인 (Check Email Availability)

이메일이 가입 가능한지 확인합니다.

**엔드포인트:** `POST /api/v1/users/check-email?email={email}`

**인증:** 불필요

**쿼리 파라미터:**
- `email` (문자열, 필수): 확인할 이메일

**응답 (Response):**
```json
200 OK
```

**오류 응답:**
- `400 Bad Request` - 이미 존재하는 이메일
```json
{
  "error": "Bad Request",
  "message": "이미 이메일이 존재합니다: user@example.com"
}
```

---

### 6. 닉네임 중복 확인 (Check Nickname Availability)

닉네임이 사용 가능한지 확인합니다.

**엔드포인트:** `POST /api/v1/users/check-nickname?nickname={nickname}`

**인증:** 불필요

**쿼리 파라미터:**
- `nickname` (문자열, 필수): 확인할 닉네임

**응답 (Response):**
```json
200 OK
```

**오류 응답:**
- `400 Bad Request` - 이미 존재하는 닉네임
```json
{
  "error": "Bad Request",
  "message": "닉네임이 이미 존재합니다: username"
}
```

---

### 7. 내 정보 조회 (Get My Profile)

현재 로그인된 사용자의 프로필 정보를 조회합니다.

**엔드포인트:** `GET /api/v1/users/me`

**인증:** 필요 (Bearer token)

**응답 (Response):**
```json
200 OK
{
  "userId": 123,
  "email": "user@example.com",
  "nickname": "username",
  "viewLangCode": "ko",
  "nativeLangCode": "en",
  "locationId": 1,
  "arrivalDate": "2026-02-01",
  "profileImage": "default_avatar.png",
  "modifiedAt": "2026-02-02T12:00:00",
  "createdAt": "2026-02-01T12:00:00"
}
```

**오류 응답:**
- `401 Unauthorized` - 토큰이 없거나 유효하지 않음

---

### 8. 내 정보 수정 (Update My Profile)

현재 로그인된 사용자의 프로필 정보를 수정합니다. 모든 필드는 선택 사항입니다 (Partial Update).

**엔드포인트:** `PATCH /api/v1/users/me`

**인증:** 필요 (Bearer token)

**요청 본문 (Request Body):**
```json
{
  "password": "newSecurePassword123",
  "nickname": "newNickname",
  "viewLangCode": "en",
  "nativeLangCode": "ko",
  "locationId": 2,
  "arrivalDate": "2026-02-02",
  "profileImage": "new_profile.png"
}
```

**응답 (Response):**
```json
200 OK
{
  "userId": 123,
  "email": "user@example.com",
  "nickname": "newNickname",
  "viewLangCode": "en",
  "nativeLangCode": "ko",
  "locationId": 2,
  "arrivalDate": "2026-02-02",
  "profileImage": "new_profile.png",
  "modifiedAt": "2026-02-02T22:00:00",
  "createdAt": "2026-02-01T12:00:00"
}
```

**규칙:**
- `email`은 변경할 수 없으며 요청 본문에 포함되어도 무시됩니다.
- `password`를 포함하면 인코딩되어 업데이트됩니다.
- **필드 처리 규칙 (Partial Update):**
  - **`null`**: 해당 필드를 변경하지 않습니다. (기존 값 유지)
  - **`""` (빈 문자열)**: 해당 필드를 초기화하거나 기본값으로 복구합니다.
    - `profileImage`: `"default_avatar.png"`로 리셋됩니다.
    - `nickname`: 빈 문자열로 보낼 경우 이메일 기반으로 유니크한 닉네임이 자동 생성됩니다.
- **닉네임 자동 생성**: 닉네임이 중복될 경우 랜덤 4자리 숫자를 붙여(`user#1234`) 최대 5번까지 유니크한 닉네임 생성을 시도합니다.

**오류 응답:**
- `401 Unauthorized` - 토큰이 없거나 유효하지 않음
- `400 Bad Request` - 중복된 닉네임 등 유효성 검사 오류

---

## 보호된 엔드포인트 (Protected Endpoints)

API의 다른 모든 엔드포인트는 인증이 필요합니다. Authorization 헤더에 Access Token을 포함해야 합니다:

```
Authorization: Bearer {accessToken}
```

**예시:**
```bash
curl -X GET http://localhost:8080/api/v1/posts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**공통 오류 응답:**
- `401 Unauthorized` - 토큰 누락, 유효하지 않음, 또는 만료됨
```json
{
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/v1/posts",
  "timestamp": 1706826000000
}
```

---

## 위치/언어 자동 추출 (Automatic User Info Extraction)

보호된 엔드포인트는 Access Token의 JWT 페이로드에서 사용자 정보를 자동으로 추출합니다. 프론트엔드에서 이러한 값을 요청 파라미터로 전송할 필요가 없습니다.

### JWT 페이로드 구조
```json
{
  "sub": "123",
  "userId": 123,
  "locationId": 1,
  "viewLangCode": "ko",
  "nativeLangCode": "en",
  "email": "user@example.com",
  "nickname": "username",
  "type": "access",
  "jti": "unique-token-id",
  "iat": 1738471200,
  "exp": 1738474800
}
```

### 자동 추출되는 정보
- **`userId`**: 현재 인증된 사용자 ID
- **`locationId`**: 사용자의 지역 ID (채팅방, 프로그램 필터링에 사용)
- **`viewLangCode`**: 화면 표시 언어 코드 (TTS, 응답 메시지 등에 사용)
- **`nativeLangCode`**: 모국어 코드 (채팅 번역, 학습 콘텐츠에 사용)

### 위치 기반 필터링
`locationId`는 데이터를 자동으로 필터링하는 데 사용됩니다:
- `locationId: 1`인 사용자는 1번 지역의 게시글/채팅방만 볼 수 있습니다.
- 사용자가 위치를 변경하면(프로필 업데이트), 새로운 `locationId`가 포함된 토큰을 받기 위해 다시 로그인하거나 토큰을 갱신해야 합니다.

### 백엔드 구현 예시
```java
// 컨트롤러에서 JWT로부터 자동 추출
@GetMapping("/programs")
public ResponseEntity<?> getPrograms() {
    // JWT에서 자동으로 추출 (파라미터 불필요)
    Integer locationId = SecurityContextHelper.getCurrentLocationId();
    String viewLang = SecurityContextHelper.getCurrentViewLangCode();
    
    return programService.getByLocation(locationId, viewLang);
}
```

---

## 보안 기능 (Security Features)

### 동시 세션 제한 (Concurrent Session Limit)
- 사용자당 최대 3개의 활성 세션을 허용합니다.
- 4번째 로그인 시 가장 오래된 세션이 무효화됩니다.
- 세션은 Redis 키 `user_sessions:{userId}`로 추적됩니다.

### 토큰 블랙리스트 (Token Blacklist)
- 로그아웃된 Access Token은 블랙리스트에 추가됩니다.
- 블랙리스트는 Redis에 저장되며 토큰의 남은 만료 시간만큼 유지됩니다.
- 취소된 토큰의 재사용을 방지합니다.

### Refresh Token 저장소 (Refresh Token Storage)
- Refresh Token은 메타데이터와 함께 Redis에 저장됩니다.
- 키 패턴: `refresh_token:{userId}:{tokenId}`
- TTL: 7일
- `createdAt` 및 `lastUsedAt` 타임스탬프를 추적합니다.

---

## cURL 테스트 가이드 (Testing with cURL)

### 전체 인증 흐름 (Complete Authentication Flow)

```bash
# 1. 회원가입 (Register)
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

# 2. 로그인 (Login)
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 응답에서 accessToken과 refreshToken 저장

# 3. 보호된 엔드포인트 접근 (Access protected endpoint)
curl -X GET http://localhost:8080/api/v1/posts \
  -H "Authorization: Bearer {accessToken}"

# 4. Access Token 만료 시 토큰 갱신 (Refresh token)
# 브라우저가 쿠키에 있는 refresh_token을 자동으로 전송합니다.
curl -X POST http://localhost:8080/api/v1/users/refresh -b "refreshToken={refreshToken}"

# 5. 로그아웃 (Logout)
curl -X POST http://localhost:8080/api/v1/users/logout \
  -H "Authorization: Bearer {accessToken}"
```

---

## 환경 설정 (Environment Configuration)

필요한 환경 변수:

```properties
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET={your-secret-key}
JWT_ACCESS_TOKEN_EXPIRY=1800
JWT_REFRESH_TOKEN_EXPIRY=604800

# Security
MAX_CONCURRENT_SESSIONS=3
```

---

## 참고 (Notes)

- 비밀번호는 BCrypt를 사용하여 해싱됩니다.
- 토큰은 HS256 알고리즘으로 서명됩니다.
- 응답의 모든 타임스탬프는 밀리초(Unix epoch) 단위입니다.
- OAuth 통합(Google, LINE)은 준비되어 있으나 아직 구현되지 않았습니다.
