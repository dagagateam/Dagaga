import os
import tempfile
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from faster_whisper import WhisperModel
from deep_translator import GoogleTranslator
from gtts import gTTS
import io

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Unified ASR & Translation API",
    description="통합 음성 인식 및 번역 서비스 (ASR + Translation)",
    version="2.0.0"
)

MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")
DEVICE = os.getenv("WHISPER_DEVICE", "cuda")
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "float16")

whisper_model: Optional[WhisperModel] = None


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

# 모데 초기화단

def get_whisper_model() -> WhisperModel:
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
            logger.info("✓ Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Model loading failed: {str(e)}"
            )

    return whisper_model

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
    logger.info("Starting Unified ASR & Translation API...")
    try:
        get_whisper_model()
        logger.info("API ready to serve requests")
    except Exception as e:
        logger.error(f"Startup failed: {e}")


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "service": "Unified ASR & Translation API",
        "version": "2.0.0",
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
    model_loaded = whisper_model is not None
    return {
        "status": "healthy" if model_loaded else "initializing",
        "model_loaded": model_loaded,
        "model_size": MODEL_SIZE,
        "device": DEVICE,
        "compute_type": COMPUTE_TYPE
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
    한국어 음성 인식 (ASR)

    Parameters:
    - file: 음성 파일 (wav, mp3, m4a 등)
    - language: 언어 코드 (기본: ko)
    - beam_size: 빔 서치 크기 (기본: 5)
    - vad_filter: VAD 필터 사용 여부 (기본: True)
    - temperature: 샘플링 온도 (기본: 0.0)

    Returns:
    - TranscriptionResponse: 인식된 텍스트 및 세그먼트 정보
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    model = get_whisper_model()
    temp_file = None

    try:
        # 음성 파일 임시 저장
        audio_data = await file.read()
        file_extension = Path(file.filename).suffix or ".wav"

        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name

        logger.info(f"Processing: {file.filename} ({len(audio_data)} bytes)")

        # Whisper 음성 인식 실행
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

            # 단어 단위 타임스탬프 추가
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

        logger.info(f"✓ Transcription completed: {full_text}")

        return TranscriptionResponse(
            text=full_text.strip(),
            language=info.language,
            segments=segment_list,
            raw_output=full_text.strip()
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

    Parameters:
    - file: 음성 파일
    - expected_word: 기대하는 단어 (옵션)
    - language: 언어 코드 (기본: ko)

    Returns:
    - 인식된 텍스트, 단어 단위 정보, 기대 단어와의 비교
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
        "note": "발음 분석용 출력입니다. 음소 단위 비교는 G2P를 사용하세요."
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

    Parameters:
    - file: 음성 파일
    - expected_text: 기대하는 텍스트 (예: "제 장점은")
    - retry_count: 현재 시도 횟수 (기본: 0)
    - language: 언어 코드 (기본: ko)

    Pass 조건:
    - 정확도 >= 80%
    - retry_count >= 5 (5번 이상 시도 시 자동 합격)

    Returns:
    - PronunciationEvaluationResponse: 인식된 텍스트, 점수, 피드백, 합격 여부
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if not expected_text:
        raise HTTPException(status_code=400, detail="expected_text is required")

    model = get_whisper_model()
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
        segments, info = model.transcribe(
            temp_file_path,
            language=language,
            beam_size=5,
            vad_filter=True,
            temperature=0.0,
            word_timestamps=True,
            condition_on_previous_text=False,
        )

        # 3. 인식된 텍스트 수집
        transcribed_text = ""
        for segment in segments:
            transcribed_text += segment.text
        transcribed_text = transcribed_text.strip()

        logger.info(f"Transcribed: '{transcribed_text}'")

        # 4. 점수 계산
        expected_normalized = expected_text.strip().replace(" ", "")
        transcribed_normalized = transcribed_text.replace(" ", "")

        # 정확도: 문자 단위 일치도 (Levenshtein 유사도)
        from difflib import SequenceMatcher
        accuracy = SequenceMatcher(None, expected_normalized, transcribed_normalized).ratio() * 100

        # 발음 점수: 정확도와 동일하게 설정 (간소화)
        pronunciation = accuracy
        fluency = accuracy
        overall = accuracy

        # 5. Pass/Fail 판정
        # 조건 1: 정확도 80% 이상
        # 조건 2: 5번 이상 시도했다면 자동 합격
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

        # 텍스트 불일치 시 추가 피드백
        if expected_normalized != transcribed_normalized and accuracy < 80:
            feedback += f" 인식: '{transcribed_text}' / 예상: '{expected_text}'"

        logger.info(f"Evaluation complete - Accuracy: {accuracy:.1f}%, Retry: {retry_count}, Pass: {is_pass} ({pass_reason if is_pass else 'failed'})")

        # 7. 응답 생성
        scores = PronunciationScores(
            accuracy=round(accuracy, 2),
            pronunciation=round(pronunciation, 2),
            fluency=round(fluency, 2),
            overall=round(overall, 2)
        )

        return PronunciationEvaluationResponse(
            transcribed_text=transcribed_text,
            expected_text=expected_text,
            scores=scores,
            feedback=feedback,
            is_pass=is_pass,
            language=info.language
        )

    except Exception as e:
        logger.error(f"Pronunciation evaluation error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Pronunciation evaluation failed: {str(e)}"
        )

    finally:
        # 임시 파일 삭제
        if temp_file and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.warning(f"Failed to delete temporary file: {e}")


# TTS (Text-to-Speech) Endpoints

@app.post("/api/v1/tts/synthesize")
async def synthesize_speech(
    text: str = Form(...),
    language: str = Form("ko")
):
    """
    텍스트를 음성으로 변환 (TTS)

    Parameters:
    - text: 음성으로 변환할 텍스트
    - language: 언어 코드 (기본: ko, 한국어)

    Returns:
    - 음성 파일 (audio/mpeg)
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

    model = get_whisper_model()
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
        transcribe_params = {
            "beam_size": 5,
            "vad_filter": True,
            "temperature": 0.0,
            "condition_on_previous_text": False,
        }

        # 언어 지정 (자동 감지가 아닌 경우)
        if source_language != "auto":
            lang_map = {
                "zh-cn": "zh",
                "zh": "zh",
                "cn": "zh",
                "vi": "vi"
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

        logger.info(f"Detected: {detected_language}, Text: {original_text}")

        # 3. 번역: 원본 언어 → 한국어
        if detected_language in ["ko", "korean"]:
            # 이미 한국어인 경우 번역 스킵
            translated_text = original_text
            logger.info("Already Korean, skipping translation")
        else:
            # 구글 번역 언어 코드 매핑
            translate_lang_map = {
                "zh": "zh-cn",
                "vi": "vi"
            }
            source_lang_code = translate_lang_map.get(
                detected_language,
                detected_language
            )
            translated_text = await translate_text(
                original_text,
                source_lang_code,
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
        # 임시 파일 삭제
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
    텍스트 직접 번역 (디버깅 및 테스트용)

    Parameters:
    - text: 번역할 텍스트
    - source_lang: 원본 언어 코드 (zh-cn, vi 등)
    - target_lang: 목표 언어 코드 (기본: ko)

    Returns:
    - 원본 텍스트 및 번역된 텍스트
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


# Main Entry Point

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
