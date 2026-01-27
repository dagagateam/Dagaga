import os
import tempfile
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from faster_whisper import WhisperModel
from googletrans import Translator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Translation API",
    description="Audio translation API for Chinese/Vietnamese to Korean",
    version="1.0.0"
)

# 모델 설정
MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")
DEVICE = os.getenv("WHISPER_DEVICE", "cuda")
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "float16")

whisper_model: Optional[WhisperModel] = None
translator = Translator()


class TranslationResponse(BaseModel):
    original_text: str
    original_language: str
    translated_text: str
    target_language: str


# Whisper 모델 로드
def get_model() -> WhisperModel:
    global whisper_model
    
    if whisper_model is None:
        logger.info(f"Loading Whisper model: {MODEL_SIZE} on {DEVICE}")
        try:
            whisper_model = WhisperModel(
                MODEL_SIZE,
                device=DEVICE,
                compute_type=COMPUTE_TYPE,
                num_workers=1
            )
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise HTTPException(status_code=500, detail=f"Model loading failed: {str(e)}")
    
    return whisper_model


# 텍스트 번역 (구글 번역 사용)
async def translate_text(text: str, source_lang: str, target_lang: str = "ko") -> str:
    try:
        result = await translator.translate(text, src=source_lang, dest=target_lang)
        return result.text
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


# 서버 시작 시 모델 미리 로드
@app.on_event("startup")
async def startup_event():
    logger.info("Starting Translation API...")
    try:
        get_model()
        logger.info("Translation API ready")
    except Exception as e:
        logger.error(f"Startup failed: {e}")


# 기본 엔드포인트
@app.get("/")
async def root():
    return {
        "status": "running",
        "model_size": MODEL_SIZE,
        "device": DEVICE,
        "message": "Translation API for Audio"
    }


# 헬스 체크
@app.get("/health")
async def health_check():
    model_loaded = whisper_model is not None
    return {
        "status": "healthy" if model_loaded else "initializing",
        "model_loaded": model_loaded,
        "model_size": MODEL_SIZE,
        "device": DEVICE
    }


# 음성을 한국어로 번역 (중국어, 베트남어 → 한국어)
@app.post("/translate-audio", response_model=TranslationResponse)
async def translate_audio(
    file: UploadFile = File(...),
    source_language: str = "auto"  # auto, zh-cn (중국어), vi (베트남어)
):
    """
    음성 파일을 받아서 ASR → 번역 → 한국어 텍스트 반환
    
    Parameters:
    - file: 음성 파일 (wav, mp3 등)
    - source_language: 원본 언어 ("auto": 자동 감지, "zh-cn": 중국어, "vi": 베트남어)
    """
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    model = get_model()
    
    temp_file = None
    try:
        # 1. 음성 파일 저장
        audio_data = await file.read()
        file_extension = Path(file.filename).suffix or ".wav"
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name
        
        logger.info(f"Processing audio file: {file.filename} ({len(audio_data)} bytes)")
        
        # 2. ASR: 음성 → 원본 언어 텍스트
        # 자동 감지 모드일 경우 언어 지정 안 함
        transcribe_params = {
            "beam_size": 5,
            "vad_filter": True,
            "temperature": 0.0,
            "condition_on_previous_text": False,
        }
        
        # 자동 감지가 아닌 경우 언어 지정
        if source_language != "auto":
            # Whisper 언어 코드 매핑
            lang_map = {
                "zh-cn": "zh",  # 중국어
                "vi": "vi",      # 베트남어
                "zh": "zh",
                "cn": "zh"
            }
            whisper_lang = lang_map.get(source_language.lower(), source_language)
            transcribe_params["language"] = whisper_lang
        
        segments, info = model.transcribe(temp_file_path, **transcribe_params)
        
        # 텍스트 수집
        original_text = ""
        for segment in segments:
            original_text += segment.text
        
        original_text = original_text.strip()
        detected_language = info.language
        
        logger.info(f"Detected language: {detected_language}, Text: {original_text}")
        
        # 번역: 원본 언어 → 한국어
        # 이미 한국어인 경우 번역 스킵
        if detected_language == "ko" or detected_language == "korean":
            translated_text = original_text
            logger.info("Already Korean, skipping translation")
        else:
            # 구글 번역 언어 코드 매핑
            translate_lang_map = {
                "zh": "zh-cn",
                "vi": "vi"
            }
            source_lang_code = translate_lang_map.get(detected_language, detected_language)
            translated_text = await translate_text(original_text, source_lang_code, "ko")
            logger.info(f"Translated to Korean: {translated_text}")
        
        return TranslationResponse(
            original_text=original_text,
            original_language=detected_language,
            translated_text=translated_text,
            target_language="ko"
        )
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")
        
    finally:
        # 임시 파일 삭제
        if temp_file and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.warning(f"Failed to delete temporary file: {e}")


# 텍스트 직접 번역 (디버깅용)
@app.post("/translate-text")
async def translate_text_endpoint(
    text: str,
    source_lang: str = "zh-cn",  # zh-cn (중국어), vi (베트남어)
    target_lang: str = "ko"
):
    """
    텍스트를 직접 번역
    
    Parameters:
    - text: 번역할 텍스트
    - source_lang: 원본 언어 코드
    - target_lang: 목표 언어 코드 (기본: ko)
    """
    
    try:
        translated = await translate_text(text, source_lang, target_lang)
        
        return {
            "original_text": text,
            "source_language": source_lang,
            "translated_text": translated,
            "target_language": target_lang
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8001)) 
    uvicorn.run(
        "translate:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
