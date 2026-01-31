# 메인 API 명세서

메인 API는 기본적인 시스템 유틸리티 엔드포인트를 제공합니다.

---

## 1. 헬스 체크 (Health Check)
서버의 상태를 확인합니다.

- **엔드포인트:** `GET /health-check`
- **요청 방식:** `GET`
- **응답 본문 (Response Body):**
  - **200 OK**
    ```text
    OK
    ```
