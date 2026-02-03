# 실시간 채팅 (STOMP) API 명세서

실시간 채팅은 WebSocket과 STOMP 프로토콜을 사용합니다.

## 기본 연결 정보
- **WebSocket Endpoint:** `/ws-chat`
- **Allowed Origins:** `*`

---

## 1. 연결 (Connection)
STOMP 연결 시 `Authorization` 헤더를 통해 JWT 인증을 수행해야 합니다.

- **URL:** `ws://{domain}/ws-chat`
- **Headers:**
  - `Authorization`: `Bearer {access_token}`

> **주의:** 브라우저의 기본 WebSocket API는 헤더 커스터마이징을 지원하지 않을 수 있습니다. 
> 이 경우 STOMP 클라이언트 라이브러리(stompjs 등)의 `connectHeaders` 옵션을 사용하여 `CONNECT` 프레임에 헤더를 포함해야 합니다.

### 연결 성공
- 서버로부터 `CONNECTED` 프레임 수신

### 연결 실패
- 토큰이 없거나 유효하지 않은 경우 연결이 종료되거나 에러 프레임 수신

---

## 2. 메시지 구독 (Subscribe)
특정 채팅방의 메시지를 수신하기 위해 구독합니다.

- **Destination:** `/sub/chat/rooms/{roomId}`
- **Path Variables:**
  - `roomId`: 채팅방 ID

### 수신 메시지 형식 (Payload)
`SendMessageResponse` 포맷으로 수신됩니다.

```json
{
  "messageId": 100,
  "roomId": 1,
  "senderId": 123,
  "originalText": "안녕하세요",
  "originalLang": "ko",
  "translations": {
    "en": "Hello",
    "ja": "こんにちは"
  },
  "sentAt": "2024-02-03T10:00:00"
}
```

---

## 3. 메시지 전송 (Publish)
채팅방에 메시지를 전송합니다.

- **Destination:** `/pub/chat/message`
- **Headers:**
  - `Authorization`: `Bearer {access_token}` (일반적으로 연결 시 인증되므로 생략될 수 있으나, 보안 컨텍스트 유지를 위해 연결 세션을 사용함)

### 전송 메시지 형식 (Payload)
`SendMessageRequest` 포맷을 사용합니다. `senderId`와 `locationId`는 JWT 토큰에서 추출되므로 포함하지 않습니다.

```json
{
  "roomId": 1,
  "originalText": "안녕하세요",
  "translatedLang": "en",        // 선택 사항 (번역 요청 시)
  "translatedText": "Hello"      // 선택 사항 (직접 번역문 제공 시)
}
```

- **필수 필드:**
  - `roomId`: 채팅방 ID
  - `originalText`: 전송할 메시지 내용
- **선택 필드:**
  - `translatedLang`: 번역된 언어 코드
  - `translatedText`: 번역된 텍스트
- **참고:**
  - `senderId`, `locationId`, `originalLang`은 **JWT 토큰**에서 자동으로 추출됩니다.

---

## 4. 에러 처리
- 인증 실패 시: WebSocket 연결이 닫히거나 에러 프레임 전송
- 권한 없음 (다른 지역 방에 메시지 전송 시): 에러 로그 발생 및 메시지 전송 실패 (클라이언트로의 명시적 에러 응답은 구현 여부에 따라 다름)
