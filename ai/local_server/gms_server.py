import os
import logging
import requests
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="GMS Word Tokenizer API",
    description="GMS API를 사용한 단어 분리 서비스",
    version="1.0.0"
)

# GMS API 설정
GMS_API_KEY = os.getenv("GMS_API_KEY")
GMS_API_URL = os.getenv("GMS_API_URL")
GMS_MODEL = os.getenv("GMS_MODEL")


# Pydantic Models

class TokenizeRequest(BaseModel):
    """단어 분리 요청 모델"""
    text: str


class TokenizeResponse(BaseModel):
    """단어 분리 응답 모델"""
    original_text: str
    words: List[str]
    word_count: int


class PronunciationGuideRequest(BaseModel):
    """발음 가이드 요청 모델"""
    words: List[str]


class PronunciationGuideResponse(BaseModel):
    """발음 가이드 응답 모델"""
    words: List[str]
    pronunciation_guide: List[str]


# GMS API 호출

def call_gms_api(prompt: str) -> str:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GMS_API_KEY}"
    }

    payload = {
        "model": GMS_MODEL,
        "messages": [
            {
                "role": "developer", 
                "content": "너는 한국어 문장 처리를 돕는다. 출력은 규칙대로만 한다."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_completion_tokens": 256, 
        "temperature": 0             
    }

    try:
        logger.info("Calling GMS API model=%s", GMS_MODEL)
        response = requests.post(GMS_API_URL, headers=headers, json=payload, timeout=30)

        if response.status_code >= 400:
            logger.error("GMS error status=%s body=%s", response.status_code, response.text)
            raise HTTPException(status_code=500, detail=f"GMS API error: {response.text}")

        result = response.json()
        answer = result["choices"][0]["message"]["content"]
        logger.info("GMS API response: %s", answer)
        return answer

    except requests.exceptions.RequestException as e:
        logger.error("GMS API call failed: %s", e)
        raise HTTPException(status_code=500, detail=f"GMS API call failed: {str(e)}")



def tokenize_text_with_gms(text: str) -> List[str]:
    """
    GMS API를 사용하여 텍스트를 단어 단위로 분리

    Parameters:
    - text: 분리할 텍스트

    Returns:
    - 단어 리스트
    """
    prompt = f"""너는 한국어 문장을 정확히 어절 단위로 분리하는 역할을 한다.

다음 규칙을 반드시 지켜라:

1. 문장을 "어절(띄어쓰기 기준)" 단위로 분리하라.
2. 형태소 분해를 하지 마라. (예: "좋아해요"를 "좋아, 해요"로 나누지 마라)
3. 조사, 어미, 접미사는 원 단어에 붙인 채 유지하라.
4. 마침표(.), 물음표(?), 느낌표(!)는 단어로 따로 분리하지 말고
   해당 어절 끝에 그대로 붙여라.
5. 쉼표(,)는 출력 구분자로만 사용하라.
6. 입력 순서를 절대 변경하지 마라.
7. 설명, 줄바꿈, 번호, 따옴표를 절대 포함하지 마라.
8. 반드시 한 줄로만 출력하라.

예시:
입력: 아이가 학교에 갑니다.
출력: 아이가, 학교에, 갑니다.

입력: 너 오늘 뭐 해?
출력: 너, 오늘, 뭐, 해?

문장:
{text}

응답 형식:
단어1, 단어2, 단어3, ...

"""

    # GMS API 호출
    response_text = call_gms_api(prompt)

    # 응답 파싱: 쉼표로 구분된 단어 리스트 추출
    words = [word.strip() for word in response_text.split(",") if word.strip()]

    return words


# API Endpoints

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "service": "GMS Word Tokenizer API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "tokenize": "/api/v1/tokenize",
            "pronunciation_guide": "/api/v1/pronunciation-guide"
        }
    }


@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "gms_api_url": GMS_API_URL,
        "model": GMS_MODEL
    }


@app.post("/api/v1/tokenize", response_model=TokenizeResponse)
async def tokenize(request: TokenizeRequest):
    """
    텍스트를 단어 단위로 분리

    Parameters:
    - request: TokenizeRequest (text 필드 포함)

    Returns:
    - TokenizeResponse: 원본 텍스트, 단어 리스트, 단어 개수
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="text is required")

    try:
        logger.info(f"Tokenizing text: '{request.text}'")

        # GMS API를 사용하여 단어 분리
        words = tokenize_text_with_gms(request.text)

        logger.info(f"✓ Tokenization completed: {len(words)} words")

        return TokenizeResponse(
            original_text=request.text,
            words=words,
            word_count=len(words)
        )

    except Exception as e:
        logger.error(f"Tokenization error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Tokenization failed: {str(e)}"
        )


@app.post("/api/v1/pronunciation-guide", response_model=PronunciationGuideResponse)
async def generate_pronunciation_guide(request: PronunciationGuideRequest):
    """
    한국어 단어들을 실제 발음대로 표기한 가이드 생성

    Parameters:
    - request: PronunciationGuideRequest (words 리스트)

    Returns:
    - PronunciationGuideResponse: 원본 단어 리스트 + 발음 가이드 리스트
    """
    if not request.words:
        raise HTTPException(status_code=400, detail="words list is required")

    try:
        logger.info(f"Generating pronunciation guide for {len(request.words)} words")

        # GMS API를 사용하여 발음 가이드 생성
        words_str = ", ".join(request.words)
        prompt = f"""당신은 한국어 선생님입니다.
        한국어가 어눌한 학습자들이 올바른 발음을 할 수 있도록 돕기 위해
        다음 한국어 단어들을 표준 발음 규칙에 따라 실제 발음대로 표기하세요.

다음 음운 규칙을 적용하세요:
1. 연음 (받침이 다음 글자로 이어지는 경우)
2. 된소리되기
3. 구개음화
4. 비음화
5. 유음화
6. 격음화

발음 변화가 없는 경우에는 원형을 그대로 유지하세요.
불필요한 축약이나 구어체 변형은 하지 마세요.
철자 변형이 아닌 실제 발음 기준으로 작성하세요.

예시:
아이들은 → 아이드른
어떻게 → 어떠케
먹는 → 멍는
국물 → 궁물
같이 → 가치
읽고 → 일꼬
학교에서 → 학교에서

입력 단어:
{words_str}

응답 형식:
발음1, 발음2, 발음3, ...

설명 없이 발음만 쉼표로 구분하여 출력하세요.
"""

        # GMS API 호출
        response_text = call_gms_api(prompt)

        # 응답 파싱: 쉼표로 구분된 발음 리스트 추출
        pronunciation_guide = [p.strip() for p in response_text.split(",") if p.strip()]

        # 단어 수가 일치하지 않으면 원본 그대로 반환
        if len(pronunciation_guide) != len(request.words):
            logger.warning(f"Pronunciation count mismatch. Using original words.")
            pronunciation_guide = request.words

        logger.info(f"✓ Pronunciation guide generated: {pronunciation_guide}")

        return PronunciationGuideResponse(
            words=request.words,
            pronunciation_guide=pronunciation_guide
        )

    except Exception as e:
        logger.error(f"Pronunciation guide error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Pronunciation guide generation failed: {str(e)}"
        )


# Main Entry Point

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 7000))
    uvicorn.run(
        "gms:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )