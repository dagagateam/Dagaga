-- 1. 지역 정보 (계층형 구조로 변경)
CREATE TABLE IF NOT EXISTS locations (
    location_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_id INT, -- 상위 지역 ID (광역시는 NULL)
    district_name VARCHAR(100) NOT NULL,
    depth INT NOT NULL DEFAULT 1, -- 1: 시/도, 2: 시/군/구
    CONSTRAINT fk_location_parent FOREIGN KEY (parent_id) REFERENCES locations(location_id) ON DELETE CASCADE
);

-- 2. 사용자 정보
-- social 부분은 해보고 결정
CREATE TABLE IF NOT EXISTS users (
    user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) UNIQUE,
    view_lang_code VARCHAR(10) NOT NULL,
    native_lang_code VARCHAR(10) NOT NULL,
    location_id INT,
    arrival_date DATE,
    profile_image VARCHAR(500) DEFAULT 'default_avatar.png', -- 미리 저장되어있던 디폴트 이미지
    social_provider VARCHAR(20),
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 게시판
CREATE TABLE IF NOT EXISTS posts (
    post_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(20) NOT NULL,
    location_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_image TEXT,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 댓글 및 대댓글
CREATE TABLE IF NOT EXISTS comments (
    comment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_comment_id INT,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 주제별 채팅방
CREATE TABLE IF NOT EXISTS chat_rooms (
    room_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    creator_id INT NOT NULL,
    location_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    max_participants INT DEFAULT 10,
    topic VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. 채팅 메시지
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_text TEXT NOT NULL,
    sender_native_lang VARCHAR(10),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. 게시글 좋아요 (사용자와 게시글의 다대다 관계)
CREATE TABLE IF NOT EXISTS post_likes (
    like_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- 한 사용자가 한 게시글에 중복으로 좋아요를 누를 수 없도록 유니크 제약 조건 추가
    UNIQUE(user_id, post_id),
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

-- 8. 다문화 가족지원 프로그램 (다누리 크롤링 데이터)
CREATE TABLE IF NOT EXISTS programs (
    program_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    article_seq INT UNIQUE NOT NULL, -- 다누리 포털의 고유 게시글 번호 (중복 크롤링 방지용)
    program_region VARCHAR(100),     -- 지역명 (locations 테이블의 district_name과 매칭)
    title VARCHAR(255) NOT NULL,      -- 프로그램 제목
    target TEXT,                     -- 대상
    capacity VARCHAR(50),            -- 인원 (문자형: '20명', '내선 문의' 등)
    contact VARCHAR(100),            -- 문의처
    status VARCHAR(50),              -- 상태 (접수, 종료, 예정 등)
    
    -- 접수 기간
    reg_start_date VARCHAR(50),
    reg_end_date VARCHAR(50),
    
    -- 프로그램 기간
    prog_start_date VARCHAR(50),
    prog_end_date VARCHAR(50),
    
    content_text TEXT,               -- 본문 텍스트
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. 프로그램 이미지 (다누리 크롤링 이미지 저장)
-- program_images는 program_id 없이 article_seq로만 관계설정
-- (다누리에서는 article_seq가 고유 식별자이기 때문)
CREATE TABLE IF NOT EXISTS program_images (
    image_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    article_seq INT NOT NULL,        -- programs.article_seq 참조
    image_url TEXT NOT NULL,         -- S3 또는 로컬 저장 경로
    image_order INT NOT NULL DEFAULT 0, -- 이미지 순서
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_program_images_article_seq FOREIGN KEY (article_seq) REFERENCES programs(article_seq) ON DELETE CASCADE
);

-- 10. 언어 테이블
CREATE TABLE IF NOT EXISTS languages (
    lang_code VARCHAR(10) PRIMARY KEY, -- 'ko', 'vi', 'zh' 등
    lang_name VARCHAR(50) NOT NULL,    -- '한국어', '베트남어' 등
    english_name VARCHAR(50),          -- 'Korean', 'Vietnamese' 등
    is_active BOOLEAN DEFAULT TRUE     -- 서비스 지원 여부
);

INSERT INTO languages (lang_code, lang_name, english_name) VALUES 
('ko', '한국어', 'Korean'),
('vi', '베트남어', 'Vietnamese'),
('zh', '중국어(간체)', 'Chinese (Simplified)');

-- view_lang_code가 languages 테이블에 존재하는 코드만 가질 수 있도록 제한
ALTER TABLE users 
ADD CONSTRAINT fk_view_lang 
FOREIGN KEY (view_lang_code) REFERENCES languages(lang_code);

-- native_lang_code도 동일하게 제한
ALTER TABLE users 
ADD CONSTRAINT fk_native_lang 
FOREIGN KEY (native_lang_code) REFERENCES languages(lang_code);

---
-- 외래키 및 제약 조건 (DO 블록)
---
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_location') THEN
        ALTER TABLE users ADD CONSTRAINT fk_user_location FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_post_user') THEN
        ALTER TABLE posts ADD CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_post_location') THEN
        ALTER TABLE posts ADD CONSTRAINT fk_post_location FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_comment_post') THEN
        ALTER TABLE comments ADD CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_comment_user') THEN
        ALTER TABLE comments ADD CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_comment_parent') THEN
        ALTER TABLE comments ADD CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_room_creator') THEN
        ALTER TABLE chat_rooms ADD CONSTRAINT fk_room_creator FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_room_location') THEN
        ALTER TABLE chat_rooms ADD CONSTRAINT fk_room_location FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_msg_room') THEN
        ALTER TABLE chat_messages ADD CONSTRAINT fk_msg_room FOREIGN KEY (room_id) REFERENCES chat_rooms(room_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_msg_sender') THEN
        ALTER TABLE chat_messages ADD CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL;
    END IF;
END $$;

-- 1. 지역 테이블 계층 조회 최적화
-- 특정 광역(parent_id)에 속한 시군구를 찾을 때 성능을 높여줍니다.
CREATE INDEX IF NOT EXISTS idx_locations_parent_id ON locations(parent_id);

-- 2. 지역 이름 검색 최적화
-- 지역명으로 ID를 찾는 경우가 많으므로 인덱스를 추가합니다.
CREATE INDEX IF NOT EXISTS idx_locations_district_name ON locations(district_name);

-- 3. 기존 테이블 관련 인덱스 (유지 및 확인)
-- 카테고리별 게시글 조회
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

-- 지역별 게시글/채팅방 필터링 (가장 많이 쓰이는 쿼리)
CREATE INDEX IF NOT EXISTS idx_posts_location ON posts(location_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_location ON chat_rooms(location_id);

-- 특정 게시글의 댓글 조회
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- 채팅방 메시지 시간순 정렬 및 조회
CREATE INDEX IF NOT EXISTS idx_messages_room_sent ON chat_messages(room_id, sent_at);

-- 좋아요 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);

---
-- 프로그램(다누리 크롤링 데이터) 관련 인덱스
-- 크롤링 중복 검사 최적화 (데일리 업데이트 시 article_seq 존재 여부 확인)
CREATE INDEX IF NOT EXISTS idx_programs_article_seq ON programs(article_seq);

-- 지역별 프로그램 검색/필터링 최적화
CREATE INDEX IF NOT EXISTS idx_programs_region ON programs(program_region);

-- 접수 기간 마감순 정렬 (사용자에게 마감 임박한 프로그램 먼저 보여줌)
CREATE INDEX IF NOT EXISTS idx_programs_reg_end_date ON programs(reg_end_date DESC);

-- 프로그램 기간별 검색 최적화
CREATE INDEX IF NOT EXISTS idx_programs_prog_dates ON programs(prog_start_date, prog_end_date);

-- 상태별 필터링 (접수중, 마감 등)
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);

-- 복합 인덱스: 지역 + 접수 마감날짜 (가장 일반적인 쿼리 패턴)
CREATE INDEX IF NOT EXISTS idx_programs_region_reg_end ON programs(program_region, reg_end_date DESC);

-- 최신 업데이트 프로그램 조회 최적화
CREATE INDEX IF NOT EXISTS idx_programs_updated_at ON programs(updated_at DESC);

---
-- 프로그램 이미지 관련 인덱스
-- 특정 프로그램의 모든 이미지 조회
CREATE INDEX IF NOT EXISTS idx_program_images_article_seq ON program_images(article_seq);

-- 이미지 순서대로 정렬 조회 최적화
CREATE INDEX IF NOT EXISTS idx_program_images_order ON program_images(article_seq, image_order);