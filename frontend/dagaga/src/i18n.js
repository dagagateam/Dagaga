import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Basic translations (can be moved to JSON files later)
const resources = {
  ko: {
    translation: {
      // 로그인 페이지
      "login": "로그인",
      "logout": "로그아웃",
      "signup": "회원가입",
      "language": "한국어",
      "email": "이메일",
      "password": "비밀번호",
      "welcome_title": "한국 생활이\n많이 어려우신가요?",
      "welcome_subtitle": "다가가와 함께라면 더 쉽게!",
      "email_placeholder": "이메일을 입력하세요",
      "password_placeholder": "비밀번호를 입력하세요",
      "forgot_password": "아이디, 비밀번호를 잊으셨나요?",
      "no_account": "아직 계정이 없으신가요?",
      "google_login": "Google로 계속하기",
      "line_login": "Line으로 계속하기",
      "or_divider": "또는",
      "signup_action": "가입하기",
      "check_duplicate": "중복 확인",
      "display_language": "화면 표시 언어",
      "nickname": "닉네임",
      "native_language": "모국어",
      "password_confirm": "비밀번호 확인",
      "region": "지역",
      "have_account": "계정이 있으신가요?",
      "nickname_placeholder": "닉네임을 입력하세요",
      "nav_learning": "학습",
      "nav_community": "커뮤니티",
      "nav_chat": "채팅",
      "nav_info": "정보",

      // 마이페이지
      "nav_mypage": "마이페이지",
      "hello_user": "{{name}}님, 안녕하세요",
      "saved_info_title": "저장한 정보글",
      "no_saved_info": "저장한 정보가 없습니다.",
      "my_chat_rooms": "내 채팅방",
      "no_joined_chats": "참여 중인 채팅방이 없습니다.",
      "my_info_title": "내 정보",
      "user_suffix": "님",

      // 학습페이지
      "학업": "학업",
      "자기소개": "자기소개",
      "의료": "의료",
      "guest": "게스트",
      "problem": "문제",
      "example": "예시",
      "loading": "로딩 중...",
      "category_not_found": "존재하지 않는 카테고리입니다.",

      // 프로필 수정
      "native_view": "모국어",
      "password_requirements": "영문, 숫자, 특수문자 포함 8자 이상",
      "password_confirm_placeholder": "비밀번호를 다시 입력하세요",
      "preferred_language": "선호하는 언어",
      "entry_date": "한국에 온 날짜",
      "entry_date_short": "한국에 온 날",
      "edit_profile": "프로필 수정하기",
      "change_profile": "프로필 바꾸기",
      "edit_profile_title": "프로필 수정",
      "cancel": "취소",
      "save": "저장",
      "password_error_requirements": "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.",
      "password_error_match": "비밀번호가 일치하지 않습니다.",
      "notice": "알림",
      "info_changed_relogin": "회원정보가 변경되었습니다. 변경 사항을 적용하려면 다시 로그인해야 합니다.",
      "confirm": "확인",
      "lang_ko": "한국어",
      "lang_zh": "중국어",
      "lang_vi": "베트남어",

      // 채팅
      "participating_chat_rooms": "참여중인 채팅방",
      "user_chat_rooms": "사용자 채팅방",
      "enter_search": "검색어를 입력하세요",
      "participate": "참여하기",
      "person_participating": "명 참여중",
      "create_chat_room": "채팅방 생성하기+",
      "enter": "입장",
      "search_not_found": "검색 결과가 없습니다",
      "new_chat_room": "새 채팅방 만들기",
      "chating_room_title": "채팅방 제목",
      "input_chat_title": "채팅방 제목을 입력하세요",
      "create": "생성하기",
      "creating": "생성 중",


      // 채팅방
      "chat_room_leave": "나가기",
      "send_msg": "메세지 보내기",
      "search_chat_name": "채팅방 이름을 검색하세요",
      "chat_room": "채팅방",
      "room_manager": "모임방 방장",

      // 메인페이지
      "with_dgg": "와 함께",
      "communication_rotation": "소통",
      "info_rotation": "정보 확인",
      "learning_swapcard": "재미있는 시나리오를 통해 한국어를 배워보세요",
      "community_swapcard": "다른 학습자들과 자유롭게 대화하세요",
      "info_swapcard": "한국 생활에 필요한 다양한 정보를 얻으세요",
      "learning_navcard": "학습하기",
      "learning_comment_navcard": "다양한 시나리오로 한국어를 연습하세요",
      "community_navcard": "커뮤니티",
      "community_comment_navcard": "다른 학습 자들과 이야기를 나누세요",
      "info_navcard": "정보공유",
      "info_comment_navcard": "유용한 한국 생활 정보를 확인하세요",

      // 정보
      "enter_search_info": "검색어를 입력하세요(제목, 기관, 내용)",
      "period_acceptance": "접수 기간",
      "period_progress": "진행 기간",
      "question_comment": "궁금한 점이 있으시면 댓글 남겨주세요",
      "deadline": "마감",
      "replying": "답글 달기",
      "reply_input": "답글을 입력하세요",

      // 학습 내용
      "scenario_tag": "학습내용",
      "scenario_items": {
        "학업": [
          "심성 도입 (분류기 조정 및 전반적인 평가)",
          "정서 및 생활 습관 (특질성 확인)",
          "교우 관계 (부모님이 파악하는 사회성)",
          "학습 태도 및 환경",
          "매체 사용 및 향후 지도 방향"
        ],
        "자기소개": [
          "이름과 나이",
          "좋아하는 것",
          "취미",
          "특기"
        ],
        "의료": [
          "증상 설명하기 (아픈 곳 말하기)",
          "의사와 대화하기 (진료 받기)",
          "약 처방받기 (약국 이용)",
          "건강 관리하기 (생활 수칙)"
        ]
      },
      "scenario_problems": {
        "학업": [
          "아이가 특별히 어려워하는 과목이 있나요?",
          "아이가 누구랑 친한가요?",
          "아이가 좋아하는 활동은 무엇인가요?",
          "아이의 학습 태도는 어떠한가요?",
          "아이가 매체를 얼마나 사용하나요?"
        ],
        "자기소개": [
          "이름이 무엇인가요?",
          "몇 살이에요?",
          "어디에 살고 있나요?",
          "가족은 몇 명인가요?",
          "좋아하는 음식은 무엇인가요?"
        ],
        "의료": [
          "어디가 아파요?",
          "언제부터 아팠나요?",
          "어떻게 아파요?",
          "열이 있나요?",
          "약을 먹었나요?"
        ]
      }
    }
  },
  zh: {
    translation: {
      "login": "登录",
      "logout": "注销",
      "signup": "注册",
      "language": "中文",
      "email": "电子邮件",
      "password": "密码",
      "welcome_title": "在韩国生活\n很难吗？",
      "welcome_subtitle": "有了 Dagaga，一切变得更容易！",
      "email_placeholder": "请输入电子邮件",
      "password_placeholder": "请输入密码",
      "forgot_password": "忘记了ID或密码吗？",
      "no_account": "还没有账号吗？",
      "google_login": "使用 Google 继续",
      "line_login": "使用 Line 继续",
      "or_divider": "或者",
      "signup_action": "注册",
      "check_duplicate": "重复检查",
      "display_language": "显示语言",
      "nickname": "昵称",
      "native_language": "母语",
      "password_confirm": "确认密码",
      "region": "地区",
      "have_account": "已经有账号了吗？",
      "nickname_placeholder": "请输入昵称",
      "nav_learning": "学习",
      "nav_community": "社区",
      "nav_chat": "聊天",
      "nav_info": "信息",
      "nav_mypage": "我的主页",
      "hello_user": "你好, {{name}}",
      "saved_info_title": "保存的信息",
      "no_saved_info": "没有保存的信息。",
      "my_chat_rooms": "我的聊天室",
      "no_joined_chats": "没有加入的聊天室。",
      "my_info_title": "我的信息",
      "user_suffix": "",
      "학업": "学习",
      "자기소개": "自我介绍",
      "의료": "医疗",
      "guest": "访客",
      "problem": "问题",
      "example": "示例",
      "loading": "加载中...",
      "category_not_found": "不存在的类别。",
      "native_view": "母语",
      "password_requirements": "包含英文、数字、特殊字符，8位以上",
      "password_confirm_placeholder": "请再次输入密码",
      "preferred_language": "偏好语言",
      "entry_date": "来韩日期",
      "entry_date_short": "来韩日期",
      "edit_profile": "修改个人资料",
      "change_profile": "更换头像",
      "edit_profile_title": "修改个人资料",
      "cancel": "取消",
      "save": "保存",
      "password_error_requirements": "密码必须包含英文、数字、特殊字符，且不少于8位。",
      "password_error_match": "密码不一致。",
      "notice": "通知",
      "info_changed_relogin": "用户信息已更改。为了应用更改，您需要重新登录。",
      "confirm": "确认",
      "lang_ko": "韩语",
      "lang_zh": "中文",
      "lang_vi": "越南语",
      "participating_chat_rooms": "参与聊天室",
      "user_chat_rooms": "用户群",
      "enter_search": "请输入搜索词。",
      "participate": "参与",
      "person_participating": "人参与中",
      "create_chat_room": "创建聊天室+",
      "enter": "入場",
      "search_not_found": "搜索结果不存在",
      "new_chat_room": "创建新聊天室",
      "chating_room_title": "聊天群标题",
      "input_chat_title": "请输入聊天室标题",
      "create": "创建",
      "creating": "创建中",
      "chat_room_leave": "退出",
      "send_msg": "发送信件",
      "search_chat_name": "请搜索一下聊天室的名字",
      "chat_room": "聊天室",
      "room_manager": "聊天室负责人",
      "enter_search_info": "请输入搜索词（题目、机关、内容）",
      "period_acceptance": "接收期间",
      "period_progress": "进行期间",
      "question_comment": "如果有好奇的地方 请留下评论",
      "deadline": "结束",
      "replying": "回复",
      "reply_input": "请输入答复。",
      "with_dgg": "与 00 一起",
      "communication_rotation": "疏通",
      "info_rotation": "信息确认",
      "learning_swapcard": "通过有趣的剧本学习韩语吧",
      "community_swapcard": "请与其他学习者自由对话。",
      "info_swapcard": "请获取韩国生活所需的各种信息",
      "learning_navcard": "学习",
      "learning_comment_navcard": "请用多种剧本练习韩语",
      "community_comment_navcard": "请和其他学习者交谈。",
      "info_navcard": "信息共享",
      "info_comment_navcard": "请确认有用的韩国生活信息",
      "scenario_tag": "学习内容",
      "scenario_items": {
        "학업": [
          "心理导入 (分类调整及整体评估)",
          "情绪及生活习惯 (特质确认)",
          "朋友关系 (父母了解的社会性)",
          "学习态度及环境",
          "媒体使用及指导方向"
        ],
        "자기소개": [
          "姓名和年龄",
          "喜欢的事物",
          "兴趣",
          "特长"
        ],
        "의료": [
          "说明症状 (描述疼痛部位)",
          "与医生沟通 (接受诊疗)",
          "领取处方药 (使用药店)",
          "健康管理 (生活守则)"
        ]
      },
      "scenario_problems": {
        "학업": [
          "孩子有特别觉得困难的科目吗？",
          "孩子和谁比较亲近？",
          "孩子喜欢的活动是什么？",
          "孩子的学习态度怎么样？",
          "孩子使用媒体的时间多长？"
        ],
        "자기소개": [
          "你叫什么名字？",
          "你几岁了？",
          "你住在哪里？",
          "你家里有几口人？",
          "你喜欢的食物是什么？"
        ],
        "의료": [
          "哪里不舒服？",
          "从什么时候开始疼的？",
          "是怎么样的疼痛？",
          "发烧了吗？",
          "吃药了吗？"
        ]
      }
    }
  },
  vi: {
    translation: {
      "login": "Đăng nhập",
      "logout": "Đăng xuất",
      "signup": "Đăng ký",
      "language": "Tiếng Việt",
      "email": "Email",
      "password": "Mật khẩu",
      "welcome_title": "Cuộc sống ở Hàn Quốc\ncó khó khăn không?",
      "welcome_subtitle": "Dễ dàng hơn cùng Dagaga!",
      "email_placeholder": "Nhập email",
      "password_placeholder": "Nhập mật khẩu",
      "forgot_password": "Quên ID hoặc mật khẩu?",
      "no_account": "Bạn chưa có tài khoản?",
      "google_login": "Tiếp tục với Google",
      "line_login": "Tiếp tục với Line",
      "or_divider": "Hoặc",
      "signup_action": "Đăng ký",
      "check_duplicate": "Kiểm tra",
      "display_language": "Ngôn ngữ hiển thị",
      "nickname": "Biệt danh",
      "native_language": "Tiếng mẹ đẻ",
      "password_confirm": "Xác nhận mật khẩu",
      "region": "Khu vực",
      "have_account": "Bạn đã có tài khoản?",
      "nickname_placeholder": "Nhập biệt danh",
      "nav_learning": "Học tập",
      "nav_community": "Cộng đồng",
      "nav_chat": "Trò chuyện",
      "nav_info": "Thông tin",
      "nav_mypage": "Trang cá nhân",
      "hello_user": "Xin chào, {{name}}",
      "saved_info_title": "Thông tin đã lưu",
      "no_saved_info": "Không có thông tin đã lưu.",
      "my_chat_rooms": "Phòng chat của tôi",
      "no_joined_chats": "Chưa tham gia phòng chat nào.",
      "my_info_title": "Thông tin của tôi",
      "user_suffix": "",
      "학업": "Học tập",
      "자기소개": "Giới thiệu bản thân",
      "의료": "Y tế",
      "guest": "Khách",
      "problem": "Câu hỏi",
      "example": "Ví dụ",
      "loading": "Đang tải...",
      "category_not_found": "Danh mục không tồn tại.",
      "native_view": "Tiếng mẹ đẻ",
      "password_requirements": "Bao gồm chữ cái, số, ký tự đặc biệt, ít nhất 8 ký tự",
      "password_confirm_placeholder": "Nhập lại mật khẩu",
      "preferred_language": "Ngôn ngữ ưa thích",
      "entry_date": "Ngày đến Hàn Quốc",
      "entry_date_short": "Ngày đến HQ",
      "edit_profile": "Chỉnh sửa hồ sơ",
      "change_profile": "Đổi ảnh đại diện",
      "edit_profile_title": "Chỉnh sửa hồ sơ",
      "cancel": "Hủy",
      "save": "Lưu",
      "password_error_requirements": "Mật khẩu phải bao gồm chữ cái, số, ký tự đặc biệt và ít nhất 8 ký tự.",
      "password_error_match": "Mật khẩu không khớp.",
      "notice": "Thông báo",
      "info_changed_relogin": "Thông tin thành viên đã thay đổi. Bạn cần đăng nhập lại để áp dụng thay đổi.",
      "confirm": "Xác nhận",
      "lang_ko": "Tiếng Hàn",
      "lang_zh": "Tiếng Trung",
      "lang_vi": "Tiếng Việt",
      "participating_chat_rooms": "Phòng chat có người tham gia",
      "user_chat_rooms": "Phòng chat dành cho người dùng",
      "enter_search": "Hãy nhập từ khóa tìm kiếm",
      "participate": "Tham gia",
      "person_participating": "người tham gia",
      "create_chat_room": "Tạo phòng chat+",
      "enter": "sự vào cửa",
      "search_not_found": "Không có kết quả tìm kiếm",
      "new_chat_room": "Tạo phòng chat mới",
      "chating_room_title": "Tựa đề của phòng chat",
      "input_chat_title": "Hãy nhập tựa đề phòng chat",
      "create": "Tạo ra",
      "creating": "Đang tạo ra",
      "chat_room_leave": "ra ngoài",
      "send_msg": "Gửi tin nhắn",
      "search_chat_name": "Các bạn search tên phòng chat thử đi",
      "chat_room": "Phòng chat",
      "room_manager": "Người phụ trách phòng chat",
      "enter_search_info": "Hãy nhập từ khóa tìm kiếm (tựa đề, cơ quan, nội dung)",
      "period_acceptance": "thời gian tiếp nhận",
      "period_progress": "thời gian tiến hành",
      "question_comment": "Nếu các bạn có thắc mắc gì thì hãy để lại bình luận nhé",
      "deadline": "sự chấm dứt",
      "replying": "sự trả lời",
      "reply_input": "Hãy nhập câu trả lời của bạn",
      "with_dgg": "Cùng với",
      "communication_rotation": "sự thông suốt",
      "info_rotation": "Kiểm tra thông tin",
      "learning_swapcard": "Hãy học tiếng Hàn thông qua một kịch bản thú vị.",
      "community_swapcard": "Hãy nói chuyện tự do với những học viên khác.",
      "info_swapcard": "Hãy nhận được nhiều thông tin đa dạng cần thiết cho cuộc sống ở Hàn Quốc.",
      "learning_navcard": "Học tập",
      "learning_comment_navcard": "Hãy luyện tập tiếng Hàn với nhiều kịch bản đa dạng.",
      "community_comment_navcard": "Hãy nói chuyện với các học viên khác.",
      "info_navcard": "chia sẻ thông tin",
      "info_comment_navcard": "Hãy kiểm tra thông tin sinh hoạt hữu ích của Hàn Quốc.",
      "scenario_tag": "Nội dung học tập",
      "scenario_items": {
        "학업": [
          "Giới thiệu tâm lý",
          "Cảm xúc & Thói quen",
          "Quan hệ bạn bè",
          "Thái độ học tập",
          "Sử dụng thiết bị & Hướng dẫn"
        ],
        "자기소개": [
          "Tên và tuổi",
          "Những điều yêu thích",
          "Sở thích",
          "Năng khiếu"
        ],
        "의료": [
          "Mô tả triệu chứng",
          "Trò chuyện với bác sĩ",
          "Nhận đơn thuốc",
          "Quản lý sức khỏe"
        ]
      },
      "scenario_problems": {
        "학업": [
          "Bé gặp khó khăn môn nào?",
          "Bé thân với ai nhất?",
          "Bé thích hoạt động gì?",
          "Thái độ học tập của bé?",
          "Bé dùng thiết bị bao lâu?"
        ],
        "자기소개": [
          "Tên bạn là gì?",
          "Bạn bao nhiêu tuổi?",
          "Bạn sống ở đâu?",
          "Gia đình có mấy người?",
          "Món ăn yêu thích là gì?"
        ],
        "의료": [
          "Bạn đau ở đâu?",
          "Đau từ khi nào?",
          "Đau như thế nào?",
          "Có bị sốt không?",
          "Đã uống thuốc chưa?"
        ]
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
