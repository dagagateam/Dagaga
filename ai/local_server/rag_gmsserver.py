import os
import logging
import requests
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

from rag_pronunciation import initialize_rag_system, generate_pronunciation_with_rag

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# 서버 시작 시 RAG 시스템 초기화
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 시작/종료 시 실행되는 lifespan 이벤트"""
    try:
        logger.info("Initializing RAG system on startup...")
        initialize_rag_system()
        logger.info("RAG system ready")
    except Exception as e:
        logger.error(f"Failed to initialize RAG system: {e}")
        import traceback
        traceback.print_exc()
        logger.warning("Server will continue without RAG (fallback mode)")
    
    yield
    
    logger.info("Shutting down...")

app = FastAPI(
    title="GMS Word Tokenizer API",
    description="GMS API를 사용한 단어 분리 및 RAG 기반 발음 가이드 서비스",
    version="2.0.0",
    lifespan=lifespan
)

# GMS API 설정
GMS_API_KEY = os.getenv("GMS_API_KEY")
GMS_API_URL = os.getenv("GMS_API_URL")
GMS_MODEL = os.getenv("GMS_MODEL")



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
    """일반 GMS API 호출 (단어 분리 등)"""
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


def call_gms_api_for_pronunciation(prompt: str) -> str:
    """발음 가이드 생성 전용 GMS API 호출 (Gemini API 형식 사용)"""
    
    # Gemini 2.5 Flash 모델 사용
    model = "gemini-2.5-flash"
    
    # Gemini API 엔드포인트 구성
    gemini_url = f"https://gms.ssafy.io/gmsapi/generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GMS_API_KEY
    }
    
    # Gemini API 형식 페이로드
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 512
        }
    }

    try:
        logger.info(f"Calling GMS API for pronunciation guide, model={model}")
        response = requests.post(gemini_url, headers=headers, json=payload, timeout=30)

        if response.status_code >= 400:
            logger.error(f"GMS error status={response.status_code} body={response.text}")
            raise HTTPException(status_code=500, detail=f"GMS API error: {response.text}")

        result = response.json()
        
        # Gemini API 응답 파싱
        # 형식: {"candidates": [{"content": {"parts": [{"text": "..."}]}}]}
        if "candidates" in result and len(result["candidates"]) > 0:
            candidate = result["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                parts = candidate["content"]["parts"]
                if len(parts) > 0 and "text" in parts[0]:
                    answer = parts[0]["text"]
                    logger.info(f"GMS API response: {answer}")
                    return answer
        
        # 파싱 실패 시
        logger.error(f"Unexpected response format: {result}")
        raise HTTPException(status_code=500, detail="Failed to parse GMS API response")

    except requests.exceptions.RequestException as e:
        logger.error(f"GMS API call failed: {e}")
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
3. 마침표(.), 물음표(?), 느낌표(!)는 단어로 따로 분리하지 말고 해당 어절 끝에 그대로 붙여라.
4. 쉼표(,)는 출력 구분자로만 사용하라.
5. 입력 순서를 절대 변경하지 마라.
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
    return {
        "status": "healthy",
        "gms_api_url": GMS_API_URL,
        "model": GMS_MODEL
    }

#단어 분리 로직
@app.post("/api/v1/tokenize", response_model=TokenizeResponse)
async def tokenize(request: TokenizeRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="text is required")

    try:
        logger.info(f"Tokenizing text: '{request.text}'")

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

# 발화 가이드라인 생성
@app.post("/api/v1/pronunciation-guide", response_model=PronunciationGuideResponse)
async def generate_pronunciation_guide(request: PronunciationGuideRequest):

    if not request.words:
        raise HTTPException(status_code=400, detail="words list is required")

    try:
        logger.info(f"Generating pronunciation guide for {len(request.words)} words (RAG-based)")

        pronunciation_guide = generate_pronunciation_with_rag(
            words=request.words,
            gms_api_call_func=call_gms_api_for_pronunciation  
        )

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



if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 7000))
    uvicorn.run(
        "rag_gms:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )