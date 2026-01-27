"""
AWS 설정 확인 스크립트
클라우드 모드 사용 전 AWS 연결을 테스트합니다.
"""

import os
from dotenv import load_dotenv
import boto3
from botocore.exceptions import ClientError
import psycopg2

load_dotenv()


def test_s3_connection():
    """S3 연결 테스트"""
    print("\n[1] S3 연결 테스트...")

    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'ap-northeast-2')
        )

        bucket_name = os.getenv('S3_BUCKET_NAME')

        # 버킷 존재 확인
        s3_client.head_bucket(Bucket=bucket_name)
        print(f"   ✅ S3 버킷 '{bucket_name}' 연결 성공")

        # 테스트 파일 업로드
        test_content = b"test file content"
        s3_client.put_object(
            Bucket=bucket_name,
            Key='test/connection_test.txt',
            Body=test_content
        )
        print(f"   ✅ 테스트 파일 업로드 성공")

        # 테스트 파일 삭제
        s3_client.delete_object(
            Bucket=bucket_name, Key='test/connection_test.txt')
        print(f"   ✅ 테스트 파일 삭제 성공")

        return True

    except ClientError as e:
        print(f"   ❌ S3 연결 실패: {e}")
        return False
    except Exception as e:
        print(f"   ❌ 오류 발생: {e}")
        return False


def test_rds_connection():
    """RDS (PostgreSQL) 연결 테스트"""
    print("\n[2] RDS 연결 테스트...")

    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD')
        )

        cursor = conn.cursor()
        cursor.execute('SELECT version();')
        version = cursor.fetchone()

        print(f"   ✅ PostgreSQL 연결 성공")
        print(f"   ℹ️  버전: {version[0].split(',')[0]}")

        cursor.close()
        conn.close()

        return True

    except psycopg2.OperationalError as e:
        print(f"   ❌ RDS 연결 실패: {e}")
        return False
    except Exception as e:
        print(f"   ❌ 오류 발생: {e}")
        return False


def main():
    """메인 함수"""
    print("=" * 50)
    print("AWS 설정 확인")
    print("=" * 50)

    # 환경 변수 확인
    required_vars = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'S3_BUCKET_NAME',
        'DB_HOST',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD'
    ]

    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        print("\n❌ 다음 환경 변수가 설정되지 않았습니다:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n.env 파일을 확인하세요.")
        return

    print("\n✅ 필수 환경 변수 모두 설정됨")

    # 연결 테스트
    s3_ok = test_s3_connection()
    rds_ok = test_rds_connection()

    print("\n" + "=" * 50)
    if s3_ok and rds_ok:
        print("✅ 모든 테스트 통과! 클라우드 모드 사용 가능")
    else:
        print("❌ 일부 테스트 실패. 설정을 확인하세요.")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    main()
