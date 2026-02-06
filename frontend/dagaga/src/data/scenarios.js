import book from "../assets/icons/book.png";
import conversation_bubble from "../assets/icons/conversation_bubble.png";
import hospital_cross from "../assets/icons/hospital_cross.png";

export const scenarios = [
  {
    id: "학업",
    label: "학업",
    title: "학업",
    tag: "학습내용",
    icon: book,
    items: [
      "학교 적응도: 수업 태도, 교우 관계, 점심 시간 활동",
      "가정 생활 습관: 수면, 식습관, 스마트폰 사용 규칙, 자기주도 학습",
      "정서 및 심리: 사춘기 징후, 감정 표현, 고민 상담 여부",
      "진로 및 지도: 아이의 꿈, 사교육 현황, 선생님께 바라는 점",    ],
    // Static problems kept as fallback or initial state if needed
    problems: [
      { id: 1, text: "아이가 특별히 어려워하는 과목이 있나요?" },
      { id: 2, text: "아이가 누구랑 친한가요?" },
      { id: 3, text: "아이가 좋아하는 활동은 무엇인가요?" },
      { id: 4, text: "아이의 학습 태도는 어떠한가요?" },
      { id: 5, text: "아이가 매체를 얼마나 사용하나요?" }
    ]
  },
  {
    id: "자기소개",
    label: "자기소개",
    title: "자기소개",
    tag: "학습내용",
    icon: conversation_bubble,
    items: [
      "기본 신상: 이름, 한국 체류 기간 정확히 말하기",
      "언어 능력: 현재 한국어 실력 솔직하게 표현하기",
      "마인드셋: 꾸준한 학습 의지와 자신감(\"할 수 있다\") 드러내기"
    ],
    problems: [
      { id: 1, text: "이름이 무엇인가요?" },
      { id: 2, text: "몇 살이에요?" },
      { id: 3, text: "어디에 살고 있나요?" },
      { id: 4, text: "가족은 몇 명인가요?" },
      { id: 5, text: "좋아하는 음식은 무엇인가요?" }
    ]
  },
  {
    id: "의료",
    label: "의료",
    title: "의료",
    tag: "학습내용",
    icon: hospital_cross,
    items: [
      "증상 상세 묘사: 발병 시기, 통증 강도(1~10), 증상 변화 추이",
      "병력 및 알레르기: 과거 유사 경험, 가족력, 약물/음식 알레르기",
      "약물 점검: 현재 복용 중인 약, 과거 부작용 경험, 제형(가루/알약) 선호",
      "복용 지도: 식후 복용 여부, 보관 방법, 항생제 주의사항",
    ],
    problems: [
      { id: 1, text: "어디가 아파요?" },
      { id: 2, text: "언제부터 아팠나요?" },
      { id: 3, text: "어떻게 아파요?" },
      { id: 4, text: "열이 있나요?" },
      { id: 5, text: "약을 먹었나요?" }
    ]
  }
];
