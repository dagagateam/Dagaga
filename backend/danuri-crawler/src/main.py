import requests
from bs4 import BeautifulSoup
import re
from config.settings import LIST_URL, STORAGE_MODE
from src.parser import parse_detail
from src.storage import save_images, save_json_data, load_json_data

# Cloud 모드일 때만 database import
if STORAGE_MODE == 'cloud':
    from src.database import init_db, get_existing_article_seqs, save_to_db


def run():
    if STORAGE_MODE == 'cloud':
        # Cloud 모드: RDS에서 기존 데이터 로드
        print("Cloud 모드로 실행 중...")
        init_db()
        existing_seqs = get_existing_article_seqs()
        all_data = []
    else:
        # Local 모드: JSON 파일에서 기존 데이터 로드
        print("Local 모드로 실행 중...")
        all_data = load_json_data()
        existing_seqs = {item['article_seq'] for item in all_data}

    print("크롤링 시작...")
    for page in range(1, 11):
        print(f"Page {page} 처리 중...")
        try:
            res = requests.get(LIST_URL, params={
                               'cpage': page, 'rows': 10}, timeout=10)
            res.raise_for_status()
        except requests.RequestException as exc:
            print(f"페이지 {page} 요청 실패: {exc}")
            continue

        soup = BeautifulSoup(res.text, 'html.parser')

        # 게시글 고유번호 추출
        links = soup.select('a[href*="article_seq"]')
        for link in links:
            match = re.search(r'article_seq=(\d+)', link.get('href'))
            if not match:
                continue

            seq = int(match.group(1))
            if seq in existing_seqs:
                continue

            # 파싱 및 저장
            p_data = parse_detail(seq)
            if p_data:
                # 이미지 저장 (로컬 또는 S3)
                image_urls = save_images(p_data.pop('img_srcs'), seq)

                if STORAGE_MODE == 'cloud':
                    # Cloud 모드: RDS에 저장
                    p_data['image_urls'] = image_urls
                    if save_to_db(p_data):
                        existing_seqs.add(seq)
                        print(f"✓ DB 저장 완료: {p_data['title']}")
                    else:
                        print(f"✗ DB 저장 실패: {p_data['title']}")
                else:
                    # Local 모드: JSON 파일에 저장
                    p_data['local_images'] = image_urls
                    all_data.append(p_data)
                    existing_seqs.add(seq)
                    print(f"✓ 추가됨: {p_data['title']}")

        # Local 모드일 때만 페이지 단위로 JSON 저장
        if STORAGE_MODE == 'local':
            save_json_data(all_data)

    print(f"\n크롤링 완료! 총 {len(existing_seqs)}개의 프로그램 데이터")


if __name__ == "__main__":
    run()
