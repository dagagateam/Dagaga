# Jenkins Docker 빌드 트러블슈팅 가이드

본 문서는 Jenkins 컨테이너에서 Docker 명령어를 사용할 때 발생하는 일반적인 문제와 해결 방법을 정리합니다.

---

## 문제 1: `docker: not found` 에러

### 증상
```
/var/jenkins_home/workspace/...@tmp/durable-.../script.sh.copy: 1: docker: not found
ERROR: script returned exit code 127
```

### 원인
Jenkins 공식 이미지에는 Docker CLI가 포함되어 있지 않습니다.

### 해결 방법

#### 방법 A: 실행 중인 컨테이너에 직접 설치 (빠른 임시 해결)
```bash
# 1. Docker CLI 설치
sudo docker exec -u root jenkins apt-get update
sudo docker exec -u root jenkins apt-get install -y docker.io

# 2. 설치 확인
sudo docker exec jenkins docker --version
```

> [!WARNING]
> 이 방법은 컨테이너를 재생성하면 다시 설치해야 합니다.

#### 방법 B: Dockerfile로 영구 해결 (권장)
```bash
# 1. Dockerfile 생성
cat <<'EOF' > Dockerfile.jenkins
FROM jenkins/jenkins:lts-jdk17
USER root
# Docker CLI 설치
RUN apt-get update && apt-get install -y lsb-release && \
    curl -fsSLo /usr/share/keyrings/docker-archive-keyring.asc \
    https://download.docker.com/linux/debian/gpg && \
    echo "deb [arch=$(dpkg --print-architecture) \
    signed-by=/usr/share/keyrings/docker-archive-keyring.asc] \
    https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list && \
    apt-get update && apt-get install -y docker-ce-cli
USER jenkins
EOF

# 2. docker-compose-jenkins.yml 수정
cat <<'EOF' > docker-compose-jenkins.yml
services:
  jenkins:
    build:
      context: .
      dockerfile: Dockerfile.jenkins
    container_name: jenkins
    restart: always
    ports:
      - "9090:8080"
    volumes:
      - ./jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - JENKINS_OPTS=--prefix=/jenkins
EOF

# 3. 컨테이너 재생성
sudo docker compose -f docker-compose-jenkins.yml down
sudo docker compose -f docker-compose-jenkins.yml up -d --build
```

---

## 문제 2: `permission denied while trying to connect to the docker API` 에러

### 증상
```
ERROR: permission denied while trying to connect to the docker API at unix:///var/run/docker.sock
ERROR: script returned exit code 1
```

### 원인
Jenkins 유저가 호스트의 Docker 소켓(`/var/run/docker.sock`)에 접근할 권한이 없습니다.

### 해결 방법

#### 1단계: 호스트의 Docker 소켓 그룹 ID 확인
```bash
# Docker 소켓의 그룹 확인
ls -l /var/run/docker.sock

# 결과 예시:
# srw-rw---- 1 root docker ... /var/run/docker.sock
# 또는
# srw-rw---- 1 root 999 ... /var/run/docker.sock

# 그룹 ID(GID) 숫자 확인
getent group docker
# 결과 예시: docker:x:999:ubuntu (999가 GID)
```

#### 2단계: Jenkins 컨테이너 안에 동일한 GID로 그룹 생성
```bash
# GID 999인 경우 (위에서 확인한 숫자로 변경)
sudo docker exec -u root jenkins groupadd -g 999 docker

# jenkins 유저를 docker 그룹에 추가
sudo docker exec -u root jenkins usermod -aG docker jenkins

# 젠킨스 재시작 (그룹 변경 적용)
sudo docker compose -f docker-compose-jenkins.yml restart
```

#### 2단계 대안: 소켓 파일 권한 직접 변경 (비권장)
```bash
# 모든 사용자에게 읽기/쓰기 권한 부여 (보안 주의!)
sudo chmod 666 /var/run/docker.sock
```

> [!CAUTION]
> 소켓 파일 권한을 `666`으로 변경하면 보안상 위험합니다. 그룹 추가 방법을 우선 사용하세요.

---

## 문제 3: Jenkins 컨테이너 실행 시 `Permission denied` (jenkins_home 권한 에러)

### 증상
```
INSTALL WARNING: User:  missing rw permissions on JENKINS_HOME: /var/jenkins_home
touch: cannot touch '/var/jenkins_home/copy_reference_file.log': Permission denied
```

### 원인
호스트의 `jenkins_home` 디렉토리가 root 소유로 생성되어 있어 jenkins 유저(UID 1000)가 쓰기를 할 수 없습니다.

### 해결 방법
```bash
# jenkins_home 폴더 소유권을 jenkins 유저(UID 1000)로 변경
sudo chown -R 1000:1000 ./jenkins_home

# 젠킨스 재시작
sudo docker compose -f docker-compose-jenkins.yml restart
```

---

## 문제 4: Jenkins 재시작 후에도 도커 에러가 지속됨

### 원인
- 이전 이미지 캐시가 사용되고 있을 수 있습니다.
- 컨테이너 재시작만으로는 Dockerfile 변경사항이 적용되지 않습니다.

### 해결 방법
```bash
# 1. 컨테이너와 이미지 완전히 제거
sudo docker compose -f docker-compose-jenkins.yml down
sudo docker rmi jenkins-jenkins ubuntu-jenkins

# 2. --build 옵션으로 강제 재빌드
sudo docker compose -f docker-compose-jenkins.yml up -d --build

# 3. 빌드 로그 확인 (Building jenkins 라는 로그가 떠야 정상)
sudo docker compose -f docker-compose-jenkins.yml logs jenkins
```

---

## 검증 체크리스트

모든 설정이 완료된 후 다음 명령어로 확인하세요:

```bash
# 1. Docker CLI 설치 확인
sudo docker exec jenkins docker --version
# 기대 결과: Docker version 20.10.x 또는 유사한 버전

# 2. Docker 소켓 접근 확인
sudo docker exec jenkins docker ps
# 기대 결과: 호스트의 실행 중인 컨테이너 목록 출력

# 3. Jenkins 유저 그룹 확인
sudo docker exec jenkins groups jenkins
# 기대 결과: jenkins docker (또는 유사한 출력에 docker 포함)
```

모든 명령이 에러 없이 실행되면, Jenkins에서 **Build Now**를 눌러 파이프라인을 실행하세요.

---

## 추가 참고사항

### Jenkins에서 Docker 명령어 사용 시 권장 방식
- Jenkinsfile에서는 `sh 'docker build ...'` 형태로 직접 Docker CLI를 호출합니다.
- 멀티 스테이지 Dockerfile을 사용하면 Jenkins 서버에 Java나 Node.js를 설치할 필요가 없습니다.
- Docker 이미지 빌드는 시간이 오래 걸릴 수 있으므로 `--platform` 옵션을 명시적으로 지정하세요.

### 보안 고려사항
- Docker 소켓을 컨테이너에 마운트하면 컨테이너가 호스트의 모든 Docker 리소스에 접근할 수 있습니다.
- 프로덕션 환경에서는 Docker-in-Docker(DinD) 또는 Kaniko와 같은 대안을 고려하세요.
