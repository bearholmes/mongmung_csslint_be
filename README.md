<div align="center">

# 🎨 Mongmung CSS 린트

**Stylelint 기반의 강력한 CSS 코드 분석 및 품질 개선 RESTful API 서비스**

[![Bun Version](https://img.shields.io/badge/bun-v1.3.2-black?logo=bun)](https://bun.sh)
[![Elysia](https://img.shields.io/badge/elysia-v1.4.16-blue)](https://elysiajs.com)
[![TypeScript](https://img.shields.io/badge/typescript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-46%2F46%20passing-success)](./tests)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

[주요 기능](#-주요-기능) • [빠른 시작](#-빠른-시작) • [API 문서](#-api-문서) • [보안](#-보안--성능) • [기여하기](#-기여하기)

</div>

---

## 📖 목차

- [개요](#-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [빠른 시작](#-빠른-시작)
- [설치](#-설치)
- [환경 설정](#-환경-설정)
- [API 문서](#-api-문서)
- [아키텍처](#-아키텍처)
- [보안 & 성능](#-보안--성능)
- [개발](#-개발)
- [Docker 지원](#-docker-지원)
- [테스트](#-테스트)
- [문제 해결](#-문제-해결)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

---

## 🌟 개요

포괄적인 CSS 코드 품질 분석을 제공하는 백엔드 서비스입니다. 최신 기술과 모범 사례를 기반으로 구축되었으며, 커스터마이징 가능한 규칙, 다양한 출력 형식을 갖춘 실시간 CSS 린팅을 제공합니다.

**이런 경우에 적합합니다:**

- 🎯 CSS/SCSS 코드 정책 적용
- 🔄 CI/CD 파이프라인 통합
- 📊 실시간 코드 분석
- 🏢 일관된 코드 표준을 통한 팀 협업

---

## ✨ 주요 기능

### 핵심 기능

- ✅ **다중 문법 지원** - CSS, SCSS, HTML 인라인 스타일
- 🎨 **유연한 포맷팅** - Compact 및 Nested 출력 스타일
- ⚙️ **커스터마이징 가능한 규칙** - 완전한 Stylelint 규칙 설정

### 보안 & 성능

- 🛡️ **요청 제한** - Token Bucket 알고리즘 (IP당 100req/분)
- 🔒 **보안 헤더** - XSS, Clickjacking 방어
- 📦 **요청 크기 제한** - DoS 공격 방지를 위한 5MB 제한
- 🚀 **최적화된 로깅** - 환경 기반 로그 레벨
- 💾 **메모리 관리** - 장시간 실행 프로세스 자동 정리

### 개발자 경험

- 🔥 **Hot Module Replacement** - 초고속 개발 환경
- 📖 **API 문서** - 인터랙티브 API 문서 (Scalar UI)
- 🔍 **구조화된 로깅** - 쉬운 디버깅과 모니터링
- 🎯 **에러 핸들링** - 컨텍스트가 포함된 계층적 에러 시스템

---

## 🛠 기술 스택

| 분류           | 기술                                     | 버전     | 용도                     |
| -------------- | ---------------------------------------- | -------- | ------------------------ |
| **런타임**     | [Bun](https://bun.sh)                    | v1.3.2   | 초고속 JavaScript 런타임 |
| **프레임워크** | [Elysia](https://elysiajs.com)           | v1.4.16  | 고성능 웹 프레임워크     |
| **린터**       | [Stylelint](https://stylelint.io)        | v15.11.0 | CSS/SCSS 린팅 엔진       |
| **CSS 파서**   | [PostCSS](https://postcss.org)           | v8.4.x   | CSS 변환                 |
| **언어**       | [TypeScript](https://typescriptlang.org) | v5.0+    | 타입 안전 개발           |
| **테스팅**     | Bun Test                                 | Built-in | 빠른 네이티브 테스팅     |
| **API 문서**   | Scalar UI                                | v3.0     | 인터랙티브 API 문서      |

### 아키텍처 특징

- **디자인 패턴**: Singleton, Factory, Strategy, Type Guard
- **에러 핸들링**: HTTP 상태 매핑이 포함된 계층적 에러 시스템
- **모듈성**: 관심사의 명확한 분리 (MVC 패턴)

---

## 🚀 빠른 시작

2분 이내에 실행 가능:

```bash
# 1. Bun 설치 (아직 설치하지 않은 경우)
curl -fsSL https://bun.sh/install | bash

# 2. 저장소 복제
git clone https://github.com/bearholmes/mongmung_csslint_server.git
cd mongmung_csslint_server

# 3. 의존성 설치
bun install

# 4. 환경 설정
cp .env.example .env

# 5. 개발 서버 시작
bun run dev
```

서버가 `http://localhost:5002`에서 실행됩니다 🎉

**테스트:**

```bash
curl -X POST http://localhost:5002/api/lint \
  -H "Content-Type: application/json" \
  -d '{
    "code": "body { color: #FFF; }",
    "syntax": "css",
    "config": {
      "rules": { "color-hex-case": "lower" },
      "outputStyle": "nested"
    }
  }'
```

---

## 📦 설치

### 사전 요구사항

- **Bun** v1.0+ ([설치 가이드](https://bun.sh/docs/installation))
- **Node.js** v18+ (일부 peer dependencies용)
- **Git** 버전 관리

### 설치 단계

1. **저장소 복제**

   ```bash
   git clone https://github.com/bearholmes/mongmung_csslint_server.git
   cd mongmung_csslint_server
   ```

2. **의존성 설치**

   ```bash
   bun install
   ```

3. **설치 확인**
   ```bash
   bun run test
   ```

---

## ⚙️ 환경 설정

### 환경 변수

템플릿에서 `.env` 파일 생성:

```bash
cp .env.example .env
```

#### 핵심 설정

| 변수       | 설명        | 기본값        | 필수 |
| ---------- | ----------- | ------------- | ---- |
| `PORT`     | 서버 포트   | `5002`        |      |
| `HOST`     | 서버 호스트 | `0.0.0.0`     |      |
| `NODE_ENV` | 환경 모드   | `development` |      |

#### CORS 설정

| 변수          | 설명                      | 필수 |
| ------------- | ------------------------- | ---- |
| `CORS_ORIGIN` | 허용된 출처 (쉼표로 구분) | ✅   |

**개발 환경:**

```bash
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**프로덕션:**

```bash
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com,https://api.your-domain.com
```

⚠️ **보안 참고사항**: 프로덕션에서는 `CORS_ORIGIN`이 **필수**이며 정확한 도메인을 지정해야 합니다. 와일드카드(`*`)는 허용되지 않습니다.

#### 로깅 설정

| 변수        | 설명        | 값                               | 기본값                               |
| ----------- | ----------- | -------------------------------- | ------------------------------------ |
| `LOG_LEVEL` | 로깅 상세도 | `error`, `warn`, `info`, `debug` | `debug` (개발)<br/>`info` (프로덕션) |

**예시:**

```bash
# 개발 환경 - 모든 로그
LOG_LEVEL=debug

# 프로덕션 - info 이상만
LOG_LEVEL=info
```

---

## 📡 API 문서

### 인터랙티브 문서

`http://localhost:5002/docs` 에서 전체 인터랙티브 API 문서를 확인하세요.

### 엔드포인트

#### CSS 코드 린트

```http
POST /api/lint
```

**요청 본문:**

```json
{
  "code": "body {\n  color: #FFF;\n  margin: 0;\n}",
  "syntax": "css",
  "config": {
    "rules": {
      "color-hex-case": "lower",
      "indentation": 2,
      "color-no-invalid-hex": true
    },
    "outputStyle": "nested"
  }
}
```

**파라미터:**

| 필드                 | 타입                      | 필수 | 설명            |
| -------------------- | ------------------------- | ---- | --------------- |
| `code`               | string                    | ✅   | 린트할 CSS 코드 |
| `syntax`             | `"css"` \| `"html"`       | ✅   | 문법 타입       |
| `config.rules`       | object                    | ✅   | Stylelint 규칙  |
| `config.outputStyle` | `"nested"` \| `"compact"` | ❌   | 출력 형식       |

**성공 응답 (200):**

```json
{
  "success": true,
  "message": "성공",
  "content": {
    "warnings": [
      {
        "line": 2,
        "column": 10,
        "rule": "color-hex-case",
        "severity": "warning",
        "text": "Expected \"#FFF\" to be \"#fff\" (color-hex-case)"
      }
    ],
    "output": "body {\n  color: #fff;\n  margin: 0;\n}",
    "info": {
      "version": "15.11.0",
      "config": {
        "extends": ["stylelint-config-standard", "..."],
        "plugins": ["stylelint-order", "stylelint-stylistic"],
        "customSyntax": null
      }
    }
  }
}
```

**에러 응답:**

| 상태 | 코드                | 설명                               |
| ---- | ------------------- | ---------------------------------- |
| 400  | `VALIDATION_ERROR`  | 잘못된 입력 (빈 코드, 잘못된 문법) |
| 413  | `PAYLOAD_TOO_LARGE` | 요청 본문이 5MB 초과               |
| 422  | `PARSE_ERROR`       | CSS 파싱 실패                      |
| 429  | -                   | 요청 제한 초과 (100 req/분)        |
| 500  | `INTERNAL_ERROR`    | 서버 오류                          |

**요청 제한 헤더:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
Retry-After: 60
```

---

#### 헬스 체크

```http
GET /health
```

서버의 상태를 확인합니다. 로드 밸런서, 모니터링 도구, CI/CD 파이프라인에서 서버 가용성을 체크하는 데 사용됩니다.

**요청 예시:**

```bash
curl http://localhost:5002/health
```

**성공 응답 (200):**

```json
{
  "status": "ok",
  "timestamp": "2025-11-26T12:34:56.789Z",
  "uptime": 123.456,
  "environment": "development"
}
```

**응답 필드:**

| 필드          | 타입   | 설명                                       |
| ------------- | ------ | ------------------------------------------ |
| `status`      | string | 서버 상태 (항상 `"ok"`)                    |
| `timestamp`   | string | 현재 서버 시간 (ISO 8601 형식)             |
| `uptime`      | number | 서버 가동 시간 (초)                        |
| `environment` | string | 실행 환경 (`development`, `production` 등) |

**사용 사례:**

- 🔍 **모니터링**: 서버 가용성 및 응답 시간 추적
- ⚖️ **로드 밸런서**: 헬스 체크를 통한 트래픽 라우팅
- 🚀 **CI/CD**: 배포 후 서버 정상 작동 확인
- 📊 **업타임 추적**: 서버 가동 시간 모니터링

---

### 미들웨어 스택

1. **보안 헤더** → XSS, Clickjacking 방어
2. **CORS** → Origin 검증
3. **요청 제한** → IP 기반 throttling
4. **본문 크기 제한** → DoS 방지
5. **요청 검증** → 입력 정제
6. **에러 핸들러** → 구조화된 에러 응답

---

## 🔒 보안 & 성능

### 보안 기능

#### 🛡️ 요청 제한

- **알고리즘**: Token Bucket
- **제한**: IP당 분당 100 요청
- **헤더**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`
- **메모리 관리**: 60초마다 자동 정리

#### 🔐 보안 헤더

- `X-Content-Type-Options: nosniff` - MIME 스니핑 방지
- `X-XSS-Protection: 1; mode=block` - XSS 보호
- `X-Frame-Options: DENY` - Clickjacking 방지
- `Strict-Transport-Security` - HTTPS 강제 (프로덕션)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` - 기능 제한

#### 📦 요청 보호

- **최대 본문 크기**: 5MB
- **응답**: HTTP 413 (Payload Too Large)
- **로깅**: 모니터링을 위한 크기 및 경로 기록

#### 🌐 CORS

- **개발**: 유연함 (기본값 `*`)
- **프로덕션**: 엄격한 화이트리스트 필수
- **검증**: 애플리케이션 시작 시 Origin 검증

### 성능 최적화

#### 📊 로깅

- **환경 기반 레벨**: Debug (개발) / Info (프로덕션)
- **우선순위 필터링**: 프로덕션에서 I/O 감소
- **구조화된 형식**: JSON 호환 컨텍스트

#### 💾 메모리 관리

- **Rate Limiter 정리**: 오래된 항목 제거 (2배 윈도우)
- **버전 캐싱**: 시작 시 Stylelint 버전 캐싱
- **효율적인 파싱**: 재사용 가능한 PostCSS 인스턴스

#### ⚡ 런타임

- **Bun**: Node.js보다 3배 빠름
- **Hot Reload**: 개발 중 즉시 업데이트
- **네이티브 테스팅**: 내장 테스트 러너

---

## 💻 개발

### 사용 가능한 스크립트

| 명령어               | 설명                                 |
| -------------------- | ------------------------------------ |
| `bun run dev`        | 개발 서버 시작 (HMR 활성화)          |
| `bun run serve`      | 개발 서버 시작 (dev와 동일)          |
| `bun run build`      | 프로덕션 빌드                        |
| `npm run lint`       | ESLint로 TypeScript/테스트 코드 검사 |
| `bun run test`       | 모든 테스트 실행                     |
| `bun run test:watch` | Watch 모드 테스팅                    |

### 개발 워크플로우

1. **서버 시작**

   ```bash
   bun run dev
   ```

2. **Watch 모드로 테스트 실행**

   ```bash
   bun run test:watch
   ```

3. **타입 체크**
   ```bash
   bun run typecheck
   ```

---

## 🐳 Docker 지원

### Docker 사용

**이미지 빌드:**

```bash
docker build -t mongmung-csslint:latest .
```

**컨테이너 실행:**

```bash
docker run -p 5002:5002 \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=https://your-domain.com \
  mongmung-csslint:latest
```

### Docker Compose 사용

**서비스 시작:**

```bash
docker-compose up -d
```

**서비스 중지:**

```bash
docker-compose down
```

**docker-compose.yml 예시:**

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - '5002:5002'
    environment:
      NODE_ENV: production
      CORS_ORIGIN: https://your-domain.com
      LOG_LEVEL: info
    restart: unless-stopped
```

---

## 🧪 테스트

### 테스트 실행

```bash
# 모든 테스트
bun test

# Watch 모드
bun test --watch

# 특정 파일
bun test tests/api.test.ts

# 커버리지 포함 (설정된 경우)
bun test --coverage
```

---

## 🔧 문제 해결

### 일반적인 문제

#### 포트가 이미 사용 중

```bash
# 5002 포트를 사용 중인 프로세스 찾기
lsof -i :5002

# 프로세스 종료
kill -9 <PID>

# 또는 다른 포트 사용
PORT=5003 bun run dev
```

#### CORS 에러

**문제**: 브라우저가 요청 차단

**해결책**: `CORS_ORIGIN`에 출처 추가

```bash
CORS_ORIGIN=http://localhost:3000
```

#### 프로덕션 시작 실패

**문제**: `CORS_ORIGIN is required in production`

**해결책**: 명시적인 출처 설정

```bash
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

#### 요청 제한 문제

**문제**: 429 Too Many Requests

**해결책**: 60초 대기 또는 `src/utils/rateLimiter.ts`에서 요청 제한 조정

#### HMR 개발 서버 (3000번 포트)

**설명**: 개발 모드에서 3000번 포트는 Elysia의 Hot Module Replacement(HMR) 기능을 위한 웹소켓 서버입니다. 코드 변경을 감지하고 자동으로 서버를 재시작하는 용도로 사용됩니다.

- **실제 API**: 5002번 포트에서 동작
- **HMR 통신**: 3000번 포트 (개발 모드에서만)
- **프로덕션**: 3000번 포트 사용 안 함

### 도움 받기

1. [이슈](https://github.com/bearholmes/mongmung_csslint_server/issues) 확인
2. 문의: [이슈 생성](https://github.com/bearholmes/mongmung_csslint_server/issues/new)

---

## 🤝 기여하기

기여를 환영합니다! 다음 가이드라인을 따라주세요:

### 기여 방법

1. **저장소 포크**
2. **기능 브랜치 생성**: `git checkout -b feature/amazing-feature`
3. **변경사항 커밋**: `git commit -m 'Add amazing feature'`
4. **브랜치에 푸시**: `git push origin feature/amazing-feature`
5. **Pull Request 열기**

---

## 📄 라이선스

이 프로젝트는 **MIT 라이선스** 하에 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

---

## 🔗 관련 프로젝트

- **웹 클라이언트**: [mongmung_csslint_fe](https://github.com/bearholmes/mongmung_csslint_fe) - React 기반 웹 인터페이스

---

<div align="center">

**bearholmes가 ❤️로 만들었습니다**

[⬆ 맨 위로](#-몽멍-css-린트)

</div>
