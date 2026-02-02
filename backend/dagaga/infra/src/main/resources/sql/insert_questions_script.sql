-- 자기소개
INSERT INTO question_bank
(category, question_text, example_answer, order_index,vite_questions, vite_answers,chz_questions, chz_answers)
VALUES
    ('자기소개', '이름이 무엇인가요?', '저는 00입니다.', 1,
     'Tên bạn là gì?', 'Mình sinh năm 2000 ạ.',
     '叫什么名字？', '我是00。'),

    ('자기소개', '한국에 언제 왔나요?', '저는 한국에 {entryDate.year}년 {entryDate.month}월 {entryDate.day}일에 왔어요.', 2,
     'Bạn đã đến Hàn Quốc khi nào?', 'Tôi đã đến Hàn Quốc vào ngày 00 tháng 0000',
     '什么时候来的韩国？', '我是0000年00月00日来到韩国的'),

    ('자기소개', '한국말을 잘 하시나요?', '저는 한국말을 잘 못해요. 그래서 혼자 장보러 가지 못해요.', 3,
     'Bạn có giỏi tiếng Hàn không?', 'Tôi không giỏi tiếng Hàn. Vậy nên mình không thể đi chợ một mình được.',
     '韩语说得好吗？', '我韩语说得不好。 所以不能一个人去买菜。'),

    ('자기소개', '꾸준히 연습하면 충분히 잘 할 수 있어요. 그렇게 믿으시죠?', '네, 저는 다가가를 꾸준히 이용하면서 한국말 연습을 할 거예요.', 4,
     'Nếu luyện tập đều đặn thì có thể làm tốt được. Anh tin như vậy đúng không?',
     'Vâng, tôi sẽ thường xuyên sử dụng từ ''gần gũi'' để luyện tập tiếng Hàn.',
     '只要坚持练习，完全可以做好。 你是这么相信的吧？', '是的，我会坚持利用靠近来练习韩语。');


-- 학업
INSERT INTO question_bank
(category, question_text, example_answer, order_index,vite_questions, vite_answers,chz_questions, chz_answers)
VALUES
    ('학업', '어머니, 요즘 OO가 집에서 학교 이야기를 자주 들려주나요? 주로 어떤 주제인가요?', '00이는 집에 오면 매일 학교에서 무슨 일이 있었는지 이야기해줘요.', 1,
     'Mẹ ơi, dạo này OO có thường xuyên kể chuyện trường học ở nhà không? Chủ đề chủ yếu là gì?',
     '00 mỗi ngày khi về nhà đều kể cho tôi nghe chuyện gì đã xảy ra ở trường.',
     '妈妈，最近OO经常在家给我讲学校故事吗？ 主要是什么主题？', '00回家后每天都会告诉我学校发生了什么事情。'),

    ('학업', '아이가 학교 가는 것에 대해 아침에 어떤 기분이나 태도를 보이나요?', '항상 늦잠을 자서 아침에 깨우기 힘들어요. 하지만 00이는 전날 학교 준비물을 스스로 잘 챙겨요.', 2,
     'Bạn có tâm trạng hay thái độ như thế nào đối với việc đứa trẻ đi học vào buổi sáng?',
     'Vì tôi luôn ngủ dậy muộn nên rất khó để đánh thức vào buổi sáng. Nhưng mà 00 một mình tự biết sắp xếp đồ dùng cho trường học vào ngày hôm trước',
     '孩子早上对上学有什么心情或态度？', '我总是睡懒觉，早上很难叫醒我。 但是00会自己看着前一天准备好的学校用品'),

    ('학업', '요즘 아이가 집에서 가장 몰입하고 있거나 즐거워하는 취미나 관심사가 무엇인가요?', '우리 아이는 축구를 좋아해요. 학교 끝나고 친구들과 축구하고 흙투성이로 들어와요.', 3,
     'Sở thích hoặc mối quan tâm mà trẻ em thích hoặc thích thú nhất ở nhà là gì?',
     'Con tôi thích bóng đá. Vì vậy, sau khi tan học, tôi chơi bóng đá với bạn bè và trở về nhà đầy bùn đất.',
     '最近孩子在家最投入或者最开心的爱好或者关心的事情是什么？', '我的孩子喜欢足球。 所以放学后和朋友们一起踢足球，然后满身泥土回家。'),

    ('학업', '집에서 스스로 챙겨야 할 일(숙제, 가방 챙기기, 씻기 등)을 어느 정도 스스로 해내고 있나요?', '우리 애기는 스스로 다 해요. 제가 잘 몰라서 어릴 때부터 스스로 했어요.', 4,
     'Bạn đang tự hoàn thành công việc phải tự lo ở nhà (bài tập, dọn túi xách, rửa mặt…) đến mức độ nào?',
     'Con tôi tự làm tất cả. Mình không rành cho lắm nên từ nhỏ đã tự làm rồi',
     '在家自己该做的事情（作业、收拾书包、洗漱等）都做了多少？', '我的孩子自己都做。 因为我不太清楚 所以我从小就自己做了'),

    ('학업', '아이가 자신의 감정(짜증, 슬픔, 화 등)을 부모님께 솔직하게 표현하는 편인가요?', '애기가 원래 좀 조용한데 그래도 큰 일은 다 얘기해요.', 5,
     'Con bạn có thuộc tuýp người thẳng thắn bày tỏ tình cảm của mình với bố mẹ (bực bội, buồn bã, tức giận…) không?',
     'Đứa bé vốn dĩ rất im lặng nhưng dù sao cũng nói hết những chuyện lớn rồi',
     '孩子会如实向父母表达自己的感受（烦躁、悲伤、生气等）吗？', '孩子本来就很安静 但是大事都会说出来'),

    ('학업', '요즘 아이가 사춘기 전조 증상처럼 독립심이 강해지거나 부모님과 의견 충돌이 잦아지지는 않았나요?', '아직 그런 거는 없는 것 같아요. 말하면 잘 듣고 화내거나 짜증은 잘 안 내요.', 6,
     'Ngày nay, trẻ có mạnh mẽ tự lập như các triệu chứng của tuổi dậy thì hay xung đột ý kiến với bố mẹ không?',
     'Mình nghĩ là vẫn chưa có chuyện đó đâu. Nếu nói ra thì nghe cho kỹ, không hay nổi nóng hay bực bội đâu',
     '最近孩子有没有像青春期前兆一样变得独立,或者和父母经常发生意见冲突?', '好像还没有那样的。 说话的时候很听话 不会生气 不会生气'),

    ('학업', '평소 수면 시간이나 식습관 등 기초 생활 습관에서 부모님이 걱정하시는 부분이 있으실까요?', '요즘 핸드폰 한다고 늦게 자서 조금 걱정이에요. 밤늦게까지 뭘 그렇게 보는지 모르겠어요.', 7,
     'Bố mẹ bạn có lo lắng gì về thói quen sinh hoạt cơ bản như thời gian ngủ hay thói quen ăn uống không?',
     'Dạo này mình ngủ trễ vì dùng điện thoại nên mình hơi lo. Các bạn xem gì đến tận khuya, có gì mà thú vị vậy?',
     '平时睡眠时间、饮食习惯等基础生活习惯，家长有没有担心的地方？', '最近玩手机睡得晚，所以有点担心。 这么晚了还在看什么 有什么那么有趣'),

    ('학업', '아이가 집에서 자주 언급하는 친한 친구는 누구인가요? 그 친구와는 어떤 점이 잘 맞는다고 하나요?', '우리 애는 {friend.name}이랑 친해요. 학교에서 {friend.name}이랑 맨날 다닌다고 말했어요.', 8,
     'Ai là người bạn thân mà con thường nhắc đến ở nhà? Bạn nói rằng bạn hợp với người bạn đó ở điểm nào?',
     'Bé nhà mình thân với bé OO đó. Mình đã nói là ngày nào mình cũng đi học với OO ở trường. Cho nên là mình không lo lắng cho bạn bè gì cả',
     '孩子在家经常提到的好朋友是谁？ 和那个朋友哪一点合得来？', '我的孩子和OO很熟。 说每天在学校和OO一起上学。 所以不担心朋友'),

    ('학업', '혹시 친구 관계에서 속상했던 일을 이야기하거나, 고민을 털어놓은 적이 있나요?', '그런 거는 잘 이야기 안 해요. 누구 만난다 뭐 한다 이야기는 하는데 고민은 잘 말하지 않아요.', 9,
     'Không biết chị có bao giờ tâm sự, tâm sự về những chuyện đau lòng trong quan hệ bạn bè không?',
     'Mình không hay nói về chuyện đó. Kiểu như gặp ai đó rồi làm gì đó Nói chuyện thì nói nhưng mà không phải là lo lắng về những gì mình hay làm',
     '有没有在朋友关系上说过伤心的事情，或者倾诉过苦恼？', '我不怎么说那种话。 跟谁见面 做什么呢 虽然会聊天 但不会说我的烦恼'),

    ('학업', '집에서 혼자 공부하는 시간이 어느 정도 되나요? 집중력은 어떤 편인가요?', '매일 1시간 정도 혼자 공부해요. 좋아하는 과목은 집중이 좋지만 수학은 20분 지나면 집중을 못 해요.', 10,
     'Thời gian học một mình ở nhà khoảng bao nhiêu? Sức tập trung của cậu thế nào?',
     'Mỗi ngày tôi học một mình khoảng 1 tiếng. Khi học môn học yêu thích thì khả năng tập trung rất tốt, nhưng môn học ghét như toán học thì sau khoảng 20 phút tôi không thể tập trung được.',
     '一个人在家学习的时间有多长？ 集中力怎么样？', '每天一个人学习1个小时左右。 学习喜欢的科目时集中力很好，但像数学一样讨厌的科目，过了20分钟左右就无法集中。');


-- 의료
INSERT INTO question_bank
(category, question_text, example_answer, order_index,vite_questions, vite_answers,chz_questions, chz_answers)
VALUES
    ('의료', '어디가 가장 불편해서 오셨나요?', '아이가 어제부터 배가 아프다고 해요. 설사도 세 번 했고 기침과 코막힘도 심해요.', 1,
     'Bạn thấy bất tiện ở đâu nhất?',
     'Đứa trẻ từ hôm qua đã bị đau bụng. Tôi đã bị tiêu chảy 3 lần. Hơn nữa, từ mấy ngày trước anh ấy ho nặng và nghẹt mũi nên khó thở.',
     '您是因为哪里不舒服才来的？', '孩子从昨天开始肚子疼。 拉肚子也拉了三次。 再加上几天前开始咳嗽得厉害，鼻子堵得厉害，呼吸困难。'),

    ('의료', '이 증상이 정확히 언제부터 시작되었나요?', '아마 3일쯤 전부터 아프기 시작했던 것 같아요. 한두 시간 전부터는 계속 토하고 있어요.', 2,
     'Chính xác thì triệu chứng này bắt đầu từ khi nào?',
     'Có lẽ tôi đã bắt đầu bị ốm từ khoảng 3 ngày trước. Và từ khoảng 1 ~ 2 tiếng trước mình đã ói liên tục.',
     '这个症状具体是从什么时候开始的？', '大概三天前就开始疼了。 然后从一两个小时前开始一直在吐。'),

    ('의료', '통증의 정도를 1부터 10까지로 치면 어느 정도인가요?', '정확히는 모르겠어요. 그런데 밥도 거의 못 먹고 계속 누워만 있을 정도로 힘들어해요.', 3,
     'Nếu tính mức độ đau từ 1 đến 10 thì mức độ đau là bao nhiêu? (Nếu là trẻ em thì "có đau đến mức không ngủ được không?".',
     'Cái đó thì tôi không biết. Nhưng anh ấy mệt đến mức không ăn cơm được mà chỉ nằm không thôi.',
     '疼痛的程度从1到10是多少？(如果是孩子的话，会痛到睡不着觉吗？', '那个我不太清楚。 但是几乎连饭都没吃就一直躺着，非常累。'),

    ('의료', '증상이 점점 심해지나요, 아니면 호전되는 중인가요?', '처음에는 조금만 아팠는데 이제는 약을 먹어도 좋아지지 않아요.', 4,
     'Triệu chứng ngày càng nghiêm trọng hơn hay đang cải thiện?',
     'Lúc đầu thì chỉ có đau một chút thôi nhưng mà giờ uống thuốc cũng không cải thiện được các triệu chứng giống vậy',
     '症状是越来越严重，还是正在好转？', '刚开始有点疼，现在吃药症状也不见好转了，都差不多了。'),

    ('의료', '열을 재보셨나요? 가장 높았을 때가 몇 도였고, 해열제를 먹었나요?', '집에서 열을 쟀을 때 38도까지 올라갔어요. 아침 먹고 해열제를 먹였는데 잘 안 내려가요.', 5,
     'Anh đã đo nhiệt độ chưa? Lúc cao nhất là bao nhiêu độ, anh đã uống thuốc hạ sốt chưa?',
     'Khi đo nhiệt độ ở nhà, nó đã tăng lên 38 độ. Lúc nãy tôi đã uống thuốc hạ sốt sau khi ăn sáng, nhưng nhiệt không giảm.',
     '量过体温吗？ 最高的时候是几度，你吃退烧药了吗？', '在家里量体温的时候达到了38度。 刚才吃完早饭吃了退烧药，但是退烧了。'),

    ('의료', '기침/콧물 외에 구토나 설사, 발진 같은 다른 증상은 없나요?', '어제부터 설사를 하고 있고 계속 춥다고 해요. 열도 조금 있는 것 같아요.', 6,
     'Ngoài ho / nước mũi, bạn còn có triệu chứng nào khác như nôn mửa, tiêu chảy, phát ban không?',
     'Đứa bé đã bị tiêu chảy từ hôm qua và liên tục nói là lạnh. Hình như tôi bị sốt một chút.',
     '除了咳嗽/流鼻涕以外，没有其他症状，如呕吐、腹泻、皮疹等？', '孩子从昨天开始拉肚子，一直说冷。 好像有点发烧。'),

    ('의료', '아이의 소변 양이 평소보다 줄었거나, 식사량이 급격히 떨어졌나요?', '아이가 배가 아파서 밥을 덜 먹어요.', 7,
     'Lượng nước tiểu của bé giảm so với bình thường hay lượng thức ăn giảm đột ngột?',
     'Bé đau bụng nên ăn ít cơm hơn',
     '孩子尿量是否比平时减少，或者进食量急剧下降？', '孩子肚子疼，所以饭吃得少。'),

    ('의료', '이전에도 비슷한 증상으로 진료를 받은 적이 있나요?', '저번에 아팠을 때도 목이 아팠어요.', 8,
     'Bạn đã từng điều trị với triệu chứng tương tự trước đây chưa?',
     'Lần trước khi bị đau cổ họng cũng rất đau',
     '以前也因类似症状接受过诊疗吗？', '上次疼的时候 嗓子也疼'),

    ('의료', '약물이나 음식에 대한 알레르기 반응을 보인 적이 있나요?', '저는 우유 알레르기가 있어요. 그래서 아이도 우유를 못 마셔요.', 9,
     'Bạn đã bao giờ bị dị ứng với thuốc hay thức ăn chưa?',
     'Tôi bị dị ứng với sữa. Vì thế ngay cả đứa trẻ cũng không uống được sữa.',
     '你对药物或食物有过敏反应吗?', '我对牛奶过敏。 所以孩子也不能喝牛奶。'),

    ('의료', '가족 중에 비슷한 증상을 앓고 있는 사람이 있나요?', '제 어머니도 우유 알레르기가 있어요.', 10,
     'Trong gia đình có ai mắc triệu chứng tương tự không?',
     'Mẹ tôi cũng bị dị ứng với sữa.',
     '家人中有患有类似症状的人吗？', '我妈妈也对牛奶过敏。');