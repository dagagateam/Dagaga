#!/bin/bash

# Danuri 크롤러 실행 스크립트
# 사용법: ./run.sh [local|cloud]

MODE=${1:-local}

# 프로젝트 루트 디렉토리로 이동
cd "$(dirname "$0")"

# .env 파일 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일이 없습니다. .env.example을 복사하여 .env를 생성하세요."
    echo "   cp .env.example .env"
    exit 1
fi

# STORAGE_MODE 설정
if [ "$MODE" = "cloud" ]; then
    echo "☁️  Cloud 모드로 실행합니다..."
    export STORAGE_MODE=cloud
else
    echo "💾 Local 모드로 실행합니다..."
    export STORAGE_MODE=local
fi

# Python 경로 설정 및 실행
export PYTHONPATH=$(pwd)
python -m src.main

echo ""
echo "✅ 크롤링 완료!"

# 결과 확인
if [ "$MODE" = "local" ]; then
    echo ""
    echo "📊 수집 결과:"
    echo "   - JSON 파일: data/programs.json"
    echo "   - 이미지 개수: $(ls -1 data/images/ 2>/dev/null | wc -l | tr -d ' ')"
fi
