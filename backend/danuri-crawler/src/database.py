import psycopg2
from psycopg2.extras import execute_values
from config.settings import (
    STORAGE_MODE, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
)


def get_db_connection():
    """PostgreSQL 데이터베이스 연결"""
    if STORAGE_MODE != 'cloud':
        return None

    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        return conn
    except Exception as e:
        print(f"데이터베이스 연결 실패: {e}")
        return None


def get_existing_article_seqs():
    """데이터베이스에서 기존 article_seq 목록 가져오기"""
    conn = get_db_connection()
    if not conn:
        return set()

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT article_seq FROM programs")
        seqs = {row[0] for row in cursor.fetchall()}
        return seqs
    except Exception as e:
        print(f"기존 데이터 조회 실패: {e}")
        return set()
    finally:
        cursor.close()
        conn.close()


def save_to_db(program_data):
    """프로그램 데이터를 데이터베이스에 저장

    Args:
        program_data: 크롤링된 프로그램 데이터 딕셔너리
            필수 필드: article_seq, title, region
            선택 필드: target, capacity, contact, status, 
                     reg_start, reg_end, prog_start, prog_end,
                     content_text, image_urls
    """
    conn = get_db_connection()
    if not conn:
        return False

    try:
        cursor = conn.cursor()

        # 프로그램 데이터 INSERT OR UPDATE
        cursor.execute("""
            INSERT INTO programs (
                article_seq, program_region, title, target, capacity,
                contact, status, reg_start_date, reg_end_date,
                prog_start_date, prog_end_date, content_text,
                created_at, updated_at
            ) VALUES (
                %(article_seq)s, %(region)s, %(title)s, %(target)s, %(capacity)s,
                %(contact)s, %(status)s, %(reg_start)s, %(reg_end)s,
                %(prog_start)s, %(prog_end)s, %(content_text)s,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
            ON CONFLICT (article_seq) DO UPDATE SET
                program_region = EXCLUDED.program_region,
                title = EXCLUDED.title,
                target = EXCLUDED.target,
                capacity = EXCLUDED.capacity,
                contact = EXCLUDED.contact,
                status = EXCLUDED.status,
                reg_start_date = EXCLUDED.reg_start_date,
                reg_end_date = EXCLUDED.reg_end_date,
                prog_start_date = EXCLUDED.prog_start_date,
                prog_end_date = EXCLUDED.prog_end_date,
                content_text = EXCLUDED.content_text,
                updated_at = CURRENT_TIMESTAMP
        """, program_data)

        # 이미지 URL 저장 (기존 이미지는 DELETE 후 재삽입)
        if 'image_urls' in program_data and program_data['image_urls']:
            # 기존 이미지 삭제
            cursor.execute(
                "DELETE FROM program_images WHERE article_seq = %s",
                (program_data['article_seq'],)
            )

            # 새 이미지 삽입
            image_values = [
                (program_data['article_seq'], url, idx)
                for idx, url in enumerate(program_data['image_urls'])
            ]

            execute_values(
                cursor,
                """INSERT INTO program_images (article_seq, image_url, image_order) 
                   VALUES %s""",
                image_values
            )

        conn.commit()
        return True
    except Exception as e:
        print(f"❌ 데이터베이스 저장 실패: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def save_batch_to_db(programs_list):
    """여러 프로그램 데이터를 배치로 저장"""
    for program in programs_list:
        save_to_db(program)
