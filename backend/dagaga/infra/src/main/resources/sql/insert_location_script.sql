-- 1. 기존 데이터 초기화 (선택 사항)
-- TRUNCATE TABLE locations RESTART IDENTITY CASCADE;

-- 2. 광역 자치단체 (depth 1) 삽입
INSERT INTO locations (district_name, depth) VALUES 
('서울', 1), ('부산', 1), ('대구', 1), ('인천', 1), ('광주', 1), 
('대전', 1), ('울산', 1), ('경기', 1), ('강원', 1), ('충북', 1), 
('충남', 1), ('전북', 1), ('전남', 1), ('경북', 1), ('경남', 1), 
('제주', 1), ('세종', 1);

-- 3. 기초 자치단체 (depth 2) 삽입
-- 부모 ID를 동적으로 조회하여 삽입합니다.

-- 서울 (1)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구']), 2 FROM locations WHERE district_name = '서울';

-- 부산 (2)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구']), 2 FROM locations WHERE district_name = '부산';

-- 대구 (3)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['군위군', '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구']), 2 FROM locations WHERE district_name = '대구';

-- 인천 (4)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구']), 2 FROM locations WHERE district_name = '인천';

-- 광주 (5)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['광산구', '남구', '동구', '북구', '서구']), 2 FROM locations WHERE district_name = '광주';

-- 대전 (6)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['대덕구', '동구', '서구', '유성구', '중구']), 2 FROM locations WHERE district_name = '대전';

-- 울산 (7)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['남구', '동구', '북구', '울주군', '중구']), 2 FROM locations WHERE district_name = '울산';

-- 경기 (8)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시']), 2 FROM locations WHERE district_name = '경기';

-- 강원 (9)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군']), 2 FROM locations WHERE district_name = '강원';

-- 충북 (10)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시']), 2 FROM locations WHERE district_name = '충북';

-- 충남 (11)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군']), 2 FROM locations WHERE district_name = '충남';

-- 전북 (12)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군']), 2 FROM locations WHERE district_name = '전북';

-- 전남 (13)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군']), 2 FROM locations WHERE district_name = '전남';

-- 경북 (14)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['경산시', '경주시', '고령군', '구미시', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시']), 2 FROM locations WHERE district_name = '경북';

-- 경남 (15)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군']), 2 FROM locations WHERE district_name = '경남';

-- 제주 (16)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, unnest(ARRAY['서귀포시', '제주시']), 2 FROM locations WHERE district_name = '제주';

-- 세종 (17)
INSERT INTO locations (parent_id, district_name, depth) SELECT location_id, '세종특별자치시', 2 FROM locations WHERE district_name = '세종';