# API 명세서 - 프로그램 게시글 및 댓글

다문화 가족 지원 프로그램 정보 게시글 및 사용자 댓글 시스템에 대한 문서입니다.

## 기본 URL
`api/v1/community/programs`

---

## 1. 프로그램 게시글 관리

### 1-1. 프로그램 게시글 목록 조회
크롤링된 행사 정보를 공지사항 형태로 변환하여 페이징된 목록으로 조회합니다.

- **URL**: `/`
- **메서드**: `GET`
- **쿼리 파라미터**:
    - `page` (Integer, 기본값: 0): 페이지 번호
    - `size` (Integer, 기본값: 10): 페이지 크기
- **응답 (200 SUCCESS)**:
```json
{
  "success": true,
  "message": "프로그램 게시글 조회가 완료되었습니다.",
  "data": {
    "content": [
      { ... }
    ],
    "pageable": { ... },
    "totalElements": 1,
    "totalPages": 1
  }
}
```

### 1-2. 프로그램 게시글 상세 조회
특정 프로그램 게시글의 상세 내용을 조회하고 조회수를 1 증가시킵니다.

- **URL**: `/{postId}`
- **메서드**: `GET`
- **응답 (200 SUCCESS)**:
```json
{
  "success": true,
  "message": "프로그램 게시글 상세 조회가 완료되었습니다.",
  "data": {
    "postId": 1,
    "category": "PROGRAM",
    "contact": "010-1234-5678",
    "title": "다문화 가족 한국어 교실",
    "content": "한국어 초급 반 모집 안내입니다...",
    "locationId": 102,
    "viewCount": 11,
    "createdAt": "2026-01-29T10:00:00",
    "updatedAt": "2026-01-29T10:00:00",
    "capacity": "20명",
    "imageUrls": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]
  }
}
```

### 1-3. 프로그램 데이터 동기화
크롤링된 프로그램 데이터를 기반으로 커뮤니티 게시글을 생성하는 수동 동기화 작업을 트리거합니다.

- **URL**: `/sync`
- **메서드**: `POST`
- **응답 (200 SUCCESS)**:
```json
{
  "success": true,
  "message": "프로그램 데이터 동기화가 완료되었습니다.",
  "data": null
}
```

---

## 2. 댓글 관리

### 2-1. 댓글 작성
게시글에 대한 새로운 댓글 또는 기존 댓글에 대한 대댓글을 작성합니다.

- **URL**: `/{postId}/comments`
- **메서드**: `POST`
- **요청 본문 (Request Body)**:

| 필드명 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- |
| `content` | String | 예 | 댓글 내용 |
| `userId` | Integer | 예 | 댓글을 작성하는 사용자 ID |
| `parentCommentId` | Integer | 아니오 | 부모 댓글 ID (대댓글인 경우) |

- **응답 (200 SUCCESS)**:
```json
{
  "success": true,
  "message": "댓글이 작성되었습니다.",
  "data": null
}
```

### 2-2. 댓글 목록 조회
특정 게시글에 달린 모든 댓글과 대댓글을 계층 구조로 조회합니다.

- **URL**: `/{postId}/comments`
- **메서드**: `GET`
- **응답 (200 SUCCESS)**:
```json
{
  "success": true,
  "message": "댓글 조회가 완료되었습니다.",
  "data": [
    {
      "commentId": 1,
      "userId": 1,
      "content": "이 프로그램 모집 마감되었나요?",
      "createdAt": "2026-01-29T10:30:00",
      "replies": [
        {
          "commentId": 2,
          "userId": 2,
          "content": "아직 문의처로 연락하면 접수 가능하더라고요!",
          "createdAt": "2026-01-29T11:00:00",
          "replies": []
        }
      ]
    }
  ]
}
```

---

## 3. 에러 코드

| HTTP 상태 코드 | 메시지 | 설명 |
| :--- | :--- | :--- |
| `400` | "댓글 내용은 필수입니다." | Bean Validation 검증 실패 |
| `400` | "사용자 ID는 필수입니다." | Bean Validation 검증 실패 |
| `500` | "서버 오류가 발생했습니다." | 예상치 못한 서버 내부 오류 |

---

## 4. 응답 표준화
모든 응답은 [ApiResponse.java](file:///c:/Users/SSAFY/GitHub/S14P11B110/backend/dagaga/common/src/main/java/com/dagaga/common/response/ApiResponse.java)에 정의된 구조를 따릅니다:
- `success` (boolean): 요청 성공 여부
- `message` (string): 결과 또는 에러에 대한 설명
- `data` (T): 실제 데이터 (결과 객체)
