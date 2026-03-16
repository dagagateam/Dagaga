import os
import re
import logging
from typing import List, Optional, Dict, Tuple

from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

try:
    from langchain_chroma import Chroma
except ImportError:
    from langchain_community.vectorstores import Chroma

from langchain_core.embeddings import Embeddings
import requests

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_vector_store: Optional[Chroma] = None
_initialized: bool = False

KOREAN_GUIDE_PDF = "Korean_guide.pdf"
CHROMA_DB_DIR = "./chroma_db"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150
TOP_K_RESULTS = 4

CHAPTER_RE = re.compile(r"(제\s*\d+\s*장\s*[^ \n\r\t]*[^\n\r]*)")
ARTICLE_RE = re.compile(r"(제\s*\d+\s*항(?:\s*\([^)]+\))?\s*[^\n\r]*)")  # 제5항(…)
MORE_RE = re.compile(r"(더\s*알아보기[^\n\r]*)")


PHENOMENON_PATTERNS = {
    "연음": {
        "tags": ["연음", "liaison", "음절경계"],
        "keywords": ["연음", "이어", "받침", "모음", "종성", "초성"],
        "triggers": ["받침+모음", "종성+초성 ㅇ"]
    },
    "된소리": {
        "tags": ["된소리되기", "경음화", "fortis"],
        "keywords": ["된소리", "경음화", "된소리되기", "경음"],
        "triggers": ["받침+ㄱㄷㅂㅅㅈ", "자음 뒤 경음"]
    },
    "비음화": {
        "tags": ["비음화", "nasalization"],
        "keywords": ["비음화", "비음", "ㄴ", "ㅁ"],
        "triggers": ["ㄱㄷㅂ+ㄴㅁ"]
    },
    "구개음화": {
        "tags": ["구개음화", "palatalization"],
        "keywords": ["구개음화", "디→지", "티→치", "ㄷ", "ㅌ"],
        "triggers": ["ㄷ/ㅌ+이", "디/티+모음 i계열"]
    },
    "유음화": {
        "tags": ["유음화", "lateralization"],
        "keywords": ["유음화", "ㄴ", "ㄹ"],
        "triggers": ["ㄴ+ㄹ", "ㄹ+ㄴ"]
    },
    "격음화": {
        "tags": ["격음화", "aspiration"],
        "keywords": ["격음화", "거센소리", "ㅎ"],
        "triggers": ["자음+ㅎ", "ㅎ+자음"]
    },
    "두음법칙": {
        "tags": ["두음법칙", "initial_sound_rule"],
        "keywords": ["두음", "두음법칙", "어두", "첫소리"],
        "triggers": ["어두 ㄹ", "어두 ㄴ + ㅣ계열"]
    },
    "ㅎ탈락": {
        "tags": ["ㅎ탈락", "h_deletion"],
        "keywords": ["ㅎ탈락", "탈락", "ㅎ"],
        "triggers": ["ㅎ+모음", "모음+ㅎ"]
    }
}


class GeminiEmbeddings(Embeddings):
    """
    Gemini (Example Proxy) 전용 임베딩 클래스
    Reference: https://api.example.io/apigateway/generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent
    """
    def __init__(self, api_key: str, model_name: str = "models/gemini-embedding-001"):
        self.api_key = api_key
        self.model_name = model_name
        base_url = os.getenv("GEMINI_EMBEDDING_API_URL")
        if not base_url:
            base_url = "https://api.example.io/apigateway/generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent"
        self.api_url = base_url

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_query(text) for text in texts]

    def embed_query(self, text: str) -> List[float]:
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key
        }
        
        # 스크린샷 Payload 형식 준수
        payload = {
            "model": self.model_name,
            "content": {
                "parts": [
                    {
                        "text": text
                    }
                ]
            }
        }

        try:
            resp = requests.post(self.api_url, headers=headers, json=payload, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            
            if "embedding" in data and "values" in data["embedding"]:
                return data["embedding"]["values"]
            else:
                raise ValueError(f"Unexpected response format: {data}")

        except Exception as e:
            logger.error(f"Gemini Embedding failed: {e}")
            raise


def _normalize_pdf_text(s: str) -> str:
    """PDF 추출 텍스트 정규화: 불필요한 공백/줄바꿈을 완만하게 정리"""
    # 너무 공격적으로 합치면 규정 구조가 무너질 수 있어서 '완만하게'만
    s = s.replace("\u00ad", "")  # soft hyphen
    s = re.sub(r"[ \t]+\n", "\n", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def _merge_pages_with_markers(pages: List[Document]) -> str:
    """페이지 넘어가는 항/예시가 끊기지 않게 전체를 합치되 PAGE 마커 삽입"""
    buf = []
    for p in pages:
        page_no = p.metadata.get("page", 0)
        text = _normalize_pdf_text(p.page_content or "")
        if not text:
            continue
        buf.append(f"\n\n[PAGE={page_no}]\n{text}")
    return "".join(buf).strip()


def _page_range_from_text(text: str) -> Tuple[int, int]:
    """chunk 텍스트에 포함된 PAGE 마커로 page 범위 추정"""
    pages = [int(x) for x in re.findall(r"\[PAGE=(\d+)\]", text)]
    if not pages:
        return (0, 0)
    return (min(pages), max(pages))


def _detect_phenomena(text: str) -> Tuple[List[str], List[str]]:
    tags, triggers = set(), set()
    lower = text.lower()
    for _, info in PHENOMENON_PATTERNS.items():
        hit = False
        for kw in info["keywords"]:
            if kw.lower() in lower:
                hit = True
                break
        if hit:
            for t in info["tags"]:
                tags.add(t)
            for tr in info["triggers"]:
                triggers.add(tr)
    return (sorted(tags), sorted(triggers))


def _split_by_regex_keep_titles(text: str, title_re: re.Pattern) -> List[Tuple[str, str]]:
    parts = title_re.split(text)
    out = []
    current_title = ""
    for part in parts:
        if not part:
            continue
        if title_re.match(part):
            current_title = part.strip()
        else:
            body = part.strip()
            if body:
                out.append((current_title, body))
    return out


def custom_chunk_korean_guide(pages: List[Document]) -> List[Document]:
    full_text = _merge_pages_with_markers(pages)

    # 장 단위 split
    chapter_blocks = _split_by_regex_keep_titles(full_text, CHAPTER_RE)
    if not chapter_blocks:
        chapter_blocks = [("", full_text)]

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP
    )

    chunks: List[Document] = []

    for chapter_title, chapter_body in chapter_blocks:
        # 2) '더 알아보기' 블록 먼저 분리 (개념 설명은 별도 chunk로 유지)
        more_blocks = _split_by_regex_keep_titles(chapter_body, MORE_RE)

        def handle_block(block_title: str, block_body: str, block_kind: str):
            # 3) 항 단위 split
            article_blocks = _split_by_regex_keep_titles(block_body, ARTICLE_RE)
            if not article_blocks:
                article_blocks = [("", block_body)]

            for article_title, article_body in article_blocks:
                # 너무 짧은 건 스킵
                if len(article_body) < 120:
                    continue

                tags, triggers = _detect_phenomena(article_title + "\n" + article_body)
                p0, p1 = _page_range_from_text(article_title + "\n" + article_body)

                base_meta = {
                    "chapter": chapter_title.strip(),
                    "article": article_title.strip(),
                    "kind": block_kind,  # "main" or "more"
                    "phenomenon_tags": ", ".join(tags) if tags else "",  # ChromaDB는 리스트 불가, 문자열로 변환
                    "trigger_patterns": ", ".join(triggers) if triggers else "",  # ChromaDB는 리스트 불가, 문자열로 변환
                    "page_start": p0,
                    "page_end": p1,
                    "source": KOREAN_GUIDE_PDF
                }

                # 4) 2차 splitter: 항이 너무 길면 쪼개되 메타 유지
                doc = Document(page_content=article_body.strip(), metadata=base_meta)
                if len(doc.page_content) > (CHUNK_SIZE * 2):
                    sub_docs = splitter.split_documents([doc])
                    chunks.extend(sub_docs)
                else:
                    chunks.append(doc)

        # more_blocks에는 ("더 알아보기...", body)와 ("", body) 섞여 있을 수 있음
        # "더 알아보기" 제목이 붙은 블록은 kind="more"로,
        # 나머지는 kind="main"로 처리
        for title, body in more_blocks:
            if title and "더" in title and "알아보기" in title:
                handle_block(title, body, "more")
            else:
                handle_block(title, body, "main")

    logger.info(f"✓ Created {len(chunks)} chunks (structured + length-controlled)")
    return chunks


def initialize_rag_system():
    global _vector_store, _initialized
    if _initialized:
        logger.info("RAG system already initialized")
        return

    logger.info("Initializing RAG system...")

    if not os.path.exists(KOREAN_GUIDE_PDF):
        raise FileNotFoundError(f"Korean guide PDF not found: {KOREAN_GUIDE_PDF}")

    google_api_key = os.getenv("GEMINI_API_KEY")
    if not google_api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")

    embeddings = GeminiEmbeddings(
        api_key=google_api_key,
        model_name="models/gemini-embedding-001"
    )

    # 임베딩 모델 변경 감지를 위한 마커 파일
    embedding_marker_file = os.path.join(CHROMA_DB_DIR, ".embedding_model")
    current_model_marker = "GeminiEmbeddings:gemini-embedding-001"
    
    # 기존 벡터 스토어가 있는지 확인
    needs_recreation = False
    if os.path.exists(CHROMA_DB_DIR):
        # 마커 파일 확인
        if os.path.exists(embedding_marker_file):
            with open(embedding_marker_file, 'r') as f:
                stored_marker = f.read().strip()
            if stored_marker != current_model_marker:
                logger.warning(f"Embedding model changed from '{stored_marker}' to '{current_model_marker}'")
                logger.warning("Recreating vector store with new embeddings...")
                needs_recreation = True
        else:
            # 마커 파일이 없으면 구 버전
            logger.warning("Old embedding model detected (no marker file)")
            logger.warning("Recreating vector store with Gemini embeddings...")
            needs_recreation = True
        
        if needs_recreation:
            import shutil
            shutil.rmtree(CHROMA_DB_DIR)
            logger.info("✓ Old vector store removed")
        else:
            logger.info("Loading existing vector store from disk...")
            _vector_store = Chroma(
                persist_directory=CHROMA_DB_DIR,
                embedding_function=embeddings
            )
            logger.info("✓ Vector store loaded")
            _initialized = True
            return

    logger.info("Creating new vector store...")
    loader = PyPDFLoader(KOREAN_GUIDE_PDF)
    pages = loader.load()
    logger.info(f"✓ Loaded {len(pages)} pages")

    logger.info("Splitting into structured chunks...")
    chunks = custom_chunk_korean_guide(pages)

    logger.info("Creating embeddings and vector store...")
    _vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DB_DIR
    )
    logger.info("✓ Vector store created and persisted")
    
    # 임베딩 모델 마커 저장
    with open(embedding_marker_file, 'w') as f:
        f.write(current_model_marker)
    logger.info(f"✓ Embedding model marker saved: {current_model_marker}")

    _initialized = True
    logger.info("✓ RAG system initialization complete")


def _build_queries(words: List[str]) -> List[str]:
    base = "한국어 표준 발음 규정 연음 된소리 비음화 구개음화 유음화 격음화 두음법칙 ㅎ탈락"
    queries = [f"{base} {w}" for w in words]
    # 전체 문맥 쿼리(한 번 더)
    queries.append(f"{base} " + " ".join(words))
    return queries


def get_relevant_pronunciation_rules(words: List[str]) -> Tuple[str, List[Dict]]:
    """
    단어들에 대한 관련 발음 규칙을 검색
    """
    global _vector_store
    if not _initialized or _vector_store is None:
        raise RuntimeError("RAG system not initialized. Call initialize_rag_system() first.")

    queries = _build_queries(words)

    # 여러 쿼리 결과를 합쳐 중복 제거
    seen = set()
    merged_docs: List[Document] = []

    for q in queries:
        results = _vector_store.similarity_search(q, k=TOP_K_RESULTS)
        for d in results:
            key = (d.metadata.get("chapter", ""), d.metadata.get("article", ""), d.page_content[:80])
            if key in seen:
                continue
            seen.add(key)
            merged_docs.append(d)

    merged_docs = merged_docs[: max(6, TOP_K_RESULTS * 2)]

    # 로깅: 검색된 문서 정보
    logger.info(f"Retrieved {len(merged_docs)} chunks")
    logger.info("검색된 발음 규칙 문서:")
    
    doc_metadata_list = []
    for i, d in enumerate(merged_docs, 1):
        chap = d.metadata.get("chapter", "")
        art = d.metadata.get("article", "")
        p0 = d.metadata.get("page_start", 0)
        p1 = d.metadata.get("page_end", 0)
        tags = d.metadata.get("phenomenon_tags", "")
        
        # 메타데이터 저장
        doc_metadata_list.append({
            "index": i,
            "chapter": chap,
            "article": art,
            "page_start": p0,
            "page_end": p1,
            "tags": tags
        })
        
        # 로그 출력
        logger.info(f"  [{i}] {chap}")
        if art:
            logger.info(f"      {art}")
        logger.info(f"      페이지: p{p0}-{p1} | 태그: {tags}")

    # 컨텍스트에 메타 요약을 같이 붙이면 LLM이 적용을 더 잘함
    blocks = []
    for d in merged_docs:
        chap = d.metadata.get("chapter", "")
        art = d.metadata.get("article", "")
        p0 = d.metadata.get("page_start", 0)
        p1 = d.metadata.get("page_end", 0)
        tags = d.metadata.get("phenomenon_tags", "")
        header = f"[{chap} | {art} | p{p0}-{p1} | tags: {tags}]"
        blocks.append(header + "\n" + d.page_content)

    context = "\n\n".join(blocks)
    return context, doc_metadata_list


def generate_pronunciation_with_rag(words: List[str], gemini_api_call_func) -> List[str]:
    """
    RAG 기반 발음 가이드 생성
    
    Parameters:
    - words: 발음 가이드를 생성할 단어 리스트
    - gemini_api_call_func: Gemini API 호출 함수 (rag_api.py의 call_gemini_api)
    
    Returns:
    - 발음 가이드 리스트 (각 단어에 대응)
    """
    global _vector_store, _initialized
    if not _initialized or _vector_store is None:
        raise RuntimeError("RAG system not initialized. Call initialize_rag_system() first.")
    
    # RAG로 관련 발음 규칙 검색
    context, doc_metadata = get_relevant_pronunciation_rules(words)
    logger.info(f"Retrieved context length: {len(context)} characters")
    
    # Gemini API로 발음 가이드 생성
    words_str = ", ".join(words)
    
    prompt = f"""한국어 발음 전문가입니다.
아래 {len(words)}개 단어를 실제 발음대로 한글로 표기하세요.

참고 발음 규칙:
{context[:2500]}

핵심 규칙:
• 연음: 집에→지베, 밥을→바블, 옷이→오시
• 비음화: 국물→궁물, 닫는→단는  
• 된소리: 학교→학꾜, 먹다→먹따

입력 ({len(words)}개):
{words_str}

**중요**: 
1. 위 {len(words)}개 단어 모두에 대해 발음을 생성하세요
2. 발음 변화가 없어도 모든 단어를 출력하세요
3. 쉼표로만 구분하고 설명은 절대 쓰지 마세요

출력 ({len(words)}개, 쉼표 구분):"""
    
    response = gemini_api_call_func(prompt)
    logger.info(f"Gemini raw response: {response}")
    
    # 응답 파싱 (개선된 로직)
    pronunciation_guide = []
    try:
        # 응답에서 "출력:" 이후 부분만 추출 (있다면)
        if "출력:" in response:
            response = response.split("출력:")[-1].strip()
        
        # 쉼표로 분리
        parts = [p.strip() for p in response.split(",")]
        
        for part in parts:
            if not part:
                continue
            
            # 콜론이 있으면 콜론 뒤만 사용 (단어:발음 형식 대응)
            if ":" in part:
                part = part.split(":", 1)[1].strip()
            
            # 대괄호, 따옴표 등 제거
            part = part.strip("[]\"'「」『』")
            
            # 공백 제거
            part = part.strip()
            
            if part:
                pronunciation_guide.append(part)
        
        logger.info(f"Parsed pronunciation guide: {pronunciation_guide}")
        
        # 파싱 결과가 입력 단어 수와 다르면 경고
        if len(pronunciation_guide) != len(words):
            logger.warning(f"Pronunciation count mismatch: expected {len(words)}, got {len(pronunciation_guide)}")
            
    except Exception as e:
        logger.error(f"Failed to parse pronunciation guide: {e}")
        import traceback
        traceback.print_exc()
        # 파싱 실패 시 원본 단어 반환
        pronunciation_guide = words
    
    # 길이 맞추기
    while len(pronunciation_guide) < len(words):
        pronunciation_guide.append(words[len(pronunciation_guide)])
    
    # 초과분 제거
    pronunciation_guide = pronunciation_guide[:len(words)]
    
    return pronunciation_guide, doc_metadata


# 테스트
if __name__ == "__main__":
    print("Testing RAG Pronunciation System...")
    initialize_rag_system()

    test_words = ["학교에서", "어떻게", "국물", "46"]
    ctx = get_relevant_pronunciation_rules(test_words)

    print("\n[Retrieved Context Preview]\n")
    print(ctx[:1200])
    print("\n✓ Done")