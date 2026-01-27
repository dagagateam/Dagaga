# domain 모듈

비즈니스 도메인의 핵심 로직을 담당함.

### 담당 범위
- domain entity/model
- domain service
- repository
- dto

### 도메인 구성
- `auth/` : 인증/토큰/인가 로직
- `user/` : 회원 (프로필/회원정보)
- `learning/` : 발화 학습 (카테고리/스테이지/진행도 등 수정 필요)
- `board/` : 게시글/댓글/좋아요 (지원 사업 등 공지)

### 도메인별 디렉토리 구조 예시
예시1) `board` 도메인
- `board/`
    - `entity/`
    - `repository/`
    - `service/`
    - `dto/`

예시2) `chat` 도메인
- `chat/`
  - `room/`
    - `entity/ repository/ service/ dto/`
  - `message/`
    - `entity/ repository/ service/ dto/`
  - `user/`
    - `entity/ repository/ service/ dto/`

예시3) `learning` 도메인 (수정 필요)
- `learning/`
    - `category/`
        - `entity/ repository/ service/ dto/`
    - `stage/`
    - `content/`
    - `progress/`

### 의존성
- `common`만 의존