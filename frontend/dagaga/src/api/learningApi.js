import instance from "./axios";

/**
 * Fetch stages (questions) for a specific category.
 * @param {string} categoryId - The category ID (e.g., "자기소개", "학업", "의료")
 * @returns {Promise<Object>} - The API response containing the list of stages/questions.
 */
export const fetchCategoryStages = async (categoryId) => {
  try {
    // [Backend Connection]
    const response = await instance.get(
      `/learning/categories/${categoryId}/stages`,
    );
    return response;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.warn(`[API Info] Unauthorized (401). Switching to mock data for stages.`);
    } else {
      console.error(
        `[API Error] Failed to fetch stages from server for category ${categoryId}. Falling back to mock data.`,
        error,
      );
    }

    // Mocking behavior on error
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = {
          자기소개: [
            {
              questionId: 101,
              category: "자기소개",
              questionText: "이름이 무엇인가요?",
              exampleAnswer: "저는 00입니다.",
              orderIndex: 1,
              words: ["이름이", "무엇인가요"],
              pronunciationGuide: ["이 르 미", "무 어 신 가 요"],
              wordTranslations: ["Name", "What is it"],
            },
            {
              questionId: 102,
              category: "자기소개",
              questionText: "한국에 언제 왔나요?",
              exampleAnswer:
                "저는 한국에 {entryDate.year}년 {entryDate.month}월 {entryDate.day}일에 왔어요.",
              orderIndex: 2,
              words: ["한국에", "언제", "왔나요"],
              pronunciationGuide: ["한 구 게", "언 제", "완 나 요"],
              wordTranslations: ["To Korea", "When", "Came"],
            },
            {
              questionId: 103,
              category: "자기소개",
              questionText: "한국말을 잘 하시나요?",
              exampleAnswer:
                "저는 한국말을 잘 못해요. 그래서 혼자 장보러 가지 못해요.",
              orderIndex: 3,
              words: ["한국말을", "잘", "하시나요"],
              pronunciationGuide: ["한 궁 마 를", "잘", "하 시 나 요"],
              wordTranslations: ["Korean", "Well", "Do you speak"],
            },
            {
              questionId: 104,
              category: "자기소개",
              questionText:
                "꾸준히 연습하면 충분히 잘 할 수 있어요. 그렇게 믿으시죠?",
              exampleAnswer:
                "네, 저는 다가가를 꾸준히 이용하면서 한국말 연습을 할 거예요.",
              orderIndex: 4,
              words: ["꾸준히", "연습하면"],
              pronunciationGuide: ["꾸 주 니", "연 스 파 면"],
              wordTranslations: ["Consistently", "If you practice"],
            },
            {
              questionId: 105,
              category: "자기소개",
              questionText: "한국 생활은 어떤 점이 가장 어려웠나요?",
              exampleAnswer: "가장 어려운 점은 한국어로 의사소통하는 거예요.",
              orderIndex: 5,
              words: ["한국", "생활은"],
              pronunciationGuide: ["한 국", "생 화 른"],
              wordTranslations: ["Korea", "Life"],
            },
            {
              questionId: 106,
              category: "자기소개",
              questionText: "한국에서 자주 가는 곳이 있나요?",
              exampleAnswer: "저는 집 근처 마트와 공원에 자주 가요.",
              orderIndex: 6,
            },
            {
              questionId: 107,
              category: "자기소개",
              questionText: "한국에서 주로 어떤 일을 하시나요?",
              exampleAnswer: "저는 아이를 돌보고 집안일을 하면서 지내요.",
              orderIndex: 7,
            },
            {
              questionId: 108,
              category: "자기소개",
              questionText: "취미나 좋아하는 활동이 있나요?",
              exampleAnswer: "저는 음악 듣는 것을 좋아해요.",
              orderIndex: 8,
            },
            {
              questionId: 109,
              category: "자기소개",
              questionText: "한국에서 가장 좋아하는 음식은 무엇인가요?",
              exampleAnswer: "저는 김치찌개를 좋아해요.",
              orderIndex: 9,
            },
            {
              questionId: 110,
              category: "자기소개",
              questionText: "앞으로 한국어 공부 목표가 있나요?",
              exampleAnswer:
                "아이 학교 생활에서 필요한 말을 자연스럽게 하고 싶어요.",
              orderIndex: 10,
            },
          ],
          학업: [
            {
              questionId: 201,
              category: "학업",
              questionText:
                "어머니, 요즘 OO가 집에서 학교 이야기를 자주 들려주나요? 주로 어떤 주제인가요?",
              exampleAnswer:
                "00이는 집에 오면 매일 학교에서 무슨 일이 있었는지 이야기해줘요.",
              words: [
                "00이",
                "는",
                "집에",
                "오면",
                "매일",
                "학교에서",
                "무슨",
                "일이",
                "있었는지",
                "이야기해줘요",
              ],
              pronunciationGuide: [
                "00이",
                "는",
                "지 베",
                "오 면",
                "매 일",
                "학 꾜 에 서",
                "무 슨",
                "이 리",
                "이 썬 는 지",
                "이 야 기 해 줘 요",
              ],
              wordTranslations: [
                "00",
                "is",
                "at home",
                "comes",
                "every day",
                "at school",
                "what",
                "happened",
                "whether there was",
                "tells stories",
              ],
              orderIndex: 1,
            },
            {
              questionId: 202,
              category: "학업",
              questionText:
                "아이가 학교 가는 것에 대해 아침에 어떤 기분이나 태도를 보이나요?",
              exampleAnswer:
                "항상 늦잠을 자서 아침에 깨우기 힘들어요. 하지만 00이는 전날 학교 준비물을 스스로 잘 챙겨요.",
              orderIndex: 2,
              words: ["항상", "늦잠을", "자서"],
              pronunciationGuide: ["항 상", "늗 짜 믈", "자 서"],
              wordTranslations: ["Always", "Oversleep", "Sleep"],
            },
            {
              questionId: 203,
              category: "학업",
              questionText:
                "요즘 아이가 집에서 가장 몰입하고 있거나 즐거워하는 취미나 관심사가 무엇인가요?",
              exampleAnswer:
                "우리 아이는 축구를 좋아해요. 학교 끝나고 친구들과 축구하고 흙투성이로 들어와요.",
              orderIndex: 3,
              words: ["우리", "아이는", "축구를", "좋아해요"],
              pronunciationGuide: [
                "우 리",
                "아 이 는",
                "축 꾸 를",
                "조 아 해 요",
              ],
              wordTranslations: ["Our", "Child", "Soccer", "Likes"],
            },
            {
              questionId: 204,
              category: "학업",
              questionText:
                "집에서 스스로 챙겨야 할 일(숙제, 가방 챙기기, 씻기 등)을 어느 정도 스스로 해내고 있나요?",
              exampleAnswer:
                "우리 애기는 스스로 다 해요. 제가 잘 몰라서 어릴 때부터 스스로 했어요.",
              orderIndex: 4,
            },
            {
              questionId: 205,
              category: "학업",
              questionText:
                "아이가 자신의 감정(짜증, 슬픔, 화 등)을 부모님께 솔직하게 표현하는 편인가요?",
              exampleAnswer:
                "애기가 원래 좀 조용한데 그래도 큰 일은 다 얘기해요.",
              orderIndex: 5,
            },
            {
              questionId: 206,
              category: "학업",
              questionText:
                "요즘 아이가 사춘기 전조 증상처럼 독립심이 강해지거나 부모님과 의견 충돌이 잦아지지는 않았나요?",
              exampleAnswer:
                "아직 그런 거는 없는 것 같아요. 말하면 잘 듣고 화내거나 짜증은 잘 안 내요.",
              orderIndex: 6,
            },
            {
              questionId: 207,
              category: "학업",
              questionText:
                "평소 수면 시간이나 식습관 등 기초 생활 습관에서 부모님이 걱정하시는 부분이 있으실까요?",
              exampleAnswer:
                "요즘 핸드폰 한다고 늦게 자서 조금 걱정이에요. 밤늦게까지 뭘 그렇게 보는지 모르겠어요.",
              orderIndex: 7,
            },
            {
              questionId: 208,
              category: "학업",
              questionText:
                "아이가 집에서 자주 언급하는 친한 친구는 누구인가요? 그 친구와는 어떤 점이 잘 맞는다고 하나요?",
              exampleAnswer:
                "우리 애는 {friend.name}이랑 친해요. 학교에서 {friend.name}이랑 맨날 다닌다고 말했어요.",
              orderIndex: 8,
            },
            {
              questionId: 209,
              category: "학업",
              questionText:
                "혹시 친구 관계에서 속상했던 일을 이야기하거나, 고민을 털어놓은 적이 있나요?",
              exampleAnswer:
                "그런 거는 잘 이야기 안 해요. 누구 만난다 뭐 한다 이야기는 하는데 고민은 잘 말하지 않아요.",
              orderIndex: 9,
            },
            {
              questionId: 210,
              category: "학업",
              questionText:
                "집에서 혼자 공부하는 시간이 어느 정도 되나요? 집중력은 어떤 편인가요?",
              exampleAnswer:
                "매일 1시간 정도 혼자 공부해요. 좋아하는 과목은 집중이 좋지만 수학은 20분 지나면 집중을 못 해요.",
              orderIndex: 10,
            },
          ],
          의료: [
            {
              questionId: 301,
              category: "의료",
              questionText: "어디가 가장 불편해서 오셨나요?",
              exampleAnswer:
                "아이가 어제부터 배가 아프다고 해요. 설사도 세 번 했고 기침과 코막힘도 심해요.",
              orderIndex: 1,
              words: ["어디가", "가장", "불편해서", "오셨나요"],
              pronunciationGuide: [
                "어 디 가",
                "가 장",
                "불 편 해 서",
                "오 션 나 요",
              ],
              wordTranslations: ["Where", "Most", "Uncomfortable", "Came"],
            },
            {
              questionId: 302,
              category: "의료",
              questionText: "이 증상이 정확히 언제부터 시작되었나요?",
              exampleAnswer:
                "아마 3일쯤 전부터 아프기 시작했던 것 같아요. 한두 시간 전부터는 계속 토하고 있어요.",
              orderIndex: 2,
              words: ["이", "증상이", "언제부터", "시작되었나요"],
              pronunciationGuide: [
                "이",
                "증 상 이",
                "언 제 부 터",
                "시 작 뙨 나 요",
              ],
              wordTranslations: ["This", "Symptom", "When", "Started"],
            },
            {
              questionId: 303,
              category: "의료",
              questionText:
                "통증의 정도를 1부터 10까지로 치면 어느 정도인가요?",
              exampleAnswer:
                "정확히는 모르겠어요. 그런데 밥도 거의 못 먹고 계속 누워만 있을 정도로 힘들어해요.",
              orderIndex: 3,
              words: ["통증의", "정도를", "어느", "정도인가요"],
              pronunciationGuide: [
                "통 쯩 의",
                "정 도 를",
                "어 느",
                "정 도 인 가 요",
              ],
              wordTranslations: ["Pain", "Level", "Which", "Degree"],
            },
            {
              questionId: 304,
              category: "의료",
              questionText: "증상이 점점 심해지나요, 아니면 호전되는 중인가요?",
              exampleAnswer:
                "처음에는 조금만 아팠는데 이제는 약을 먹어도 좋아지지 않아요.",
              orderIndex: 4,
              words: ["증상이", "점점", "심해지나요"],
              pronunciationGuide: ["증 상 이", "점 점", "심 해 지 나 요"],
              wordTranslations: ["Symptom", "Gradually", "Worsening"],
            },
            {
              questionId: 305,
              category: "의료",
              questionText:
                "열을 재보셨나요? 가장 높았을 때가 몇 도였고, 해열제를 먹었나요?",
              exampleAnswer:
                "집에서 열을 쟀을 때 38도까지 올라갔어요. 아침 먹고 해열제를 먹였는데 잘 안 내려가요.",
              orderIndex: 5,
              words: ["열을", "재보셨나요", "해열제를", "먹었나요"],
              pronunciationGuide: [
                "여 를",
                "재 보 션 나 요",
                "해 열 쩨 를",
                "머 건 나 요",
              ],
              wordTranslations: ["Fever", "Measured", "Fever reducer", "Took"],
            },
            {
              questionId: 306,
              category: "의료",
              questionText:
                "기침/콧물 외에 구토나 설사, 발진 같은 다른 증상은 없나요?",
              exampleAnswer:
                "어제부터 설사를 하고 있고 계속 춥다고 해요. 열도 조금 있는 것 같아요.",
              orderIndex: 6,
              words: ["다른", "증상은", "없나요"],
              pronunciationGuide: ["다 른", "증 상 은", "엄 나 요"],
              wordTranslations: ["Other", "Symptoms", "None"],
            },
            {
              questionId: 307,
              category: "의료",
              questionText:
                "아이의 소변 양이 평소보다 줄었거나, 식사량이 급격히 떨어졌나요?",
              exampleAnswer: "아이가 배가 아파서 밥을 덜 먹어요.",
              orderIndex: 7,
              words: ["식사량이", "급격히", "떨어졌나요"],
              pronunciationGuide: ["식 싸 량 이", "급 껴 키", "떠 러 전 나 요"],
              wordTranslations: ["Meal amount", "Rapidly", "Dropped"],
            },
            {
              questionId: 308,
              category: "의료",
              questionText: "이전에도 비슷한 증상으로 진료를 받은 적이 있나요?",
              exampleAnswer: "저번에 아팠을 때도 목이 아팠어요.",
              orderIndex: 8,
              words: ["비슷한", "증상으로", "진료를", "받은 적이"],
              pronunciationGuide: [
                "비 스 탄",
                "증 상 으 로",
                "질 료 를",
                "바 든 저 기",
              ],
              wordTranslations: [
                "Similar",
                "Symptoms",
                "Diagnosis",
                "Received",
              ],
            },
            {
              questionId: 309,
              category: "의료",
              questionText:
                "약물이나 음식에 대한 알레르기 반응을 보인 적이 있나요?",
              exampleAnswer:
                "저는 우유 알레르기가 있어요. 그래서 아이도 우유를 못 마셔요.",
              orderIndex: 9,
              words: ["알레르기", "반응을", "보인 적이", "있나요"],
              pronunciationGuide: [
                "알 레 르 기",
                "바 능 을",
                "보 인 저 기",
                "인 나 요",
              ],
              wordTranslations: ["Allergy", "Reaction", "Shown", "Have"],
            },
            {
              questionId: 310,
              category: "의료",
              questionText: "가족 중에 비슷한 증상을 앓고 있는 사람이 있나요?",
              exampleAnswer: "제 어머니도 우유 알레르기가 있어요.",
              orderIndex: 10,
              words: ["가족", "중에", "비슷한", "사람이"],
              pronunciationGuide: ["가 조", "쭝 에", "비 스 탄", "사 라 미"],
              wordTranslations: ["Family", "Among", "Similar", "Person"],
            },
          ],
        };

        const data = mockData[categoryId] || [];

        resolve({
          data: {
            success: true,
            message: "Stages fetched successfully (MOCK)",
            data: data,
          },
        });
      }, 50);
    });
  }
};

/**
 * Fetch detailed question info including example answer and pronunciation.
 * @param {string} categoryId - The category ID.
 * @param {number} orderIndex - The question order index.
 * @returns {Promise<Object>} - The API response.
 */
export const fetchProblemDetail = async (categoryId, orderIndex) => {
  try {
    const response = await instance.get(
      `/learning/categories/${categoryId}/stages/${orderIndex}/example`,
    );
    return response;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.warn(`[API Info] Unauthorized (401). Switching to mock data for problem detail.`);
    } else {
      console.error(`[API Error] Failed to fetch problem detail. Falling back to mock data.`, error);
    }

    // Mock fallback matching API Docs Section 4
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = {
          success: true,
          message: "질문 및 예시 답변 조회 성공 (MOCK)",
          data: {
            questionText: "Sample Question Text",
            exampleAnswer: "Sample Example Answer",
            words: ["Sample", "Words"],
            pronunciationGuide: ["Sam", "ple", "Wuh", "rds"],
            wordTranslations: ["Sample", "Words"],
            viQuestions: "Sample Vietnamese Question",
            viAnswers: "Sample Vietnamese Answer",
            zhQuestions: null,
            zhAnswers: null,
          },
        };

        // Try to find more specific mock data if available
        if (categoryId === "학업") {
          if (orderIndex == 1 || orderIndex == 201) {
            mockResponse.data = {
              questionText:
                "어머니, 요즘 OO가 집에서 학교 이야기를 자주 들려주나요? 주로 어떤 주제인가요?",
              exampleAnswer:
                "00이는 집에 오면 매일 학교에서 무슨 일이 있었는지 이야기해줘요.",
              words: [
                "00이",
                "는",
                "집에",
                "오면",
                "매일",
                "학교에서",
                "무슨",
                "일이",
                "있었는지",
                "이야기해줘요",
              ],
              pronunciationGuide: [
                "00이",
                "는",
                "지 베",
                "오 면",
                "매 일",
                "학 꾜 에 서",
                "무 슨",
                "이 리",
                "이 썬 는 지",
                "이 야 기 해 줘 요",
              ],
              wordTranslations: [
                "00",
                "is",
                "at home",
                "comes",
                "every day",
                "at school",
                "what",
                "happened",
                "whether there was",
                "tells stories",
              ],
              viQuestions:
                "Mẹ ơi, dạo này OO có hay kể chuyện trường lớp ở nhà không? Chủ đề thường là gì vậy?",
              viAnswers:
                "Mỗi khi về nhà, 00 đều kể cho tôi nghe những gì đã xảy ra ở trường.",
              zhQuestions: null,
              zhAnswers: null,
            };
          } else if (orderIndex == 2 || orderIndex == 202) {
            mockResponse.data = {
              questionText:
                "아이가 학교 가는 것에 대해 아침에 어떤 기분이나 태도를 보이나요?",
              exampleAnswer:
                "항상 늦잠을 자서 아침에 깨우기 힘들어요. 하지만 00이는 전날 학교 준비물을 스스로 잘 챙겨요.",
              words: ["항상", "늦잠을", "자서"],
              pronunciationGuide: ["항 상", "늗 짜 믈", "자 서"],
              wordTranslations: ["Always", "Oversleep", "Sleep"],
              viQuestions:
                "Buổi sáng khi đi học, tâm trạng hay thái độ của bé thế nào?",
              viAnswers:
                "Bé luôn ngủ nướng nên sáng gọi dậy rất khó. Nhưng 00 thì tự chuẩn bị đồ dùng học tập từ hôm trước rất tốt.",
              zhQuestions: null,
              zhAnswers: null,
            };
          } else if (orderIndex == 3 || orderIndex == 203) {
            mockResponse.data = {
              questionText:
                "요즘 아이가 집에서 가장 몰입하고 있거나 즐거워하는 취미나 관심사가 무엇인가요?",
              exampleAnswer:
                "우리 아이는 축구를 좋아해요. 학교 끝나고 친구들과 축구하고 흙투성이로 들어와요.",
              words: ["우리", "아이는", "축구를", "좋아해요"],
              pronunciationGuide: [
                "우 리",
                "아 이 는",
                "축 꾸 를",
                "조 아 해 요",
              ],
              wordTranslations: ["Our", "Child", "Soccer", "Likes"],
              viQuestions:
                "Dạo này bé có sở thích hay mối quan tâm nào mà bé say mê hoặc thích thú nhất khi ở nhà không?",
              viAnswers:
                "Bé nhà mình thích bóng đá lắm. Tan học là đá bóng với bạn, lấm lem bùn đất mới về.",
              zhQuestions: null,
              zhAnswers: null,
            };
          }
        }

        resolve({ data: mockResponse });
      }, 50);
    });
  }
};

/**
 * Fetch TTS audio for the given text.
 * @param {string} text - The text to convert to speech.
 * @returns {Promise<Blob>} - The audio blob.
 */
export const fetchTts = async (text) => {
  // Swagger defines text as a query parameter.
  // We explicitly unset content-type since there is no body, to prevent server parsing errors.
  const response = await instance.post("/learning/tts", null, {
    params: { text },
    responseType: "blob",
    headers: {
      "Content-Type": undefined,
    },
  });
  return response.data;
};

/**
 * Upload audio for translation.
 * @param {Blob} audioBlob - The recorded audio blob.
 * @returns {Promise<Object>} - The translation result.
 */
export const translateAudio = async (audioBlob) => {
  const formData = new FormData();
  // The backend expects 'file' as the key
  formData.append("file", audioBlob, "recording.mp3");

  const response = await instance.post("/learning/translate/audio", formData, {
    headers: {
      // Let the browser set the Content-Type with boundary for FormData
      // We explicitly set it to undefined to override any default 'application/json' if set in instance
      "Content-Type": undefined,
    },
  });
  return response.data;
};

/**
 * Evaluate pronunciation for shadowing.
 * @param {Blob} audioBlob - The recorded audio blob.
 * @param {string} expectedText - The text the user should be speaking.
 * @param {number} retryCount - Current retry count (default 0).
 * @returns {Promise<Object>} - The evaluation result { success, message, data: boolean }.
 */
export const evaluatePronunciation = async (
  audioBlob,
  expectedText,
  retryCount = 0,
) => {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.mp3");

  // Using query params for expectedText and retryCount as per Swagger/Docs
  const response = await instance.post(
    "/learning/shadowing/evaluate",
    formData,
    {
      params: {
        expectedText,
        retryCount,
      },
      headers: {
        "Content-Type": undefined,
      },
    },
  );
  return response.data;
};

/**
 * Fetch native question text for a specific stage.
 * @param {string} categoryId - The category ID.
 * @param {number} orderIndex - The question order index.
 * @returns {Promise<Object>} - The API response.
 */
export const fetchProblemNative = async (categoryId, orderIndex) => {
  try {
    const response = await instance.get(
      `/learning/categories/${categoryId}/stages/${orderIndex}/native`,
    );
    return response;
  } catch (error) {
    if (error.response && error.response.status === 401) {
         console.warn(`[API Info] Unauthorized (401). Switching to mock data for native problem text.`);
    } else {
         console.error(`[API Error] Failed to fetch native problem text. Falling back to mock data.`, error);
    }

    // Mock fallback matching API Docs Section 3
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = {
          success: true,
          message: "질문 조회 성공 (MOCK)",
          data: "Sample Question Text (Native Mock)",
        };

        // Specific mock data for "학업" to match other mocks
        if (categoryId === "학업") {
          if (orderIndex == 1 || orderIndex == 201) {
            mockResponse.data =
              "어머니, 요즘 OO가 집에서 학교 이야기를 자주 들려주나요? 주로 어떤 주제인가요?";
          } else if (orderIndex == 2 || orderIndex == 202) {
            mockResponse.data =
              "아이가 학교 가는 것에 대해 아침에 어떤 기분이나 태도를 보이나요?";
          } else if (orderIndex == 3 || orderIndex == 203) {
            mockResponse.data =
              "요즘 아이가 집에서 가장 몰입하고 있거나 즐거워하는 취미나 관심사가 무엇인가요?";
          }
        }

        resolve({ data: mockResponse });
      }, 50);
    });
  }
};
