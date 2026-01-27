import os
import tempfile
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from faster_whisper import WhisperModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ASR API for Pronunciation Assessment",
    description="Whisper-based ASR for pronunciation signal extraction",
    version="1.0.0"
)

MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")  
DEVICE = os.getenv("WHISPER_DEVICE", "cuda")  
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "float16")  

whisper_model: Optional[WhisperModel] = None


class TranscriptionResponse(BaseModel):
    text: str
    language: str
    segments: list
    raw_output: str  


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


# 서버 시작 시 모델 미리 로드
@app.on_event("startup")
async def startup_event():
    logger.info("Starting ASR API...")
    try:
        get_model()
        logger.info("ASR API ready")
    except Exception as e:
        logger.error(f"Startup failed: {e}")


# 기본 엔드포인트
@app.get("/")
async def root():
    return {
        "status": "running",
        "model_size": MODEL_SIZE,
        "device": DEVICE,
        "message": "ASR API for Pronunciation Assessment"
    }


# 헬스 체크
@app.get("/health")
async def health_check():
    model_loaded = whisper_model is not None
    return {
        "status": "healthy" if model_loaded else "initializing",
        "model_loaded": model_loaded,
        "model_size": MODEL_SIZE,
        "device": DEVICE,
        "compute_type": COMPUTE_TYPE
    }


# 음성 파일을 텍스트로 변환 (메인 엔드포인트)
@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = "ko",
    beam_size: int = 5,
    vad_filter: bool = True,
    temperature: float = 0.0
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    model = get_model()
    
    temp_file = None
    try:
        audio_data = await file.read()
        
        file_extension = Path(file.filename).suffix or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name
        
        logger.info(f"Processing audio file: {file.filename} ({len(audio_data)} bytes)")
        
        # 음성 인식 실행
        segments, info = model.transcribe(
            temp_file_path,
            language=language,
            beam_size=beam_size,
            vad_filter=vad_filter,
            temperature=temperature,
            word_timestamps=True,
            condition_on_previous_text=False,
        )
        
        # 결과 수집
        segment_list = []
        full_text = ""
        
        for segment in segments:
            segment_dict = {
                "start": segment.start,
                "end": segment.end,
                "text": segment.text,
                "words": []
            }
            
            if hasattr(segment, 'words') and segment.words:
                for word in segment.words:
                    segment_dict["words"].append({
                        "word": word.word,
                        "start": word.start,
                        "end": word.end,
                        "probability": word.probability
                    })
            
            segment_list.append(segment_dict)
            full_text += segment.text
        
        logger.info(f"Transcription completed: {full_text}")
        
        return TranscriptionResponse(
            text=full_text.strip(),
            language=info.language,
            segments=segment_list,
            raw_output=full_text.strip()
        )
        
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
        
    finally:
        if temp_file and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.warning(f"Failed to delete temporary file: {e}")


# 단어 단위 섀도잉용 엔드포인트
@app.post("/transcribe-word")
async def transcribe_word(
    file: UploadFile = File(...),
    expected_word: Optional[str] = None,
    language: str = "ko"
):
    # 메인 transcribe 사용
    result = await transcribe_audio(
        file=file,
        language=language,
        beam_size=5,
        vad_filter=True,
        temperature=0.0
    )
    
    # 단어 레벨 정보 추출
    words = []
    for segment in result.segments:
        if "words" in segment:
            words.extend(segment["words"])
    
    response = {
        "transcribed_text": result.text.strip(),
        "expected_word": expected_word,
        "words": words,
        "language": result.language,
        "note": "발음 분석용 출력입니다. 음소 단위 비교는 G2P를 사용하세요."
    }
    
    # 기대 단어와 다른 경우 경고 추가
    if expected_word and result.text.strip() != expected_word.strip():
        response["warning"] = "인식된 텍스트가 기대 단어와 다릅니다. 발음 오류 가능성이 있습니다."
    
    return JSONResponse(content=response)


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "asr:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
