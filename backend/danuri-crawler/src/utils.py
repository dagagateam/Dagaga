import re


def clean_number(text):
    """문자열에서 숫자만 추출"""
    return int(re.sub(r'[^0-9]', '', text)) if text else 0


def split_date(date_range_str):
    """'2026-01-23 ~ 2026-12-31' 형태를 시작일과 종료일로 분리"""
    if '~' in date_range_str:
        parts = date_range_str.split('~')
        return parts[0].strip(), parts[1].strip()
    return date_range_str.strip(), date_range_str.strip()
