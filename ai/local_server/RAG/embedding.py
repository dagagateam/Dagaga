#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv

load_dotenv()

# 색상 출력용
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.RESET}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.RESET}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.RESET}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.RESET}")

def test_rag_system():
    """RAG 시스템 전체 테스트"""
    print("\n" + "="*60)
    print("ChromaDB + Gemini Embedding 테스트 시작")
    print("="*60 + "\n")
    
    print_info("1. 환경 변수 확인 중...")
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        print_error("GEMINI_API_KEY가 설정되지 않았습니다")
        return False
    print_success(f"GEMINI_API_KEY 확인됨 (길이: {len(gemini_api_key)})")
    
    # ChromaDB 디렉토리 확인
    print_info("\n2. ChromaDB 디렉토리 확인 중...")
    chroma_dir = "./chroma_db"
    if os.path.exists(chroma_dir):
        print_success(f"ChromaDB 디렉토리 존재: {chroma_dir}")
        marker_file = os.path.join(chroma_dir, ".embedding_model")
        if os.path.exists(marker_file):
            with open(marker_file, 'r') as f:
                model_marker = f.read().strip()
            print_success(f"임베딩 모델 마커: {model_marker}")
        else:
            print_warning("임베딩 모델 마커 파일이 없습니다")
    else:
        print_warning(f"ChromaDB 디렉토리가 없습니다. 초기화가 필요합니다.")
    
    # RAG 시스템 초기화
    print_info("\n3. RAG 시스템 초기화 중...")
    try:
        from rag_pronunciation import initialize_rag_system
        initialize_rag_system()
        print_success("RAG 시스템 초기화 완료")
    except Exception as e:
        print_error(f"RAG 시스템 초기화 실패: {e}")
        return False
    
    #"검색 기능 테스트"
    print_info("\n4. 검색 기능 테스트 중...")
    test_cases = [
        (["학교에서"], "연음 규칙"),
        (["국물"], "비음화"),
        (["같이"], "격음화"),
        (["받침", "모음"], "연음"),
    ]
    
    from rag_pronunciation import get_relevant_pronunciation_rules
    
    for words, expected_topic in test_cases:
        print(f"\n  테스트: {words} (기대: {expected_topic} 관련)")
        try:
            context = get_relevant_pronunciation_rules(words)
            if context and len(context) > 0:
                print_success(f"검색 성공 (컨텍스트 길이: {len(context)} chars)")
                preview = context[:200].replace('\n', ' ')
                print(f"    미리보기: {preview}...")
            else:
                print_error("검색 결과가 비어있습니다")
                return False
        except Exception as e:
            print_error(f"검색 실패: {e}")
            return False
    
    #메타 데이터 확인
    print_info("\n5. 벡터 스토어 메타데이터 확인 중...")
    try:
        from rag_pronunciation import _vector_store
        if _vector_store:
            # 샘플 검색으로 메타데이터 확인
            results = _vector_store.similarity_search("연음", k=1)
            if results:
                sample_doc = results[0]
                print_success("메타데이터 샘플:")
                for key, value in sample_doc.metadata.items():
                    print(f"    - {key}: {value}")
            else:
                print_warning("검색 결과가 없어 메타데이터를 확인할 수 없습니다")
        else:
            print_error("벡터 스토어가 초기화되지 않았습니다")
            return False
    except Exception as e:
        print_error(f"메타데이터 확인 실패: {e}")
        return False
    
    return True

def main():
    """메인 함수"""
    try:
        success = test_rag_system()
        
        print("\n" + "="*60)
        if success:
            print_success("모든 테스트 통과! 🎉")
            print_info("RAG 시스템이 정상적으로 작동합니다.")
        else:
            print_error("일부 테스트 실패")
            print_info("위의 에러 메시지를 확인하세요.")
            sys.exit(1)
        print("="*60 + "\n")
        
    except KeyboardInterrupt:
        print_warning("\n테스트가 중단되었습니다")
        sys.exit(1)
    except Exception as e:
        print_error(f"예상치 못한 에러: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
