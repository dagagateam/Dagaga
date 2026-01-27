
-- 사용자가 게시판을 조회할 때, 
-- 현재 로그인한 사용자(예: my_user_id = 1)의 시점에서 isLiked와 
-- 전체 likeCount를 가져오는 쿼리 예시
SELECT 
    p.post_id AS "postId",
    p.title,
    -- 전체 좋아요 수 계산 (Left Join 후 Count)
    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id) AS "likeCount",
    -- 현재 사용자가 좋아요를 눌렀는지 여부 (EXISTS 활용)
    EXISTS (
        SELECT 1 FROM post_likes 
        WHERE post_id = p.post_id AND user_id = 1  -- 여기에 현재 로그인한 user_id 대입
    ) AS "isLiked"
FROM posts p
WHERE p.location_id = 123 -- 예시 지역 필터링
ORDER BY p.created_at DESC;


-- 내가 좋아요 누른 글 모아보기
SELECT p.* FROM posts p
JOIN post_likes l ON p.post_id = l.post_id
WHERE l.user_id = 1  -- 내 ID
ORDER BY l.created_at DESC;


-- 좋아요 기능과 프로필 이미지를 포함하여 게시글 목록을 불러올 때의 쿼리
SELECT 
    p.post_id AS "postId",
    u.nickname AS "author",
    COALESCE(u.profile_image, 'default_avatar.png') AS "profileImage", -- null 방어 코드
    p.title,
    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id) AS "likeCount",
    EXISTS (
        SELECT 1 FROM post_likes 
        WHERE post_id = p.post_id AND user_id = 1 -- 현재 로그인 유저 ID
    ) AS "isLiked"
FROM posts p
JOIN users u ON p.user_id = u.user_id
ORDER BY p.created_at DESC;