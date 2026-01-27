import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

BASE_URL = "https://www.liveinkorea.kr"
LIST_URL = f"{BASE_URL}/web/lay1/bbs/S1T10C27/A/4/list.do"
VIEW_URL = f"{BASE_URL}/web/lay1/bbs/S1T10C27/A/4/view.do"

# 저장 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
IMAGE_DIR = os.path.join(DATA_DIR, "images")
JSON_FILE = os.path.join(DATA_DIR, "programs.json")

# 폴더 초기화
os.makedirs(IMAGE_DIR, exist_ok=True)

# 저장 모드 설정 ('local' 또는 'cloud')
STORAGE_MODE = os.getenv('STORAGE_MODE', 'local')

# AWS S3 설정
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'ap-northeast-2')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

# PostgreSQL (RDS) 설정
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
