import os
import json
import requests
import boto3
from botocore.exceptions import ClientError
from config.settings import (
    IMAGE_DIR, JSON_FILE, STORAGE_MODE,
    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME
)


# S3 클라이언트 초기화 (cloud 모드일 때만)
s3_client = None
if STORAGE_MODE == 'cloud' and AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )


def check_s3_object_exists(s3_key):
    """S3에 객체가 존재하는지 확인"""
    if not s3_client:
        return False
    
    try:
        s3_client.head_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
        return True
    except ClientError as e:
        # 404 에러면 객체가 없는 것
        if e.response['Error']['Code'] == '404':
            return False
        # 다른 에러는 로그 출력
        print(f"S3 객체 확인 중 오류: {e}")
        return False


def upload_to_s3(file_content, s3_key, skip_if_exists=True):
    """S3에 파일 업로드
    
    Args:
        file_content: 업로드할 파일 내용
        s3_key: S3 객체 키
        skip_if_exists: True일 경우 이미 존재하면 건너뛰기
    
    Returns:
        S3 URL 또는 None
    """
    if not s3_client:
        print("S3 클라이언트가 초기화되지 않았습니다.")
        return None

    # 중복 체크
    if skip_if_exists and check_s3_object_exists(s3_key):
        print(f"S3에 이미 존재함 (건너뜀): {s3_key}")
        # 이미 존재하는 경우에도 URL 반환
        return f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"

    try:
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            Body=file_content,
            ContentType='image/jpeg'
        )
        print(f"S3 업로드 성공: {s3_key}")
        # S3 URL 반환
        return f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
    except ClientError as e:
        print(f"S3 업로드 실패: {e}")
        return None


def save_images_locally(img_srcs, article_seq):
    """로컬에 이미지 저장"""
    paths = []
    for idx, src in enumerate(img_srcs):
        try:
            res = requests.get(src, timeout=10)
            ext = src.split('.')[-1].split('?')[0]
            if len(ext) > 4:
                ext = 'jpg'

            filename = f"{article_seq}_{idx}.{ext}"
            path = os.path.join(IMAGE_DIR, filename)

            with open(path, 'wb') as f:
                f.write(res.content)
            paths.append(path)
        except:
            continue
    return paths


def save_images_to_s3(img_srcs, article_seq):
    """S3에 이미지 저장"""
    s3_urls = []
    for idx, src in enumerate(img_srcs):
        try:
            res = requests.get(src, timeout=10)
            ext = src.split('.')[-1].split('?')[0]
            if len(ext) > 4:
                ext = 'jpg'

            s3_key = f"programs/{article_seq}_{idx}.{ext}"
            s3_url = upload_to_s3(res.content, s3_key)

            if s3_url:
                s3_urls.append(s3_url)
        except Exception as e:
            print(f"이미지 업로드 실패 ({src}): {e}")
            continue
    return s3_urls


def save_images(img_srcs, article_seq):
    """저장 모드에 따라 이미지 저장"""
    if STORAGE_MODE == 'cloud':
        return save_images_to_s3(img_srcs, article_seq)
    else:
        return save_images_locally(img_srcs, article_seq)


def save_images(img_srcs, article_seq):
    """저장 모드에 따라 이미지 저장"""
    if STORAGE_MODE == 'cloud':
        return save_images_to_s3(img_srcs, article_seq)
    else:
        return save_images_locally(img_srcs, article_seq)


def save_json_data(data_list):
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(data_list, f, ensure_ascii=False, indent=4)


def load_json_data():
    if os.path.exists(JSON_FILE):
        try:
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if not content:
                    return []
                return json.loads(content)
        except json.JSONDecodeError:
            return []
    return []
