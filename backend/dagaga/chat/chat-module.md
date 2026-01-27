# chat 모듈

채팅 기능에서의 WebSocket/STOMP 설정, 채팅방/메시지/번역 등의 기술적인 부분을 관리함.

### 담당 범위
- WebSocket/STOMP config
- 채팅방 생성/조회/참여자 관리
- 메시지 송수신/저장/조회
- 번역 api 연동
- application service

### 디렉토리 구조 예시
- `com.dagaga.chat`
    - `config/`
    - `room/`
        - `ChatRoomService.java`
    - `message/`
    - `translate/`

### 의존성
- `domain`, `common` 참조
