# EC2 서버 설정 가이드

본 문서는 EC2 서버의 초기 환경 설정, Nginx 리버스 프록시, SSL 보안 설정 및 Docker 배포 과정을 안내합니다.

---

## 1. EC2 SSH 접속

터미널을 실행하고 페어키(`.pem`)가 있는 디렉토리에서 다음 명령어를 입력하여 서버에 접속합니다.

```bash
# 권한 설정 (최초 1회)
chmod 400 <your-key-pair>.pem

# 접속
ssh -i <your-key-pair>.pem ubuntu@i14b110.p.example.io
```

---

## 1.1. 메모리 스왑(Swap) 설정 (권장)

EC2 인스턴스(특히 프리티어)의 RAM 부족으로 인한 서버 다운(OOM Killed)을 방지하기 위해 스왑 메모리를 설정합니다.

### 스왑 파일 생성 및 활성화

```bash
# 2GB 스왑 파일 생성
sudo fallocate -l 2G /swapfile

# 권한 설정 (root만 접근 가능)
sudo chmod 600 /swapfile

# 스왑 공간으로 설정
sudo mkswap /swapfile

# 스왑 활성화
sudo swapon /swapfile
```

### 재부팅 후에도 유지되도록 설정

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 2. Nginx 설치 및 라우팅 설정

Nginx를 사용하여 외부에서 들어오는 80(HTTP)/443(HTTPS) 요청을 백엔드 서버(8080 포트)로 전달합니다.

### Nginx 설치

```bash
sudo apt update
sudo apt install nginx -y
```

---

## 3. Nginx 사이트 설정 파일 작성

Nginx 설정 파일을 생성하여 도메인 및 프록시 규칙을 정의합니다.

```bash
# 설정 파일 생성 (nano 또는 vim 사용)
sudo nano /etc/nginx/sites-available/i14b110.p.example.io
```

**파일 내용:**

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name i14b110.p.example.io;

    # 용량 큰 요청 대비(음성 파일 업로드 등)
    client_max_body_size 20m;

    # / 로 시작하는 요청은 백엔드로 프록시
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 지원
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 타임아웃 설정
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 설정 활성화 (심볼릭 링크 생성)

```bash
sudo ln -s /etc/nginx/sites-available/i14b110.p.example.io /etc/nginx/sites-enabled/
```

---

## 4. Nginx 실행 및 상태 확인

설정에 오류가 없는지 확인하고 Nginx를 재시작합니다.

```bash
# 구문 오류 확인
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx

# 상태 확인
sudo systemctl status nginx
```

---

## 5. SSL 보안 설정 (Certbot 사용)

Let's Encrypt를 통해 무료 SSL 인증서를 발급받고 HTTPS를 적용합니다.

### Certbot 설치 및 실행

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# SSL 인증서 자동 발급 및 Nginx 설정 반영
sudo certbot --nginx -d i14b110.p.example.io
```

### 접속 테스트

SSL 적용 후 외부에서 서버의 헬스체크 엔드포인트로 요청을 보내 확인합니다.

```bash
# HTTP 요청 (자동으로 HTTPS로 리다이렉트되어야 함)
curl -i http://i14b110.p.example.io/health-check

# HTTPS 요청
curl -i https://i14b110.p.example.io/health-check
```

---

## 6. 결과 확인

위의 `curl` 명령어 실행 시 HTTP 응답 코드가 **200 OK**가 나오면 정상적으로 설정된 것입니다.

---

## 7. Docker 및 Docker Compose 설치

컨테이너 기반 배포를 위해 Docker 엔진을 설치합니다.

```bash
# 설치 스크립트 실행
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 현재 사용자를 docker 그룹에 추가 (재접속 필요)
sudo usermod -aG docker $USER
```

---

## 8. Docker 배포 설정 파일 작성

서버에서 직접 파일을 생성하거나 로컬에서 전송할 수 있습니다.

### 방법 1: 터미널에서 직접 생성 (추천)

가장 빠르고 간편한 방법입니다. `cat` 명령어를 복사하여 터미널에 붙여넣으세요.

#### `docker-compose.yml` 생성

```bash
cat <<EOF > docker-compose.yml
services:
  backend:
    container_name: dagaga-backend
    image: <your-docker-hub-id>/dagaga-backend:latest
    ports:
      - "8080:8080"
    env_file:
      - ./.env
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
EOF
```

#### `.env` 생성 (환경 변수)

```bash
cat <<EOF > .env
DB_URL=jdbc:postgresql://<db-host>:5432/<db-name>
DB_USERNAME=<username>
DB_PASSWORD=<password>
# 필요한 기타 환경 변수들...
EOF
```

### 방법 2: 로컬에서 서버로 파일 전송 (SCP)

로컬 터미널에서 서버로 파일을 바로 보낼 때 사용합니다.

```bash
# 로컬 터미널에서 실행
scp -i <your-key>.pem docker-compose.yml ubuntu@13.125.219.161:~/
```

---

## 9. 이미지 Pull 및 서비스 실행

설정 파일이 준비되었다면 다음 명령어로 서비스를 실행합니다.

```bash
# 이미지 Pull 및 컨테이너 실행
sudo docker compose pull
sudo docker compose up -d
```

---

## 9. 트러블슈팅 (로그 확인)

서비스가 정상적으로 작동하지 않을 경우 컨테이너 로그를 통해 원인을 파악할 수 있습니다.

```bash
# 백엔드 컨테이너 실시간 로그 확인
sudo docker logs -f dagaga-backend

# 실행 중인 컨테이너 목록 및 상태 확인
sudo docker ps -a
```

---

## 10. EC2 Docker 캐시 관리

서버 용량 부족을 방지하기 위해 불필요한 Docker 이미지 및 캐시를 수시로 정리해 줍니다.

```bash
# 사용하지 않는 모든 리소스(이미지, 컨테이너, 네트워크 등) 정리
sudo docker system prune -a --volumes -f

# 특정 캐시만 정리할 경우
sudo docker builder prune -f
```
