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

## 2. 사용자 회원가입
시스템에 새로운 사용자를 등록합니다.

- **엔드포인트:** `POST /signup`
- **요청 방식:** `POST`
- **바디 (Body):**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123*",
    "nickname": "사용자닉네임",
    "viewLangCode": "ko",
    "nativeLangCode": "en",
    "locationId": 1,
    "arrivalDate": "2024-01-01"
  }
  ```
- **응답 본문 (Response Body):**
  - **200 OK** (사용자 ID 반환)
    ```json
    123
    ```
  - **400 Bad Request** (유효성 검사 실패 또는 중복된 사용자)
    ```json
    {
      "success": false,
      "message": "닉네임이 이미 존재합니다: 사용자닉네임",
      "data": null
    }
    ```

---

## 3. 사용자 로그인
사용자를 인증하고 사용자 ID를 반환합니다.

- **엔드포인트:** `POST /login`
- **요청 방식:** `POST`
- **바디 (Body):**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123*"
  }
  ```
- **응답 본문 (Response Body):**
  - **200 OK** (사용자 ID 반환)
    ```json
    123
    ```
  - **400 Bad Request** (잘못된 인증 정보)
    ```json
    {
      "success": false,
      "message": "이메일 또는 비밀번호가 올바르지 않습니다",
      "data": null
    }
    ```
