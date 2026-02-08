# Jenkins CI/CD 설정 가이드 (EC2 + GitLab)

본 문서는 EC2 서버에 Jenkins를 설치하고, GitLab 모노레포를 빌드하기 위한 초기 플러그인 및 도커 연동 설정을 안내합니다.

---

## 1. Jenkins 설치 (Docker 사용)
가장 간편한 방법으로 Docker를 사용하여 Jenkins를 실행합니다.

```bash
# Docker Compose로 실행 (권장)
cat <<EOF > docker-compose-jenkins.yml
services:
  jenkins:
    image: jenkins/jenkins:lts-jdk17
    container_name: jenkins
    restart: always
    ports:
      - "9090:8080" # Jenkins 접속 포트
    volumes:
      - ./jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock # Docker-in-Docker 빌드용
    user: root # Socket 권한을 위해 필요
    environment:
      - JENKINS_OPTS=--prefix=/jenkins
EOF

sudo docker compose -f docker-compose-jenkins.yml up -d
```

---

## 2. 초기 설정 및 플러그인 설치
1. `http://i14b110.p.ssafy.io:9090` 접속.
2. `sudo docker logs jenkins` 명령어로 초기 비밀번호 확인 후 입력.
3. **Plug-ins**: 'Install suggested plugins'를 먼저 설치한 후, **[Dashboard] -> [Manage Jenkins] -> [Plugins] -> [Available plugins]**에서 다음을 검색하여 설치하세요.
   *   **GitLab**: GitLab 연동 및 Webhook 트리거 필수 플러그인.
   *   **Docker Pipeline**: Jenkinsfile에서 `docker.build` 등 도커 명령어를 쓰기 위해 필요.
   *   **Pipeline: Stage View**: 빌드 진행 상황을 시각적으로 확인.
   *   **Generic Webhook Trigger**: (옵션) 좀 더 세밀한 웹훅 설정이 필요할 때 사용.

---

## 3. GitLab 연동 설정
1. **GitLab**: [Project Settings] -> [Access Tokens] -> [Add new token]
   *   **Role**: `Maintainer` 또는 `Developer` (Webhook 관리를 위해 Maintainer 권한 추천)
   *   **Scopes**: 다음 두 가지를 반드시 체크하세요.
       *   **`api`**: Jenkins가 GitLab API를 통해 빌드 상태를 업데이트하고 웹훅을 관리합니다.
       *   **`read_repository`**: Jenkins가 소스 코드를 서버로 끌어오기(Pull) 위해 필요합니다.
2. **Jenkins**: [Manage Jenkins] -> [Credentials] -> [System] -> [Global credentials]
   *   `Kind`: GitLab API Token
   *   `API token`: 위에서 발급받은 토큰
   *   `ID`: `gitlab-token`

---

## 4. Jenkins 시스템 설정 (GitLab 연결)
1. **Jenkins**: [Manage Jenkins] -> [System] -> [GitLab] 섹션 이동.
2. **GitLab Connections**:
   *   **Connection name**: 자유롭게 입력 (예: `GitLab-SSAFY`)
   *   **GitLab host URL**: 반드시 **GitLab 서버의 기본 주소**만 입력하세요.
       *   **올바른 예**: `https://lab.ssafy.io`
       *   **잘못된 예**: `https://lab.ssafy.io/s14-webmobile2-sub1/...` (프로젝트 경로는 제외!)
   *   **Credentials**: 위에서 등록한 `gitlab-token` 선택.
3. **Test Connection**: 'Success'가 뜨는지 확인.

---

## 5. GitLab Webhook 설정 (자동 빌드)
GitLab에 코드가 푸시될 때 Jenkins 빌드가 자동으로 시작되도록 설정합니다.

1. **Jenkins Job 생성**:
   *   [New Item] -> [Pipeline] 선택.
   *   [Build Triggers] -> **Build when a change is pushed to GitLab** 체크.
   *   옆에 표시된 **GitLab webhook URL**을 복사.
2. **GitLab 프로젝트 설정**:
   *   [Settings] -> [Webhooks] -> [Add new webhook].
   *   **URL**: 위에서 복사한 Jenkins URL 입력.
   *   **Secret token**: Jenkins Job 설정의 [Advanced] -> [Secret token]에서 생성하여 입력.
   *   **Trigger**: `Push events` 체크.
3. **연동 확인**: [Test] -> [Push events]를 눌러 Jenkins에서 빌드가 시작되는지 확인.

---

## 6. 주기적인 자원 관리 (Storage Cleanup)
용량 부족을 방지하기 위해 Jenkins 설정과 파이프라인에 다음을 적용합니다.

### Jenkins 설정
*   각 Job 설정에서 **"Discard old builds"** 체크.
*   **Max # of builds to keep**: 10개로 설정.

### Docker 이미지 정리 (Jenkinsfile에 포함될 내용)
빌드 끝날 때마다 사용하지 않는 이미지를 정리합니다.
```groovy
stage('Cleanup') {
    steps {
        sh 'docker system prune -f'
    }
}
```

---

## 7. 트러블슈팅: 접속 불가 (포트 9090)
`http://i14b110.p.ssafy.io:9090` 접속이 안 될 경우 다음을 확인하세요.

1. **AWS 보안 그룹 (Security Group)**:
   *   AWS 콘솔 -> EC2 인스턴스 -> 보안 탭 -> 보안 그룹 클릭.
   *   **인바운드 규칙 편집**: 사용자 지정 TCP, 포트 `9090`, 소스 `0.0.0.0/0` (또는 본인 IP) 규칙 추가.
2. **서버 내부 방화벽 (UFW)**:
   ```bash
   sudo ufw status
   # 만약 status가 active라면 9090 허용
   sudo ufw allow 9090
   ```
3. **컨테이너 실행 여부**:
   ```bash
   sudo docker ps | grep jenkins
   # 실행 중이 아니라면 로그 확인
   sudo docker logs jenkins
   ```

4. **Docker Compose 관련 경고**:
   *   **`Network is still in use`**: `down` 실행 시 네트워크를 사용하는 다른 서비스가 있으면 발생합니다. 젠킨스 컨테이너만 제거되었다면 성공이므로 무시하고 `up` 하시면 됩니다.
   *   **`Found orphan containers`**: 같은 디렉토리에 다른 설정 파일로 띄운 컨테이너가 있을 때 발생합니다. 빌드/배포에 영향이 없으므로 무시하셔도 됩니다.

5. **Webhook Test 시 404 에러**: (생략...)

6. **빌드 성공(초록색)인데 스테이지가 안 보임 (Build skipped)**:
   *   **원인1 (첫 빌드)**: `changeset` 조건은 이전 빌드와 비교할 대상이 있어야 작동합니다. **#1 첫 빌드**에서는 변경사항을 계산할 수 없어 모든 스테이지가 Skip될 수 있습니다.
   *   **원인2 (브랜치 불일치)**: 현재 `Jenkinsfile`에 `when { branch 'develop' }`이 설정되어 있습니다. `main`이나 다른 브랜치에 푸시하면 모든 단계가 생략됩니다.
   *   **원인3 (수동 빌드)**: "Build Now" 버튼으로 수동 빌드하면 `changeset` 정보가 없어 스테이지가 생략됩니다.
   *   **확인 방법**: 빌드 번호(#1) 클릭 -> **Console Output** 확인. "Stage ... skipped due to when conditional" 메시지가 있는지 확인하세요.
   *   **해결**: `develop` 브랜치에 소량을 수정해서 **직접 Push** 해보거나, `Jenkinsfile`에서 `changeset` 조건을 잠시 지우고 테스트해 보세요.

### [추천] Nginx를 통한 Jenkins 접속 (보안 강화)
9090 포트를 외부에 직접 여는 대신, Nginx를 통해 `i14b110.p.ssafy.io/jenkins`로 접속하도록 설정할 수 있습니다. (이 경우 AWS에서 9090을 열지 않아도 됩니다.)

**1. Jenkins 설정 변경 (`docker-compose-jenkins.yml`)**:
```yaml
environment:
  - JENKINS_OPTS=--prefix=/jenkins
```

**2. Nginx 설정 추가**:
기존 Nginx 설정 파일(`sudo nano /etc/nginx/sites-available/...`)의 `server` 블록 내부에 다음 내용을 추가합니다.

```nginx
location /jenkins {
    proxy_pass http://127.0.0.1:9090/jenkins;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Jenkins 리다이렉트 및 웹훅 문제 해결
    proxy_redirect http:// https://;
    sendfile off;
}
```

```bash
# 설정 적용 후 Nginx 재시작
sudo nginx -t
sudo systemctl restart nginx
```

**3. 포트 닫기 (보안 권고)**:
Nginx 연동이 완료되었다면, 외부에서 9090 포트로 직접 접속하지 못하도록 차단하세요.
*   **AWS 보안 그룹**: 추가했던 9090 포트 규칙을 **삭제**.
*   **UFW (방화벽)**:
    ```bash
    sudo ufw delete allow 9090
    ```
