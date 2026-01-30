import book from "../assets/icons/book.png";
import conversation_bubble from "../assets/icons/conversation_bubble.png";
import hospital_cross from "../assets/icons/hospital_cross.png";

export const scenarios = [
  {
    id: "학업",
    label: "학업",
    title: "학교에서",
    tag: "학습내용",
    icon: book,
    items: [
      "심성 도입 (분류기 조정 및 집반직인 평가)",
      "정서 및 생활 습관 (특질성 확인)",
      "긍우 관계 (부모님이 파악하는 사회성)",
      "학습 태도 및 환경",
      "매체 사용 및 향후 지도 방향"
    ],
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
    tag: "자기소개",
    icon: conversation_bubble,
    items: [
      "이름과 나이",
      "좋아하는 것",
      "취미",
      "특기"
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
    title: "병원에서",
    tag: "병원내용",
    icon: hospital_cross,
    items: [
      "증상 설명하기",
      "의사와 대화하기",
      "약 처방받기",
      "건강 관리하기"
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
