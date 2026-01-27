# common 모듈

모든 모듈에서 공통으로 사용하는 코드(유틸/응답/예외/상수 등)를 관리함.

### 담당 범위
- 공통 예외/에러코드/예외 응답 포맷
- 공통 Response Wrapper, API 표준 응답
- 유틸(시간, 문자열, 검증 등)
- 공통 상수/타입

### 디렉토리 구조 예시
- `exception/`
    - `ErrorCode`, `Exception` 등
- `response/`
    - `ApiResponse<T>`, `PageResponse` 등
- `util/`

### 의존성
- 다른 모듈 의존 X
