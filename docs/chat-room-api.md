# 채팅방 API 명세서

채팅방 API는 채팅방의 생성, 참여, 관리 및 메시지 조회를 위한 엔드포인트를 제공합니다.

## 기본 URL
`/api/v1/chat/rooms`

---

## 1. 커스텀 채팅방 생성
사용자가 새로운 커스텀 채팅방을 생성합니다.

- **엔드포인트:** `POST /`
- **요청 방식:** `POST`
- **바디 (Body):**
  ```json
  {
    "userId": 123,
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
특정 채팅방을 삭제합니다.

- **엔드포인트:** `DELETE /{roomId}`
- **요청 방식:** `DELETE`
- **패스 파라미터 (Path Parameters):**
  - `roomId` (Integer, 필수): 삭제할 채팅방 ID.
- **쿼리 파라미터:**
  - `requesterId` (Integer, 필수): 삭제를 요청하는 사용자 ID.
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {}
    ```

---

## 3. 기본 채팅방 참여
특정 지역의 기본 채팅방이 존재하는지 확인하고 사용자를 참여시킵니다.

- **엔드포인트:** `POST /default/join`
- **요청 방식:** `POST`
- **쿼리 파라미터:**
  - `userId` (Integer, 필수): 사용자 ID.
  - `locationId` (Integer, 필수): 지역 ID.
- **응답 본문 (Response Body):**
  - **200 OK** (채팅방 ID 반환)
    ```json
    1
    ```

---

## 4. 채팅방 참여
사용자를 특정 채팅방에 참여시킵니다.

- **엔드포인트:** `POST /{roomId}/join`
- **요청 방식:** `POST`
- **패스 파라미터 (Path Parameters):**
  - `roomId` (Integer, 필수): 채팅방 ID.
- **쿼리 파라미터:**
  - `userId` (Integer, 필수): 사용자 ID.
  - `userLocationId` (Integer, 필수): 사용자의 지역 ID (검증용).
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {}
    ```

---

## 5. 지역별 채팅방 목록 조회
특정 지역의 모든 활성 채팅방(기본 및 커스텀)을 조회합니다.

- **엔드포인트:** `GET /by-location`
- **요청 방식:** `GET`
- **쿼리 파라미터:**
  - `userLocationId` (Integer, 필수): 지역 ID.
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    [
      {
        "roomId": 1,
        "creatorId": 123,
        "locationId": 1,
        "title": "기본 채팅방",
        "maxParticipants": 100,
        "roomType": "DEFAULT",
        "status": "ACTIVE",
        "createdAt": "2024-01-01T10:00:00Z",
        "updatedAt": "2024-01-01T10:00:00Z"
      }
    ]
    ```

---

## 6. 채팅 메시지 조회
특정 채팅방의 메시지를 커서 기반 페이징으로 조회합니다.

- **엔드포인트:** `GET /{roomId}/messages`
- **요청 방식:** `GET`
- **패스 파라미터 (Path Parameters):**
  - `roomId` (Integer, 필수): 채팅방 ID.
- **쿼리 파라미터:**
  - `userLocationId` (Integer, 필수): 사용자의 지역 ID (검증용).
  - `cursor` (Long, 선택): 시작할 메시지 ID (이전 메시지 조회를 위해 제외됨).
  - `size` (Integer, 기본값: 30): 가져올 메시지 수.
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
        "translations": []
      }
    ]
    ```
