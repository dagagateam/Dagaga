import instance from './axios';

export const fetchCommunityInfo = async (page = 0, size = 20) => {
    // [나중에 백엔드 연결 시]
    // return await instance.get(`/community/info?page=${page}&size=${size}`);

    // Mocking provided by user
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    page: {
                        number: page,
                        size: size,
                        totalElements: 134,
                        totalPages: 7
                    },
                    items: [
                        {
                            postId: 100,
                            organization: "종로구가족센터",
                            title: "2026년 종로구 부부 및 가족상담 안내",
                            content: "- 접수기간 2026-01-12 ~ 2026-04-06\n -프로그램기간 2026-04-07 ~ 2026-04-28\n - 대상: 사회통합프로그램 5단계 기본과정 수료자\n - 인원: 10\n - 문의처: 070-4128-3393",
                            image: "https://www.liveinkorea.kr/upload/editor/cd5a3e0e-7c98-414d-ab2d-83d33ec876d2.jpg"
                        },
                        {
                            postId: 101,
                            organization: "종로구가족센터",
                            title: "결혼이민자 통번역서비스 지원",
                            content: "- 접수기간 2026-01-02 ~ 2026-12-31\n - 프로그램기간 2026-01-02 ~ 2026-12-31\n - 대상: 한국어 소통이 어려운 결혼이민자\n - 내용: 의사소통 문제해결을 위한 통번역서비스 지원",
                            image: "https://www.liveinkorea.kr/upload/editor/0318fbb1-468c-41c3-bf82-c17464ad8b7a.png"
                        },
                        {
                            postId: 102,
                            organization: "종로구가족센터",
                            title: "2026년 1월 센터프로그램안내(한국어, 중국어, 베트남어)",
                            content: "- 접수기간 2026-06-01 ~ 2026-12-31\n - 프로그램기간 2026-06-01 ~ 2026-12-31\n - 대상: 한국어 소통이 어려운 결혼이민자\n - 내용: 의사소통 문제해결을 위한 통번역서비스 지원",
                            image: "https://www.liveinkorea.kr/upload/editor/74e0d0fa-48ca-4ab8-bd51-256d15e8a071.jpg"
                        },
                        {
                            postId: 102,
                            organization: "종로구가족센터",
                            title: "북촌문화센터와 함께하는 ★문화해설사&전통공예가 직업체험★",
                            content: "- 접수기간 2026-06-01 ~ 2026-12-31\n - 프로그램기간 2026-06-01 ~ 2026-12-31\n - 대상: 한국어 소통이 어려운 결혼이민자\n - 내용: 의사소통 문제해결을 위한 통번역서비스 지원",
                            image: "https://www.liveinkorea.kr/upload/editor/4907ea3d-7d21-43dc-9243-18ab5bb5c042.jpg"
                        },
                    ]
                }
            });
        }, 500); // Simulate network delay
    });
};

export const fetchCommunityInfoDetail = async (id) => {
    // [나중에 백엔드 연결 시]
    // return await instance.get(`/community/info/${id}`);

    // Mocking provided by user
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    postId: id,
                    organization: "다가가정보지원",
                    title: "2026년 결혼이민자 통번역서비스사업 안내",
                    content: `종로구 가족센터에서는 입국초기 결혼이민자의 초기 정착 단계에서 경험하는 의사소통 문제해결을 위한 통번역서비스를 지원합니다. 많은 이용해 주시기 바랍니다.

기간: 2026년 1월~12월, 09:00~18:00, 연간 수시(주말, 공휴일 이용제외), 점심시간 12시~13시
내용: 통역, 번역, 정보제공 서비스 제공

대상: 한국어 소통이 어려운 베트남 출신 결혼이민자 개인 및 다문화가족 및 통번역서비스가 필요한 유관기관 등

장소: 종로구 가족센터(종로53길 29) 및 외부 장소, 온라인

이용: 센터 내방 및 전화, 팩스 등을 통해 서비스 이용 신청 후 서비스 이용 가능(무료)

유의사항: 법적책임 및 공증 요청시 지원 불가, 외부 통역 요청시 최소 2일전 예약 필수, 타 구 거주의 경우 해당 구의 동행 통역 서비스 이용 권장`,
                    image: "https://www.liveinkorea.kr/upload/editor/74e0d0fa-48ca-4ab8-bd51-256d15e8a071.jpg",
                    startDate: "2026-01-02",
                    endDate: "2026-12-31",
                    isLiked: false,
                    isBookmarked: false,
                    comments: [
                        { id: 1, user: "배우는엄마", text: "어디로 문의드리면 될까요?", avatar: "https://i.pravatar.cc/150?u=1" },
                        { id: 2, user: "한나", text: "참여하고싶어요", avatar: "https://i.pravatar.cc/150?u=2" },
                        { id: 3, user: "두쫀쿠", text: "관심있습니다", avatar: "https://i.pravatar.cc/150?u=3" }
                    ]
                }
            });
        }, 300);
    });
};
