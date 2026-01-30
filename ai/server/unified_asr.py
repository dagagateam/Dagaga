import os
import tempfile
import logging
from pathlib import Path
from typing import Optional
import torch

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from deep_translator import GoogleTranslator
from gtts import gTTS
import io

# PEFT 및 Transformers
from transformers import (
    WhisperForConditionalGeneration,
    WhisperProcessor,
    pipeline
)
from peft import PeftModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Unified ASR & Translation API",
    description="통합 음성 인식 및 번역 서비스 (ASR + Translation), LoRA Finetuned",
    version="2.1.1"
)
# 환경 변수 로드
BASE_MODEL_NAME = os.getenv("WHISPER_MODEL_SIZE", "openai/whisper-small")
if not "/" in BASE_MODEL_NAME:
    BASE_MODEL_NAME = f"openai/whisper-{BASE_MODEL_NAME}"

LORA_WEIGHTS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "finetuned")

# 기기 설정
_default_device = "cuda" if torch.cuda.is_available() else "cpu"
DEVICE = os.getenv("WHISPER_DEVICE", _default_device)

_default_dtype = "float16" if DEVICE == "cuda" else "float32"
COMPUTE_TYPE_STR = os.getenv("WHISPER_COMPUTE_TYPE", _default_dtype)

if COMPUTE_TYPE_STR == "float16":
    TORCH_DTYPE = torch.float16
elif COMPUTE_TYPE_STR == "float32":
    TORCH_DTYPE = torch.float32
else:
    TORCH_DTYPE = torch.float32 # fallback

logger.info(f"Configuration: Model={BASE_MODEL_NAME}, Device={DEVICE}, Dtype={TORCH_DTYPE}")

asr_pipeline = None

# 응답 스키마
class TranscriptionResponse(BaseModel):
    """ASR 응답 모델"""
    text: str
    language: str
    segments: list
    raw_output: str


class TranslationResponse(BaseModel):
    """번역 응답 모델"""
    original_text: str
    original_language: str
    translated_text: str
    target_language: str


class PronunciationScores(BaseModel):
    """발음 평가 점수"""
    accuracy: float
    pronunciation: float
    fluency: float
    overall: float


class PronunciationEvaluationResponse(BaseModel):
    """발음 평가 응답 모델"""
    transcribed_text: str
    expected_text: str
    scores: PronunciationScores
    feedback: str
    is_pass: bool
    language: str

# 모델 초기화단
def get_asr_pipeline():
    global asr_pipeline

    if asr_pipeline is None:
        logger.info(f"Loading Whisper model: Base={BASE_MODEL_NAME}, LoRA={LORA_WEIGHTS_PATH} on {DEVICE}")
        try:
            # 베이스 모델 로드
            model = WhisperForConditionalGeneration.from_pretrained(
                BASE_MODEL_NAME,
                torch_dtype=TORCH_DTYPE,
                low_cpu_mem_usage=True
            )
            
            # LoRA 어댑터 로드
            if os.path.exists(LORA_WEIGHTS_PATH):
                logger.info(f"로라 가중치 찾음 {LORA_WEIGHTS_PATH}, 로라 적용중....")
                model = PeftModel.from_pretrained(model, LORA_WEIGHTS_PATH)
                model.merge_and_unload() 
            else:
                logger.warning(f"로라 가중치 로드 실패 : {LORA_WEIGHTS_PATH}, 베이스 모델 사용")

            model.to(DEVICE)

            # Processor 로드
            processor = WhisperProcessor.from_pretrained(BASE_MODEL_NAME)

            # 파이프라인 생성
            
            pipeline_device = -1
            if "cuda" in DEVICE:
                if ":" in DEVICE:
                    try:
                        pipeline_device = int(DEVICE.split(":")[-1])
                    except:
                        pipeline_device = 0
                else:
                    pipeline_device = 0

            asr_pipeline = pipeline(
                "automatic-speech-recognition",
                model=model,
                tokenizer=processor.tokenizer,
                feature_extractor=processor.feature_extractor,
                device=pipeline_device,
                torch_dtype=TORCH_DTYPE
            )
            
            logger.info("✓ Whisper LoRA model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Model loading failed: {str(e)}"
            )

    return asr_pipeline

"구글 번역"
async def translate_text(text: str, source_lang: str, target_lang: str = "ko") -> str:
    try:
        # deep-translator 언어 코드 매핑
        lang_map = {
            "zh-cn": "zh-CN",
            "zh": "zh-CN",
            "cn": "zh-CN",
            "vi": "vi",
            "ko": "ko",
            "en": "en",
            "ja": "ja"
        }
        
        source = lang_map.get(source_lang.lower(), source_lang)
        target = lang_map.get(target_lang.lower(), target_lang)
        
        # deep-translator 사용 (동기 방식)
        translator = GoogleTranslator(source=source, target=target)
        result = translator.translate(text)
        return result
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(e)}"
        )


# Startup
@app.on_event("startup")
async def startup_event():
    """서버 시작 시 모델 미리 로드"""
    logger.info("Starting Unified ASR & Translation API (LoRA Enabled)...")
    try:
        get_asr_pipeline()
        logger.info("API ready to serve requests")
    except Exception as e:
        logger.error(f"Startup failed: {e}")


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "service": "Unified ASR & Translation API (LoRA)",
        "version": "2.1.1",
        "status": "running",
        "endpoints": {
            "asr": "/api/v1/asr/transcribe",
            "shadowing": "/api/v1/asr/transcribe/word",
            "pronunciation_evaluation": "/api/v1/asr/evaluate/pronunciation",
            "translation": "/api/v1/translate/audio",
            "text_translation": "/api/v1/translate/text",
            "tts": "/api/v1/tts/synthesize"
        }
    }


@app.get("/health")
async def health_check():
    """헬스 체크"""
    model_loaded = asr_pipeline is not None
    return {
        "status": "healthy" if model_loaded else "initializing",
        "model_loaded": model_loaded,
        "base_model": BASE_MODEL_NAME,
        "lora_path": LORA_WEIGHTS_PATH,
        "device": DEVICE,
        "dtype": str(TORCH_DTYPE)
    }


# 한국어 음성 인식(ASR)

@app.post("/api/v1/asr/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = "ko",
    beam_size: int = 5,
    vad_filter: bool = True,
    temperature: float = 0.0
):
    """
    한국어 음성 인식 (ASR) - LoRA Model
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    pipe = get_asr_pipeline()
    temp_file = None

    try:
        # 음성 파일 임시 저장
        audio_data = await file.read()
        file_extension = Path(file.filename).suffix or ".wav"

        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name

        logger.info(f"Processing: {file.filename} ({len(audio_data)} bytes)")

        # Whisper 음성 인식 실행 (HuggingFace Pipeline)
        result = pipe(
            temp_file_path,
            generate_kwargs={"language": language, "task": "transcribe"},
            return_timestamps="word",
            chunk_length_s=30,
            batch_size=1
        )
        
        # 반환 값 구성{'text': ' contents...', 'chunks': [{'text': ' word', 'timestamp': (start, end)}, ...]}
        
        full_text = result.get("text", "").strip()
        chunks = result.get("chunks", [])

        # 결과 변환
        word_list = []
        for chunk in chunks:
            ts = chunk.get("timestamp")
            start, end = (0.0, 0.0)
            if isinstance(ts, tuple) or isinstance(ts, list):
                start, end = ts
            
            word_obj = {
                "word": chunk["text"].strip(),
                "start": start,
                "end": end,
                "probability": 1.0 
            }
            word_list.append(word_obj)

        segment_list = [{
            "start": word_list[0]["start"] if word_list else 0.0,
            "end": word_list[-1]["end"] if word_list else 0.0,
            "text": full_text,
            "words": word_list
        }]

        logger.info(f"✓ Transcription completed: {full_text}")

        return TranscriptionResponse(
            text=full_text,
            language=language,
            segments=segment_list,
            raw_output=full_text
        )

    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        )

    finally:
        # 임시 파일 삭제
        if temp_file and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.warning(f"Failed to delete temporary file: {e}")


@app.post("/api/v1/asr/transcribe/word")
async def transcribe_word(
    file: UploadFile = File(...),
    expected_word: Optional[str] = None,
    language: str = "ko"
):
    """
    단어 단위 섀도잉 분석용 음성 인식
    """
    # 메인 transcribe 재사용
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
        "note": "발음 분석용 출력입니다. (Transformers/Peft Backend)"
    }

    # 기대 단어와 비교
    if expected_word and result.text.strip() != expected_word.strip():
        response["warning"] = "인식된 텍스트가 기대 단어와 다릅니다. 발음 오류 가능성이 있습니다."

    return JSONResponse(content=response)


@app.post("/api/v1/asr/evaluate/pronunciation", response_model=PronunciationEvaluationResponse)
async def evaluate_pronunciation(
    file: UploadFile = File(...),
    expected_text: str = Form(...),
    retry_count: int = Form(0),
    language: str = Form("ko")
):
    """
    발음 평가 API (섀도잉용)
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if not expected_text:
        raise HTTPException(status_code=400, detail="expected_text is required")

    pipe = get_asr_pipeline()
    temp_file = None

    try:
        # 1. 음성 파일 임시 저장
        audio_data = await file.read()
        file_extension = Path(file.filename).suffix or ".wav"

        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name

        logger.info(f"Evaluating pronunciation: expected='{expected_text}'")

        # 2. Whisper 음성 인식 실행
        result = pipe(
            temp_file_path,
            generate_kwargs={"language": language, "task": "transcribe"},
            return_timestamps="word",
             chunk_length_s=30,
            batch_size=1
        )
        
        full_text = result.get("text", "").strip()
        logger.info(f"Transcribed: '{full_text}'")

        # 4. 점수 계산
        expected_normalized = expected_text.strip().replace(" ", "")
        transcribed_normalized = full_text.replace(" ", "")

        # 정확도: 문자 단위 일치도 (Levenshtein 유사도)
        from difflib import SequenceMatcher
        accuracy = SequenceMatcher(None, expected_normalized, transcribed_normalized).ratio() * 100

        # 발음 점수: 정확도와 동일하게 설정 (간소화)
        pronunciation = accuracy
        fluency = accuracy
        overall = accuracy

        # 5. Pass/Fail 판정
        if retry_count >= 5:
            is_pass = True
            pass_reason = "retry_limit"
        elif accuracy >= 80.0:
            is_pass = True
            pass_reason = "accuracy"
        else:
            is_pass = False
            pass_reason = None

        # 6. 피드백 생성
        if retry_count >= 5:
            feedback = "5번 이상 시도하셨습니다. 다음 단계로 넘어갑니다. 계속 연습하세요!"
        elif accuracy >= 90:
            feedback = "훌륭합니다! 발음이 매우 정확합니다."
        elif accuracy >= 80:
            feedback = "좋습니다! 발음이 정확하여 합격입니다."
        else:
            feedback = f"발음을 조금 더 명확하게 해보세요. (정확도: {accuracy:.1f}%)"

        if expected_normalized != transcribed_normalized and accuracy < 80:
            feedback += f" 인식: '{full_text}' / 예상: '{expected_text}'"

        logger.info(f"Evaluation complete - Accuracy: {accuracy:.1f}%, Retry: {retry_count}, Pass: {is_pass}")

        scores = PronunciationScores(
            accuracy=round(accuracy, 2),
            pronunciation=round(pronunciation, 2),
            fluency=round(fluency, 2),
            overall=round(overall, 2)
        )

        return PronunciationEvaluationResponse(
            transcribed_text=full_text,
            expected_text=expected_text,
            scores=scores,
            feedback=feedback,
            is_pass=is_pass,
            language=language
        )

    except Exception as e:
        logger.error(f"Pronunciation evaluation error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Pronunciation evaluation failed: {str(e)}"
        )

    finally:
        if temp_file and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.warning(f"Failed to delete temporary file: {e}")


@app.post("/api/v1/tts/synthesize")
async def synthesize_speech(
    text: str = Form(...),
    language: str = Form("ko")
):
    """
    텍스트를 음성으로 변환 (TTS)
    """
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    try:
        logger.info(f"TTS request - text: '{text}', language: {language}")

        # gTTS를 사용하여 텍스트를 음성으로 변환
        tts = gTTS(text=text, lang=language, slow=False)

        # 메모리 버퍼에 저장
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)

        logger.info(f"✓ TTS synthesis completed for: '{text}'")

        # 음성 파일 스트리밍 응답
        return StreamingResponse(
            audio_buffer,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename=tts_{language}.mp3"
            }
        )

    except Exception as e:
        logger.error(f"TTS synthesis error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"TTS synthesis failed: {str(e)}"
        )


# 외국어 음성 → 한국어 번역
@app.post("/api/v1/translate/audio", response_model=TranslationResponse)
async def translate_audio(
    file: UploadFile = File(...),
    source_language: str = "auto"
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    pipe = get_asr_pipeline()
    temp_file = None

    try:
        # 1. 음성 파일 저장
        audio_data = await file.read()
        file_extension = Path(file.filename).suffix or ".wav"

        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name

        logger.info(f"Processing for translation: {file.filename} ({len(audio_data)} bytes)")

        # 2. ASR: 음성 → 원본 언어 텍스트
        generate_kwargs = {"task": "transcribe"}
        
        if source_language != "auto":
            lang_map = {
                "zh-cn": "zh",
                "zh": "zh",
                "cn": "zh",
                "vi": "vi"
            }
            whisper_lang = lang_map.get(source_language.lower(), source_language)
            generate_kwargs["language"] = whisper_lang

        result = pipe(
            temp_file_path,
            generate_kwargs=generate_kwargs,
            return_timestamps=True,
            chunk_length_s=30,
            batch_size=1
        )

        original_text = result.get("text", "").strip()
        detected_language = source_language if source_language != "auto" else "unknown"

        logger.info(f"Text: {original_text}")

        # 번역: 원본 언어 에서 한국어
        
        translate_source_lang = "auto"
        if detected_language != "unknown":
             translate_lang_map = {
                "zh": "zh-cn",
                "vi": "vi"
            }
             translate_source_lang = translate_lang_map.get(detected_language, detected_language)

        translated_text = await translate_text(
            original_text,
            translate_source_lang,
            "ko"
        )
        logger.info(f"✓ Translated to Korean: {translated_text}")

        return TranslationResponse(
            original_text=original_text,
            original_language=detected_language,
            translated_text=translated_text,
            target_language="ko"
        )

    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(e)}"
        )

    finally:
        if temp_file and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.warning(f"Failed to delete temporary file: {e}")


@app.post("/api/v1/translate/text")
async def translate_text_endpoint(
    text: str,
    source_lang: str = "zh-cn",
    target_lang: str = "ko"
):
    """
    텍스트 직접 번역
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

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "unified_asr:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
