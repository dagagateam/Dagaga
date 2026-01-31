# 사용자 API 명세서

사용자 API는 사용자 등록, 로그인, 이메일 중복 확인을 위한 엔드포인트를 제공합니다.

## 기본 URL
`/api/v1/users`

---

## 1. 이메일 중복 확인
시스템에 이미 등록된 이메일인지 확인합니다.

- **엔드포인트:** `POST /check-email`
- **요청 방식:** `POST`
- **쿼리 파라미터:**
  - `email` (String, 필수, 이메일 형식): 확인할 이메일 주소.
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {}
    ```
  - **400 Bad Request** (중복된 이메일 또는 유효하지 않은 형식)
    ```json
    {
      "success": false,
      "message": "이미 이메일이 존재합니다: example@email.com",
      "data": null
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
