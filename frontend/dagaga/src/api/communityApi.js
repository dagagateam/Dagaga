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
