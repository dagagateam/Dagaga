import requests
from bs4 import BeautifulSoup
import re
from config.settings import VIEW_URL, BASE_URL
from src.utils import split_date


def parse_detail(article_seq):
    params = {'article_seq': article_seq, 'mode': 'view'}
    res = requests.get(VIEW_URL, params=params)
    soup = BeautifulSoup(res.text, 'html.parser')

    data = {'article_seq': article_seq}

    # 지역 및 제목
    title_dt = soup.select_one('.title_v2')
    if not title_dt:
        return None

    data['region'] = title_dt.select_one('.icon_zone').get_text(strip=True)
    data['title'] = title_dt.get_text(
        strip=True).replace(data['region'], "").strip()

    # 공통 정보 추출 (접수기간, 대상, 문의처)
    dds = soup.select('.call_tell')
    for dd in dds:
        label = dd.select_one('.date').get_text(
            strip=True) if dd.select_one('.date') else ""
        value = dd.select_one('.count').get_text(
            strip=True) if dd.select_one('.count') else ""

        if label == '접수기간':
            data['reg_start'], data['reg_end'] = split_date(value)
        elif label == '대상':
            data['target'] = value
        elif label == '문의처':
            data['contact'] = value

    # 인원 및 프로그램 기간
    cap_li = soup.find('li', string=re.compile('인원'))
    data['capacity'] = cap_li.find_next_sibling(
        'li').get_text(strip=True) if cap_li else "0"

    prog_li = soup.find('li', string=re.compile('프로그램기간'))
    if prog_li:
        prog_text = prog_li.find_next_sibling('li').get_text(strip=True)
        data['prog_start'], data['prog_end'] = split_date(prog_text)

    # 상태
    status_el = soup.select_one('.icon_text_application')
    data['status'] = status_el.get_text(strip=True) if status_el else "접수"

    # 본문 텍스트 및 이미지 태그 추출
    content_area = soup.select_one('.tb_content')
    data['content_text'] = content_area.get_text(
        strip=True) if content_area else ""

    img_tags = content_area.select('img') if content_area else []
    data['img_srcs'] = []
    for img in img_tags:
        src = img.get('src')
        data['img_srcs'].append(
            src if src.startswith('http') else BASE_URL + src)

    return data
