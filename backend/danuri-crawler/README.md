# Danuri 프로그램 크롤러

다누리(Live in Korea) 웹사이트의 다문화 프로그램 정보를 자동으로 수집하는 크롤러입니다.

## 주요 기능

- 프로그램 목록 페이지 크롤링 (최대 10페이지)
- 중복 데이터 자동 필터링
- **로컬 모드**: JSON 파일과 로컬 폴더에 저장
- **클라우드 모드**: AWS S3 + PostgreSQL (RDS)에 저장
- 이미지 자동 다운로드 및 저장

## 폴더 구조

```
danuri-crawler/
├── data/                    # 크롤링 결과물 저장 폴더 (로컬 모드)
│   ├── images/              # 게시글별 이미지 저장 (.jpg, .png)
│   └── programs.json        # 전체 크롤링 데이터 기록 파일 (JSON)
├── logs/                    # 크롤링 실행 로그 기록 (에러 추적용)
├── src/                     # 소스 코드 관리
│   ├── __init__.py
│   ├── main.py              # 크롤러 실행 메인 스크립트
│   ├── parser.py            # BeautifulSoup 기반 HTML 파싱 로직 분리
│   ├── storage.py           # 로컬/S3 저장 관련 기능 함수 모음
│   ├── database.py          # PostgreSQL 데이터베이스 연동 함수
│   └── utils.py             # 날짜 파싱, 숫자 정제 등 유틸리티 함수
├── config/                  # 환경 설정 파일
│   └── settings.py          # URL, 저장 경로 등 전역 변수 설정
├── .env                     # 환경 변수 (DB 접속 정보 및 AWS 키)
├── .env.example             # 환경 변수 예시 파일
├── requirements.txt         # 설치 필요한 라이브러리 목록
└── README.md                # 실행 방법 및 프로젝트 설명
```

## 설치 방법

### 1. 필수 패키지 설치

```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

그리고 `.env` 파일을 편집하여 실제 값을 입력합니다.

## 사용 방법

### 간편 실행 (권장)

실행 스크립트를 사용하면 더 쉽게 실행할 수 있습니다:

```bash
# 로컬 모드로 실행
./run.sh local

# 클라우드 모드로 실행
./run.sh cloud
```

### 로컬 모드 (기본값)

로컬 파일 시스템에 데이터를 저장합니다.

```bash
# .env 파일 설정
STORAGE_MODE=local

# 실행
export PYTHONPATH=$(pwd)
python -m src.main
```

결과물:

- `data/programs.json`: 모든 프로그램 데이터
- `data/images/`: 프로그램 이미지 파일들

### 클라우드 모드

AWS S3와 PostgreSQL (RDS)에 데이터를 저장합니다.

#### 1. AWS 설정 확인

먼저 AWS 연결을 테스트합니다:

```bash
python test_aws_config.py
```

#### 2. .env 파일 설정

```bash
STORAGE_MODE=cloud
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=your-bucket-name
DB_HOST=your-db-host.rds.amazonaws.com
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

#### 3. 실행

```bash
export PYTHONPATH=$(pwd)
python -m src.main
```

결과물:

- S3 버킷: `s3://your-bucket-name/programs/` 경로에 이미지 저장
- RDS: `programs` 테이블에 프로그램 정보, `program_images` 테이블에 이미지 URL 저장

## 데이터베이스 스키마 (클라우드 모드)

### programs 테이블

```sql
CREATE TABLE programs (
    article_seq INTEGER PRIMARY KEY,
    region VARCHAR(100),
    title TEXT NOT NULL,
    reg_start VARCHAR(50),
    reg_end VARCHAR(50),
    target TEXT,
    capacity VARCHAR(50),
    prog_start VARCHAR(50),
    prog_end VARCHAR(50),
    contact TEXT,
    status VARCHAR(50),
    content_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### program_images 테이블

```sql
CREATE TABLE program_images (
    id SERIAL PRIMARY KEY,
    article_seq INTEGER REFERENCES programs(article_seq) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 수집 데이터 필드

- `article_seq`: 게시글 고유번호
- `region`: 지역
- `title`: 프로그램 제목
- `reg_start`, `reg_end`: 접수기간 시작/종료
- `target`: 대상
- `prog_start`, `prog_end`: 프로그램기간 시작/종료
- `capacity`: 인원
- `contact`: 문의처
- `status`: 상태 (접수중, 마감 등)
- `content_text`: 프로그램 본문 내용
- `image_urls` (cloud) / `local_images` (local): 이미지 경로

## 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요 (보안)
- AWS 크레덴셜과 데이터베이스 비밀번호를 안전하게 관리하세요
- 클라우드 모드 사용 시 AWS S3 버킷과 RDS 인스턴스가 미리 생성되어 있어야 합니다
- 데이터베이스 테이블은 첫 실행 시 자동으로 생성됩니다

## 배치 작업 설정

TODO: 매일 아침 4시에 배치 작업 실행
