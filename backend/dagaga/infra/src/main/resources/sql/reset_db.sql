-- 데이터베이스 초기화 스크립트
-- 주의: 이 스크립트는 모든 데이터를 삭제합니다!

-- 1. 번역 관련 테이블 먼저 삭제 (외래키 제약 때문)
TRUNCATE TABLE program_post_translations CASCADE;
TRUNCATE TABLE comment_translations CASCADE;
-- TRUNCATE TABLE message_translations CASCADE;

-- 2. 연관 테이블 삭제
TRUNCATE TABLE post_likes CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE program_images CASCADE;

-- 3. 메인 테이블 삭제
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE programs CASCADE;

-- 4. 채팅 관련
-- TRUNCATE TABLE chat_messages CASCADE;
-- TRUNCATE TABLE chat_room_users CASCADE;
-- TRUNCATE TABLE chat_rooms CASCADE;

-- 5. 사용자 테이블 (주의: 관리자 계정도 삭제됨)
-- 필요한 경우 아래 줄의 주석을 해제하세요
-- TRUNCATE TABLE users CASCADE;

-- 6. ID 시퀀스 초기화 (선택사항)
-- 게시글 ID를 1부터 다시 시작하려면 주석 해제
-- ALTER SEQUENCE posts_post_id_seq RESTART WITH 1;
-- ALTER SEQUENCE programs_program_id_seq RESTART WITH 1;
-- ALTER SEQUENCE program_post_translations_translation_id_seq RESTART WITH 1;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '데이터베이스 초기화 완료!';
END $$;
