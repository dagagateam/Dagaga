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


def init_db():
    """데이터베이스 테이블 초기화"""
    conn = get_db_connection()
    if not conn:
        return

    try:
        cursor = conn.cursor()

        # 프로그램 테이블 생성
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS programs (
                article_seq INTEGER PRIMARY KEY,
                region VARCHAR(100),
                title TEXT NOT NULL,
                reg_start VARCHAR(50),
                reg_end VARCHAR(50),
                target TEXT,
                capacity VARCHAR(50),
                prog_start VARCHAR(50),
                prog_end VARCHAR(50),
                contact TEXT,
                status VARCHAR(50),
                content_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 이미지 테이블 생성
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS program_images (
                id SERIAL PRIMARY KEY,
                article_seq INTEGER REFERENCES programs(article_seq) ON DELETE CASCADE,
                image_url TEXT NOT NULL,
                image_order INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 인덱스 생성
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_programs_article_seq 
            ON programs(article_seq)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_program_images_article_seq 
            ON program_images(article_seq)
        """)

        conn.commit()
        print("데이터베이스 테이블 초기화 완료")
    except Exception as e:
        print(f"테이블 생성 실패: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


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
    """프로그램 데이터를 데이터베이스에 저장"""
    conn = get_db_connection()
    if not conn:
        return False

    try:
        cursor = conn.cursor()

        # 프로그램 데이터 삽입
        cursor.execute("""
            INSERT INTO programs (
                article_seq, region, title, reg_start, reg_end,
                target, capacity, prog_start, prog_end,
                contact, status, content_text
            ) VALUES (
                %(article_seq)s, %(region)s, %(title)s, %(reg_start)s, %(reg_end)s,
                %(target)s, %(capacity)s, %(prog_start)s, %(prog_end)s,
                %(contact)s, %(status)s, %(content_text)s
            )
            ON CONFLICT (article_seq) DO UPDATE SET
                region = EXCLUDED.region,
                title = EXCLUDED.title,
                reg_start = EXCLUDED.reg_start,
                reg_end = EXCLUDED.reg_end,
                target = EXCLUDED.target,
                capacity = EXCLUDED.capacity,
                prog_start = EXCLUDED.prog_start,
                prog_end = EXCLUDED.prog_end,
                contact = EXCLUDED.contact,
                status = EXCLUDED.status,
                content_text = EXCLUDED.content_text,
                updated_at = CURRENT_TIMESTAMP
        """, program_data)

        # 이미지 URL 삽입 (기존 이미지 삭제 후 재삽입)
        if 'image_urls' in program_data and program_data['image_urls']:
            cursor.execute(
                "DELETE FROM program_images WHERE article_seq = %s",
                (program_data['article_seq'],)
            )

            image_values = [
                (program_data['article_seq'], url, idx)
                for idx, url in enumerate(program_data['image_urls'])
            ]

            execute_values(
                cursor,
                "INSERT INTO program_images (article_seq, image_url, image_order) VALUES %s",
                image_values
            )

        conn.commit()
        return True
    except Exception as e:
        print(f"데이터베이스 저장 실패: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def save_batch_to_db(programs_list):
    """여러 프로그램 데이터를 배치로 저장"""
    for program in programs_list:
        save_to_db(program)
