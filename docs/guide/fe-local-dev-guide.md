# 로컬 개발 환경 가이드

본 문서는 로컬에서 프론트엔드 개발 시 EC2 백엔드와 연동하는 방법을 설명합니다.

---

## 🎯 개발 환경 구성

### 로컬 개발
- **프론트엔드**: 로컬에서 실행 (`http://localhost:5173`)
- **백엔드**: EC2 서버 사용 (`https://i14b110.p.ssafy.io`)
- **프록시**: Vite의 proxy 기능으로 `/api` 요청을 EC2로 전달

### 프로덕션 배포
- **프론트엔드**: EC2 Docker 컨테이너 (`dagaga-frontend`)
- **백엔드**: EC2 Docker 컨테이너 (`dagaga-backend`)
- **프록시**: Nginx가 같은 Docker 네트워크 내에서 백엔드로 프록시

---

## 🚀 로컬 개발 시작하기

### 1. 의존성 설치
```bash
cd frontend/dagaga
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

개발 서버가 시작되면 `http://localhost:5173`에서 접속할 수 있습니다.

### 3. API 요청 확인

프론트엔드 코드에서 다음과 같이 API를 호출하면:
```javascript
// 예시: axios 요청
axios.get('/api/users')
```

Vite proxy가 자동으로 다음과 같이 변환합니다:
```
http://localhost:5173/api/users
→ https://i14b110.p.ssafy.io/api/users
```

---

## ⚙️ 설정 파일 설명

### `vite.config.js`
로컬 개발 시 `/api` 요청을 EC2 백엔드로 프록시합니다.

```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://i14b110.p.ssafy.io',  // EC2 백엔드 주소
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### `.env`
로컬 개발에서는 비워두면 됩니다. Vite proxy가 자동으로 처리합니다.

```bash
VITE_API_BASE_URL=  # 비워둠
```

### `nginx.conf` (프로덕션 전용)
Docker Compose 환경에서만 사용됩니다. 로컬 개발에는 영향 없습니다.

```nginx
location /api/ {
    proxy_pass http://dagaga-backend:8080;  # 같은 Docker 네트워크 내 백엔드
}
```

---

## 🔍 API 테스트 방법

### 브라우저 개발자 도구
1. 개발 서버 실행 후 브라우저에서 접속
2. `F12` → `Network` 탭 열기
3. API 요청 발생시킬 기능 사용
4. Network 탭에서 `/api/...` 요청 확인
5. Response 탭에서 데이터 확인

### 예시: 간단한 테스트 코드
프론트엔드 코드에 임시로 추가하여 테스트:

```javascript
import axios from 'axios';

// 컴포넌트 마운트 시 테스트
useEffect(() => {
  axios.get('/api/health')  // 또는 실제 API 엔드포인트
    .then(res => console.log('✅ API 연결 성공:', res.data))
    .catch(err => console.error('❌ API 연결 실패:', err));
}, []);
```

---

## 🐛 트러블슈팅

### CORS 에러 발생 시
Vite proxy가 `changeOrigin: true`로 설정되어 있어 대부분의 CORS 문제를 해결합니다.
만약 문제가 계속되면 백엔드 CORS 설정을 확인하세요.

### API 요청이 안 될 때
1. **EC2 백엔드 상태 확인**
   ```bash
   curl https://i14b110.p.ssafy.io/api/health
   ```

2. **Vite 개발 서버 재시작**
   ```bash
   # Ctrl+C로 중지 후
   npm run dev
   ```

3. **브라우저 캐시 삭제**
   - `F12` → Application → Clear storage

### 포트 충돌 시
Vite는 기본적으로 5173 포트를 사용합니다. 충돌 시 자동으로 다른 포트를 사용합니다.

---

## 📋 체크리스트

로컬 개발을 시작하기 전에 확인하세요:

- [ ] Node.js 설치됨 (`node -v`로 확인)
- [ ] `npm install` 완료
- [ ] EC2 백엔드가 정상 작동 중
- [ ] `vite.config.js`의 proxy target이 올바른 EC2 주소로 설정됨
- [ ] `.env` 파일의 `VITE_API_BASE_URL`이 비어있음

---

## 🆚 환경별 차이점 요약

| 항목 | 로컬 개발 | 프로덕션 (EC2) |
|------|----------|---------------|
| 프론트엔드 실행 | `npm run dev` (로컬) | Docker 컨테이너 |
| 백엔드 위치 | EC2 원격 서버 | 같은 EC2, 같은 Docker 네트워크 |
| 프록시 담당 | Vite Dev Server | Nginx |
| 포트 | 5173 (Vite 기본) | 80/443 (Nginx) |
| Hot Reload | ✅ 지원 | ❌ 미지원 (빌드 필요) |

---

## 💡 추가 팁

### 개발 효율성
- **Hot Reload**: 코드 수정 시 자동으로 브라우저가 새로고침됩니다
- **빠른 빌드**: Vite는 매우 빠른 HMR(Hot Module Replacement)을 제공합니다

### 프로덕션 배포 전 테스트
로컬에서 프로덕션 빌드를 테스트하려면:
```bash
npm run build
npm run preview
```

프로덕션 빌드 후 `http://localhost:4173`에서 확인할 수 있습니다.
