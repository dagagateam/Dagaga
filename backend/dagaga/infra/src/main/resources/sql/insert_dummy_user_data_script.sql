INSERT INTO users (
    email, 
    password,
    nickname,
    view_lang_code, 
    native_lang_code, 
    location_id, 
    arrival_date,
    social_provider
) VALUES 
(
    'test3@dagaga.com', 
    'test-password', 
    'traveler_seoul', 
    'ko', 
    'vi', 
    (SELECT location_id FROM locations WHERE district_name = '강남구' LIMIT 1), 
    '2023-05-10',
    NULL
),
(
    'test4@dagaga.com', 
    'test-password', 
    'test4',
    'ko', 
    'zh', 
    (SELECT location_id FROM locations WHERE district_name = '해운대구' LIMIT 1), 
    '2024-02-15', 
    NULL
),
(
    'jeju_orange@example.com', 
    'hash_pwd_789', 
    '귤도둑', 
    'vi', 
    'vi', 
    (SELECT location_id FROM locations WHERE district_name = '제주시' LIMIT 1), 
    '2022-11-20', 
    NULL
),
(
    'daejeon_nojam@example.com', 
    'hash_pwd_012', 
    '성심당', 
    'vi', 
    'vi', 
    (SELECT location_id FROM locations WHERE district_name = '유성구' LIMIT 1), 
    '2025-01-05', 
    NULL
),
(
    'suwon_king@gmail.com', 
    'hash_pwd_345', 
    '수원왕갈비', 
    'zh', 
    'zh', 
    (SELECT location_id FROM locations WHERE district_name = '수원시' LIMIT 1), 
    '2023-08-12', 
    'LINE'
);