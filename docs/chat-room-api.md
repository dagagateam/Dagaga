# 채팅방 API 명세서

채팅방 API는 채팅방의 생성, 참여, 관리 및 메시지 조회를 위한 엔드포인트를 제공합니다.

## 기본 URL
`/api/v1/community/chats`

---

## 1. 커스텀 채팅방 생성
사용자가 지역 기반으로 새로운 채팅방을 생성합니다.

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
채팅방을 삭제합니다.

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

## 3. 기본 지역 채팅방 참여
지역 기반 기본 채팅방에 참여합니다. (기본방이 없으면 생성 후 참여)

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
사용자가 자신의 지역에 있는 다른 사용자가 생성한 채팅방에 참여합니다.

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
사용자의 지역에 있는 채팅방 목록을 조회합니다.

- **엔드포인트:** `GET /by-location`
- **요청 방식:** `GET`
- **쿼리 파라미터:**
  - `userLocationId` (Integer, 필수): 지역 ID.
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

## 6. 참여 중인 채팅방 목록 조회
사용자가 참여하고 있는 채팅방 목록을 조회합니다.

- **엔드포인트:** `GET /joined`
- **요청 방식:** `GET`
- **쿼리 파라미터:**
  - `userId` (Integer, 필수): 사용자 ID.
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

## 7. 채팅 메시지 조회
채팅방의 메시지를 조회합니다. 기본적으로 30개의 메시지를 가져옵니다.

- **엔드포인트:** `GET /{roomId}/messages`
- **요청 방식:** `GET`
- **패스 파라미터 (Path Parameters):**
  - `roomId` (Integer, 필수): 채팅방 ID.
- **쿼리 파라미터:**
  - `userLocationId` (Integer, 필수): 사용자의 지역 ID (검증용).
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
        "translations": []
      }
    ]
    ```
