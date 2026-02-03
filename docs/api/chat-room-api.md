# 채팅방 API 명세서

채팅방 API는 채팅방의 생성, 참여, 관리 및 메시지 조회를 위한 엔드포인트를 제공합니다.
모든 요청은 **Authorization Header**에 유효한 **JWT Access Token**이 포함되어야 합니다.

## 기본 URL
`/api/v1/community/chats`

---

## 1. 커스텀 채팅방 생성
사용자가 지역 기반으로 새로운 채팅방을 생성합니다. (생성자의 지역 ID로 자동 설정됩니다.)

- **엔드포인트:** `POST /`
- **요청 방식:** `POST`
- **헤더:** `Authorization: Bearer {token}`
- **바디 (Body):**
  ```json
  {
    "title": "내 멋진 채팅방"
  }
  ```
- **응답 본문 (Response Body):**
  - **200 OK** (채팅방 ID 반환)
    ```json
    1
    ```

---

## 2. 채팅방 삭제
채팅방을 삭제합니다. 생성자만 삭제할 수 있습니다.

- **엔드포인트:** `DELETE /{roomId}`
- **요청 방식:** `DELETE`
- **헤더:** `Authorization: Bearer {token}`
- **패스 파라미터 (Path Parameters):**
  - `roomId` (Integer, 필수): 삭제할 채팅방 ID.
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {}
    ```

---

## 3. 채팅방 참여
사용자가 자신의 지역에 있는 유저 생성 채팅방에 참여합니다.

- **엔드포인트:** `POST /{roomId}/join`
- **요청 방식:** `POST`
- **헤더:** `Authorization: Bearer {token}`
- **패스 파라미터 (Path Parameters):**
  - `roomId` (Integer, 필수): 채팅방 ID.
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {}
    ```

---

## 4. 지역별 채팅방 목록 조회
사용자의 지역에 있는 채팅방 목록을 조회합니다. (토큰에서 지역 ID 추출)

- **엔드포인트:** `GET /by-location`
- **요청 방식:** `GET`
- **헤더:** `Authorization: Bearer {token}`
- **쿼리 파라미터:**
  - `sortBy` (String, 선택, 기본값: "popularity"): 정렬 기준. ("popularity" 또는 "latest")
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    [
      {
        "roomId": 1,
        "title": "기본 채팅방",
        "roomType": "DEFAULT",
        "creatorNickname": "시스템",
        "participantCount": 50
      },
      {
        "roomId": 2,
        "title": "우리동네 수다방",
        "roomType": "CUSTOM",
        "creatorNickname": "다가가",
        "participantCount": 5
      }
    ]
    ```

---

## 5. 참여 중인 채팅방 목록 조회
사용자가 참여하고 있는 채팅방 목록을 조회합니다.

- **엔드포인트:** `GET /joined`
- **요청 방식:** `GET`
- **헤더:** `Authorization: Bearer {token}`
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    [
      {
        "roomId": 1,
        "title": "기능 테스트용 방",
        "roomType": "CUSTOM",
        "creatorNickname": "에이전트",
        "participantCount": 10
      }
    ]
    ```

---

## 6. 채팅 메시지 조회
채팅방의 메시지를 조회합니다. 기본적으로 30개의 메시지를 가져옵니다.

- **엔드포인트:** `GET /{roomId}/messages`
- **요청 방식:** `GET`
- **헤더:** `Authorization: Bearer {token}`
- **패스 파라미터 (Path Parameters):**
  - `roomId` (Integer, 필수): 채팅방 ID.
- **쿼리 파라미터:**
  - `cursor` (Long, 선택): 기준 메시지 ID. (null이면 가장 최신 메시지부터 가져옴. 있으면 해당 ID 이전의 과거 메시지 반환)
  - `size` (Integer, 기본값: 30): 가져올 메시지 개수. (최대 100개)
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    [
      {
        "messageId": 100,
        "roomId": 1,
        "senderId": 123,
        "originalText": "안녕하세요!",
        "originalLang": "ko",
        "sentAt": "2024-01-01T12:00:00Z",
        "isTranslated": false,
        "content": "안녕하세요!"
      }
    ]
    ```

---
