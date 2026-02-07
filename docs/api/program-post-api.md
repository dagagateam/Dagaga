# 프로그램 게시글 API 명세서

프로그램 게시글 API는 크롤링 기반의 프로그램 공지사항 및 해당 댓글을 조회하고 관리하는 엔드포인트를 제공합니다.

## 다국어 지원

이 API는 사용자의 `viewLangCode`(JWT에 포함)에 따라 자동으로 번역된 콘텐츠를 반환합니다.
- **지원 언어**: 베트남어(`vi`), 중국어(`zh`)
- 사용자가 한국어(`ko`)가 아닌 다른 언어로 설정한 경우, 번역된 제목과 내용이 자동으로 반환됩니다.
- 번역은 Gemini API를 사용하여 동기화 시점에 생성됩니다.

## 기본 URL
`/api/v1/community/programs`

---

## 1. 프로그램 게시글 목록 조회
페이징 처리된 프로그램 게시글 목록을 가져옵니다.

- **엔드포인트:** `GET /`
- **요청 방식:** `GET`
- **인증:** Bearer Token (JWT) 필요
- **쿼리 파라미터:**
  - `page` (Integer, 기본값: 0): 페이지 번호.
  - `size` (Integer, 기본값: 10): 페이지당 항목 수.
- **동작 설명:**
  - JWT의 `locationId`를 기준으로 해당 지역의 프로그램 게시글을 조회합니다.
  - JWT의 `viewLangCode`가 `vi` 또는 `zh`인 경우, 자동으로 번역된 제목이 반환됩니다.
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {
      "success": true,
      "message": "프로그램 게시글 조회가 완료되었습니다.",
      "data": {
        "content": [
          {
            "postId": 1,
            "category": "교육",
            "contact": "02-123-4567",
            "title": "한국어 교실",  // viewLangCode가 'vi'면 베트남어 제목으로 변환
            "locationId": 1,
            "viewCount": 100,
            "createdAt": "2024-01-01T10:00:00",
            "updatedAt": "2024-01-01T12:00:00",
            "capacity": "20명",
            "regStartDate": "2024-02-01",
            "regEndDate": "2024-02-15",
            "progStartDate": "2024-03-01",
            "progEndDate": "2024-03-31",
            "imageUrls": ["https://example.com/image.jpg"]
          }
        ],
        "pageable": { ... },
        "totalElements": 1,
        "totalPages": 1,
        ...
      }
    }
    ```

---

## 2. 프로그램 게시글 상세 조회
특정 프로그램 게시글의 상세 내용을 가져옵니다.

- **엔드포인트:** `GET /{postId}`
- **요청 방식:** `GET`
- **인증:** Bearer Token (JWT) 필요
- **패스 파라미터 (Path Parameters):**
  - `postId` (Integer, 필수): 게시글 ID.
- **동작 설명:**
  - JWT의 `viewLangCode`가 `vi` 또는 `zh`인 경우, 자동으로 번역된 제목과 내용이 반환됩니다.
  - 조회 시 `viewCount`가 1 증가합니다.
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {
      "success": true,
      "message": "프로그램 게시글 상세 조회가 완료되었습니다.",
      "data": {
        "postId": 1,
        "category": "교육",
        "contact": "02-123-4567",
        "title": "한국어 교실",  // 번역된 제목
        "content": "한국어 교실에 대한 상세 설명...",  // 번역된 내용
        "locationId": 1,
        "viewCount": 101,
        "createdAt": "2024-01-01T10:00:00",
        "updatedAt": "2024-01-01T12:00:00",
        "capacity": "20명",
        "regStartDate": "2024-02-01",
        "regEndDate": "2024-02-15",
        "progStartDate": "2024-03-01",
        "progEndDate": "2024-03-31",
        "imageUrls": ["https://example.com/image.jpg"]
      }
    }
    ```
  - **400 Bad Request** (게시글을 찾을 수 없음)
    ```json
    {
      "success": false,
      "message": "게시글을 찾을 수 없음",
      "data": null
    }
    ```

---

## 3. 프로그램 데이터 동기화
크롤링된 프로그램 데이터를 기반으로 게시글을 생성하거나 업데이트하고, 베트남어와 중국어 번역을 생성합니다.

- **엔드포인트:** `POST /sync`
- **요청 방식:** `POST`
- **인증:** Bearer Token (JWT) 필요
- **동작 설명:**
  - `programs` 테이블의 모든 데이터를 조회하여 `posts` 테이블에 게시글로 변환합니다.
  - 각 게시글의 제목과 내용을 Gemini API로 번역하여 `program_post_translations` 테이블에 저장합니다.
  - **Rate Limiting**: API 호출 제한을 위해 각 번역 후 1초 지연이 적용됩니다.
  - 대량 동기화 시 시간이 소요될 수 있습니다 (500개 게시글 기준 약 8~10분).
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {
      "success": true,
      "message": "프로그램 데이터 동기화가 완료되었습니다.",
      "data": null
    }
    ```

---

## 4. 댓글 작성
프로그램 게시글에 댓글 또는 답글을 작성합니다.

- **엔드포인트:** `POST /{postId}/comments`
- **요청 방식:** `POST`
- **패스 파라미터 (Path Parameters):**
  - `postId` (Integer, 필수): 게시글 ID.
- **바디 (Body):**
  ```json
  {
    "content": "댓글 내용입니다.",
    "parentCommentId": null
  }
  ```
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {
      "success": true,
      "message": "댓글이 작성되었습니다.",
      "data": null
    }
    ```
  - **400 Bad Request** (유효성 검사 실패)

---

## 5. 댓글 목록 조회
특정 게시글의 모든 댓글과 답글을 계층 구조로 조회합니다.

- **엔드포인트:** `GET /{postId}/comments`
- **요청 방식:** `GET`
- **패스 파라미터 (Path Parameters):**
  - `postId` (Integer, 필수): 게시글 ID.
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {
      "success": true,
      "message": "댓글 조회가 완료되었습니다.",
      "data": [
        {
          "commentId": 1,
          "userId": 123,
          "nickname": "작성자1",
          "content": "댓글 내용입니다.",
          "createdAt": "2024-01-01T15:00:00",
          "replies": [
            {
              "commentId": 2,
              "userId": 456,
              "nickname": "작성자2",
              "content": "답글 내용입니다.",
              "createdAt": "2024-01-01T16:00:00",
              "replies": []
            }
          ]
        }
      ]
    }
    ```
