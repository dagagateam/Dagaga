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
                "role": "system",
                "content": "You are a Korean language tokenizer. Your task is to split Korean sentences into words."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_completion_tokens": 4096,  # gpt-5-mini는 max_completion_tokens 사용
        "temperature": 0.3
    }

    try:
        logger.info(f"Calling GMS API with prompt: {prompt}")
        response = requests.post(GMS_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        result = response.json()
        answer = result["choices"][0]["message"]["content"]
        logger.info(f"GMS API response: {answer}")

        return answer

    except requests.exceptions.RequestException as e:
        logger.error(f"GMS API call failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"GMS API call failed: {str(e)}"
        )


def tokenize_text_with_gms(text: str) -> List[str]:
    """
    GMS API를 사용하여 텍스트를 단어 단위로 분리

    Parameters:
    - text: 분리할 텍스트

    Returns:
    - 단어 리스트
    """
    prompt = f"""다음 한국어 문장을 단어 단위로 분리해주세요.
각 단어는 쉼표(,)로 구분하고, 다른 설명 없이 단어만 나열해주세요.

문장: {text}

응답 형식: 단어1, 단어2, 단어3, ...
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
        prompt = f"""다음 한국어 단어들을 실제 발음대로 표기해주세요.
받침이 다음 글자로 연음되는 경우, 연음된 발음대로 적어주세요.

예시:
- "아이들은" → "아이드른"
- "어떻게" → "어떠케"
- "학교에서" → "학교에서" (변화 없으면 그대로)

단어: {words_str}

응답 형식: 발음1, 발음2, 발음3, ...
(설명 없이 발음만 쉼표로 구분하여 나열)
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

    port = int(os.getenv("PORT", 4000))
    uvicorn.run(
        "gms:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
