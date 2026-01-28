# Frontend

## 다문화 가정 학부모를 위한 한국어 발화 자신감 향상 플랫폼
"완벽하지 않아도 괜찮아요, 입 밖으로 소리 내어 말하는 연습부터 시작하세요!"
> 본 프로젝트는 한국어 소통에 두려움을 느끼는 다문화 가정 학부모들이 일상 속 핵심 상황에서 자신 있게 말할 수 있도록 돕는 생성형 AI 기반 쉐도잉 및 커뮤니티 플랫폼입니다.

### TODO
> Frontend 기능에 대해 자세히 설명하세요.

### 프론트엔드 구조
```
src/
├── api/                # API 호출을 위한 axios 인스턴스 설정
├── router/             # 페이지 경로 및 라우팅 설정
├── layout/             # 모든 페이지에 공통으로 적용되는 껍데기
│   ├── Navbar/         
│   │   ├── Navbar.jsx
│   │   └── Navbar.css
│   └── Footer/         
│       ├── Footer.jsx
│       └── Footer.css
├── hooks/              # 커스텀 훅 (재사용 가능한 로직 모음)
├── components/         # 각 페이지에서 사용하는 UI 컴포넌트들
│   ├── common/         # 공통 컴포넌트
│   │   ├── InputBar.jsx
│   │   └── InputBar.css
│   └── scenario/
│       ├── Signup.jsx
│       └── Signup.css
├── assets/
│   ├── characters/     # 캐릭터 이미지
│   ├── icons/          # 아이콘 이미지 
│   └── images/         # 기타 이미지
├── styles/             # 전역 스타일 설정
│   └── index.css
├── App.jsx             # 최상위 컴포넌트 (Router 연결)
└── main.jsx            # 프로젝트 진입점
```
