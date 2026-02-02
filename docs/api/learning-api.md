# 학습 API 명세서

학습 API는 음성 번역, 카테고리별 학습 질문, 발음 평가 및 TTS(Text-to-Speech)를 위한 엔드포인트를 제공합니다.

## 기본 URL
`/api/v1/learning`

---

## 1. 음성 번역
업로드된 음성 파일을 번역하고 단어 토큰 및 발음 가이드를 제공합니다.

- **엔드포인트:** `POST /translate/audio`
- **요청 방식:** `POST`
- **데이터 형식 (Consumes):** `multipart/form-data`
- **요청 바디 (Multipart):**
  - `file` (File, 필수): 번역할 음성 파일 (mp3 형식 권장).
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {
      "success": true,
      "message": "음성 파일 번역이 완료",
      "data": {
        "translated_text": "안녕하세요, 어떻게 지내세요?",
        "words": ["안녕하세요", "어떻게", "지내세요"],
        "pronunciation_guide": ["an-nyeong-ha-se-yo", "eo-tteoh-ge", "ji-nae-se-yo"]
      }
    }
    ```
  - **400 Bad Request** (유효하지 않은 파일 형식 또는 크기)
  - **413 Payload Too Large** (파일 크기 10MB 초과)
  - **500 Internal Server Error** (번역 엔진 오류)

---

## 2. 카테고리별 질문 목록 조회
특정 학습 카테고리에 대한 질문 목록을 가져옵니다.

- **엔드포인트:** `GET /categories/{categoryId}/stages`
- **요청 방식:** `GET`
- **패스 파라미터 (Path Parameters):**
  - `categoryId` (String, 필수): 카테고리명 (예: "자기소개", "학업", "의료").
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {
      "success": true,
      "message": "'자기소개' 카테고리 질문 조회 성공",
      "data": [
        {
          "questionId": 1,
          "category": "자기소개",
          "questionText": "당신의 이름은 무엇입니까?",
          "exampleAnswer": "제 이름은 김철수입니다.",
          "orderIndex": 1
        }
      ]
    }
    ```

---

## 3. 질문 텍스트 조회 (모국어 모드)
특정 단계의 질문 텍스트만 가져옵니다.

- **엔드포인트:** `GET /categories/{categoryId}/stages/{orderIndex}/native`
- **요청 방식:** `GET`
- **패스 파라미터 (Path Parameters):**
  - `categoryId` (String, 필수): 카테고리명.
  - `orderIndex` (Integer, 필수): 질문 순서 (1부터 시작).
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {
      "success": true,
      "message": "질문 조회 성공",
      "data": "당신의 이름은 무엇입니까?"
    }
    ```

---

## 4. 질문 및 예시 답변 조회 (예시 모드)
질문, 예시 답변 및 발음 상세 정보를 가져옵니다.

- **엔드포인트:** `GET /categories/{categoryId}/stages/{orderIndex}/example`
- **요청 방식:** `GET`
- **패스 파라미터 (Path Parameters):**
  - `categoryId` (String, 필수): 카테고리명.
  - `orderIndex` (Integer, 필수): 질문 순서.
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {
      "success": true,
      "message": "질문 및 예시 답변 조회 성공",
      "data": {
        "questionText": "당신의 이름은 무엇입니까?",
        "exampleAnswer": "제 이름은 김철수입니다.",
        "words": ["제", "이름은", "김철수입니다"],
        "pronunciation_guide": ["je", "i-reum-eun", "kim-cheol-su-im-ni-da"]
      }
    }
    ```

---

## 5. 발음 평가 (섀도잉)
업로드된 음성 파일을 기반으로 주어진 텍스트의 발음을 평가합니다.

- **엔드포인트:** `POST /shadowing/evaluate`
- **요청 방식:** `POST`
- **데이터 형식 (Consumes):** `multipart/form-data`
- **요청 바디 (Multipart):**
  - `file` (File, 필수): 사용자의 음성 녹음 파일.
  - `expectedText` (String, 필수): 사용자가 말해야 하는 텍스트.
  - `retryCount` (Integer, 선택, 기본값: 0): 시도 횟수.
- **응답 본문 (Response Body):**
  - **200 OK**
    ```json
    {
      "success": true,
      "message": "발음 평가 완료",
      "data": true
    }
    ```

---

## 6. TTS (Text-to-Speech)
텍스트를 음성 파일로 변환합니다.

- **엔드포인트:** `POST /tts`
- **요청 방식:** `POST`
- **인증:** 필요 (Bearer token)
- **쿼리 파라미터:**
  - `text` (String, 필수): 변환할 텍스트.
  - `language` (String): **더 이상 필요하지 않음** - JWT의 `viewLangCode`에서 자동으로 추출됩니다.
- **응답 본문 (Response Body):**
  - **200 OK** (바이너리 데이터)
    - Content-Type: `audio/mpeg`
    - Content-Disposition: `attachment; filename="tts_ko.mp3"`

**참고:**
- 사용자의 화면 표시 언어 코드(`viewLangCode`)가 JWT에서 자동으로 추출되어 TTS 언어로 사용됩니다.
- 프론트엔드에서 별도로 언어 코드를 전송할 필요가 없습니다.

**cURL 예시:**
```bash
curl -X POST "http://localhost:8080/api/v1/learning/tts?text=안녕하세요" \
  -H "Authorization: Bearer {accessToken}" \
  --output tts_output.mp3
```
