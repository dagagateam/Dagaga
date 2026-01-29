-- 전제: 강남구 채팅방이 있고, 중국어(zh) 유저와 베트남어(vi) 유저가 참여 중임
INSERT INTO chat_messages (room_id, sender_id, original_text, original_lang)
VALUES 
-- 메시지 1: 베트남어 유저의 질문
(
    (SELECT room_id FROM chat_rooms WHERE title LIKE '%강남%' LIMIT 1),
    (SELECT user_id FROM users WHERE native_lang_code = 'vi' LIMIT 1),
    'Cho mình hỏi quán phở nào ở Gangnam ngon nhất ạ?',
    'vi'
),
-- 메시지 2: 중국어 유저의 답변
(
    (SELECT room_id FROM chat_rooms WHERE title LIKE '%강남%' LIMIT 1),
    (SELECT user_id FROM users WHERE native_lang_code = 'zh' LIMIT 1),
    '在江南站 10 号出口附近有一家叫 "Phở 100" 의店，非常正宗。',
    'zh'
),
-- 메시지 3: 베트남어 유저의 감사 인사
(
    (SELECT room_id FROM chat_rooms WHERE title LIKE '%강남%' LIMIT 1),
    (SELECT user_id FROM users WHERE native_lang_code = 'vi' LIMIT 1),
    'Cảm ơn bạn nhé! Mình sẽ thử đến đó vào tối nay.',
    'vi'
);

-- 메시지 1 번역: (VI -> ZH) "강남에서 가장 맛있는 쌀국수집이 어디인가요?"
INSERT INTO message_translations (message_id, target_lang, translated_text)
VALUES 
(
    (SELECT message_id FROM chat_messages WHERE original_text LIKE 'Cho mình hỏi%' LIMIT 1),
    'zh',
    '我想问一下，江南哪家越南河粉最好吃？'
);

-- 메시지 2 번역: (ZH -> VI) "강남역 10번 출구 근처 'Phở 100'이라는 곳이 아주 정통입니다."
INSERT INTO message_translations (message_id, target_lang, translated_text)
VALUES 
(
    (SELECT message_id FROM chat_messages WHERE original_text LIKE '%正宗%' LIMIT 1),
    'vi',
    'Gần lối ra số 10 ga Gangnam có một quán tên là "Phở 100", hương vị rất chuẩn.'
);

-- 메시지 3 번역: (VI -> ZH) "고마워요! 오늘 저녁에 가볼게요."
INSERT INTO message_translations (message_id, target_lang, translated_text)
VALUES 
(
    (SELECT message_id FROM chat_messages WHERE original_text LIKE 'Cảm ơn bạn%' LIMIT 1),
    'zh',
    '谢谢你！我打算今天晚上去那里。'
);

