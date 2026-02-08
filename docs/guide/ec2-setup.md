# EC2 서버 Full-Stack 설정 가이드

본 문서는 EC2 서버에 프론트엔드(React/Vite)와 백엔드(Spring Boot)를 통합 배포하고, Jenkins를 통한 CI/CD 환경을 구축하는 통합 가이드입니다.

---

## 1. EC2 초기 설정 및 도커 설치
EC2 인스턴스에 접속한 후 기본 패키지와 Docker를 설치합니다.

```bash
# SSH 접속
ssh -i <your-key>.pem ubuntu@i14b110.p.ssafy.io

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER # 재접속 후 적용
```

---

## 2. Nginx 통합 설정 (Full Configuration)
아래 내용을 `/etc/nginx/sites-available/i14b110.p.ssafy.io` 파일에 **전체 복사 붙여넣기** 하세요.

```nginx
server {
    server_name i14b110.p.ssafy.io;

    # 용량 큰 요청 대비 (음성 파일 등)
    client_max_body_size 20m;

    # 1. 백엔드 API (포트 8080)
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 지원
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 2. 젠킨스 CI/CD (포트 9090)
    # 반드시 jenkins 환경변수에 --prefix=/jenkins 가 설정되어 있어야 합니다.
    location /jenkins {
        proxy_pass http://127.0.0.1:9090/jenkins;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Jenkins 리다이렉트 문제 해결
        proxy_redirect http:// https://;
        sendfile off;
    }

    # 3. 프론트엔드 SPA (포트 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # --- SSL 설정 (Certbot managed) ---
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/i14b110.p.ssafy.io/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/i14b110.p.ssafy.io/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

# HTTP to HTTPS 리다이렉트
server {
    if ($host = i14b110.p.ssafy.io) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name i14b110.p.ssafy.io;
    return 404; # managed by Certbot
}
```

```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/i14b110.p.ssafy.io /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default # 기본 페이지 충돌 방지
```

```bash
# 설정 적용 후 Nginx 재시작
sudo nginx -t
sudo systemctl restart nginx
```

---

## 3. SSL 적용 (Certbot)
```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d i14b110.p.ssafy.io
```

---

## 4. 트러블슈팅 및 모니터링
서비스 상태 확인 및 로그 확인 방법입니다.

```bash
# 컨테이너 로그 확인 (실시간)
sudo docker logs -f dagaga-backend
sudo docker logs -f dagaga-frontend

# 실행 중인 컨테이너 확인
sudo docker ps
```

---

## 5. 자원 관리 (디스크 용량 확보)
주기적으로 불필요한 빌드 캐시와 이미지를 정리하여 서버 정지를 예방합니다.

```bash
# 사용하지 않는 모든 Docker 리소스 정리
sudo docker system prune -a --volumes -f

# 특정 컨테이너 로그 용량 제한 (docker-compose.yml에 설정됨)
# Jenkins 설정에서 빌드 로그 보관 개수 제한 (추천: 10개)
```
