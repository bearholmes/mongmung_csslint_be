# mongmung_csslint_be 프로젝트 가이드

## 프로젝트 개요

### 목적

CSS 코드 품질 검사를 위한 백엔드 API 서비스입니다. Stylelint를 기반으로 CSS 코드를 분석하고, 자동 수정 및 다양한 출력 형식을 제공합니다.

---

## 기술 스택

### 런타임 및 언어

- **런타임**: [Bun](https://bun.sh) v1.0.3 이상
  - JavaScript/TypeScript를 위한 고성능 올인원 런타임
  - 빠른 패키지 설치 및 실행 속도
- **언어**: TypeScript 5.0+
  - ESNext 모듈 시스템 사용
  - 엄격한 타입 체크 활성화

### 웹 프레임워크

- **Elysia** v0.7.15
  - Bun에 최적화된 경량 웹 프레임워크
  - 타입 안전성 제공
  - HMR(Hot Module Replacement) 지원

### 주요 의존성

- **stylelint** v15.11.0 - CSS 린팅 엔진
- **postcss** v8.4.31 - CSS 파싱 및 변환
- **postcss-html** v1.5.0 - HTML 내 CSS 파싱
- **@elysiajs/cors** v0.7.1 - CORS 미들웨어
- **@elysiajs/swagger** v0.7.3 - API 문서화
- **@elysiajs/static** v0.7.1 - 정적 파일 제공

### Stylelint 설정

- **stylelint-config-standard** - 표준 CSS 규칙
- **stylelint-config-recommended-scss** - SCSS 규칙
- **stylelint-config-recommended-vue** - Vue 규칙
- **stylelint-order** - CSS 속성 정렬 규칙
- **stylelint-stylistic** - 스타일 관련 규칙

---

## 프로젝트 구조

```
mongmung_csslint_be/
├── src/                          # 소스 코드 디렉토리
│   ├── index.ts                  # 애플리케이션 진입점
│   ├── types/                    # TypeScript 타입 정의
│   │   └── index.ts              # 인터페이스 및 타입 정의
│   ├── config/                   # 설정 파일
│   │   └── stylelint.ts          # Stylelint 기본 설정
│   ├── controllers/              # 컨트롤러 (요청 처리)
│   │   └── lintController.ts     # 린트 요청 핸들러
│   ├── services/                 # 비즈니스 로직
│   │   └── lintService.ts        # 린트 실행 서비스
│   └── utils/                    # 유틸리티 함수
│       └── formatters.ts         # CSS 포맷터 (compact/nested)
├── public/                       # 정적 파일 (favicon 등)
├── dist/                         # 빌드 출력 디렉토리
├── package.json                  # 프로젝트 메타데이터 및 의존성
├── tsconfig.json                 # TypeScript 설정
├── dockerfile                    # Docker 이미지 정의
├── docker-compose.yml            # Docker Compose 설정
├── .gitignore                    # Git 무시 파일 목록
├── .prettierrc                   # Prettier 포맷팅 설정
├── .bunfig.toml                  # Bun 설정
└── README.md                     # 프로젝트 문서
```

---

## 핵심 컴포넌트 분석

### 1. 진입점 (`src/index.ts`)

**주요 기능:**

- Elysia 애플리케이션 초기화
- 미들웨어 설정 (CORS, Swagger, 정적 파일)
- 라우트 정의
- 에러 핸들링
- 서버 시작

**환경 설정:**

- `PORT`: 서버 포트 (기본값: 5002)
- `HOST`: 바인딩 호스트 (0.0.0.0)
- `NODE_ENV`: 환경 모드 (development 시 HMR 활성화)

**주요 엔드포인트:**

- `GET /` - 헬스 체크 (ASCII 아트 반환)
- `POST /api/lint` - CSS 린팅 API
- `GET /swagger` - API 문서
- `GET /favicon.ico` - 파비콘

### 2. 타입 정의 (`src/types/index.ts`)

**주요 인터페이스:**

```typescript
// Stylelint 설정 타입
StylelintConfig {
  extends: string[]          // 확장할 설정
  fix: boolean               // 자동 수정 여부
  plugins: string[]          // 사용할 플러그인
  rules: Record<string, any> // 린트 규칙
  customSyntax?: string      // 커스텀 파서
}

// 린트 요청 타입
LintRequest {
  code: string               // 린트할 CSS 코드
  syntax: string             // 'css' 또는 'html'
  config: {
    rules: Record<string, any>  // 린트 규칙
    outputStyle?: string        // 'nested' 또는 'compact'
  }
}

// 린트 결과 타입
LintResult {
  success: boolean
  message: string
  content: {
    warnings: any[]          // 경고 목록
    output: string           // 수정된 CSS 코드
    info: {
      version: string        // Stylelint 버전
      config: {...}          // 사용된 설정
    }
  } | null
}
```

### 3. 설정 관리 (`src/config/stylelint.ts`)

**기본 확장 설정:**

- `stylelint-config-standard`
- `stylelint-config-recommended-scss`
- `stylelint-config-recommended-vue`

**기본 플러그인:**

- `stylelint-order` - 속성 정렬
- `stylelint-stylistic` - 스타일 규칙

**동적 설정 생성:**

- HTML 문법인 경우 `postcss-html` 파서 자동 설정

### 4. 비즈니스 로직 (`src/services/lintService.ts`)

**주요 함수:**

- `lintCode(request: LintRequest): Promise<LintResult>`

**처리 흐름:**

1. 입력 유효성 검사 (rules, syntax)
2. Stylelint 설정 생성
3. Stylelint 실행
4. 결과 포맷팅 (outputStyle에 따라)
5. 메타데이터 포함하여 결과 반환

**에러 처리:**

- `LintError` 커스텀 에러 클래스 사용
- 유효성 검사 실패 시 명확한 에러 메시지

### 5. 컨트롤러 (`src/controllers/lintController.ts`)

**주요 함수:**

- `handleLintRequest({ body, set }): Promise<LintResult>`

**책임:**

- HTTP 요청을 서비스 레이어로 전달
- 에러를 HTTP 응답으로 변환
  - `LintError` → 400 Bad Request
  - 기타 에러 → 500 Internal Server Error

### 6. 포맷터 (`src/utils/formatters.ts`)

**Compact Formatter:**

```css
.selector {
  property: value;
  property2: value2;
}
```

- 모든 속성을 한 줄에 표시
- 공간 효율적
- 빠른 스캔 가능

**Nested Formatter:**

```css
.selector {
  property: value;
  property2: value2;
}
```

- 계층 구조를 들여쓰기로 표현
- 가독성 높음
- 복잡한 구조에 적합

**특수 처리:**

- `@keyframes` 중복 출력 방지
- `@charset` 하드코딩 (`"utf-8"`)
- `@media` 쿼리 지원
- 주석 보존

---

## 개발 환경 설정

### 필수 요구사항

- **Node.js**: 16 이상
- **npm**: 8 이상
- **Bun**: 1.0.3 이상 (권장)

### 설치 방법

1. **의존성 설치:**

   ```bash
   bun install
   ```

2. **개발 서버 실행:**

   ```bash
   # 표준 개발 모드
   bun run dev

   # HMR 활성화 모드
   bun run serve
   ```

3. **빌드:**

   ```bash
   bun run build
   ```

4. **프로덕션 실행:**
   ```bash
   bun run start
   ```

### 환경 변수

| 변수       | 기본값 | 설명                               |
| ---------- | ------ | ---------------------------------- |
| `PORT`     | 5002   | 서버 포트                          |
| `NODE_ENV` | -      | 환경 모드 (development/production) |

---

## Docker 지원

### Dockerfile 구성

```dockerfile
FROM oven/bun:slim
WORKDIR /app
# 의존성 설치
COPY package*.json bun.lockb ./
RUN bun install
# 소스 복사
COPY . .
# 개발 모드 실행
CMD ["bun", "run", "dev"]
```

### Docker Compose

```yaml
services:
  app:
    build: .
    container_name: stylelint-be
    environment:
      - PORT=8080
    ports:
      - '5002:8080'
```

**실행 방법:**

```bash
# 이미지 빌드 및 실행
docker-compose up

# 또는 직접 빌드
docker build -t mongmung-csslint .
docker run -p 5002:8080 -e PORT=8080 mongmung-csslint
```

---

## API 사용 가이드

### POST /api/lint

**요청 예시:**

```bash
curl -X POST http://localhost:5002/api/lint \
  -H "Content-Type: application/json" \
  -d '{
    "code": "body { color: #FFF; background: red; }",
    "syntax": "css",
    "config": {
      "rules": {
        "color-hex-case": "lower",
        "color-named": "never"
      },
      "outputStyle": "nested"
    }
  }'
```

**응답 예시:**

```json
{
  "success": true,
  "message": "성공",
  "content": {
    "warnings": [
      {
        "line": 1,
        "column": 16,
        "rule": "color-hex-case",
        "severity": "error",
        "text": "Expected \"#FFF\" to be \"#fff\""
      },
      {
        "line": 1,
        "column": 34,
        "rule": "color-named",
        "severity": "error",
        "text": "Unexpected named color \"red\""
      }
    ],
    "output": "body {\n  background: red;\n  color: #fff;\n}",
    "info": {
      "version": "15.11.0",
      "config": {
        "extends": [
          "stylelint-config-standard",
          "stylelint-config-recommended-scss",
          "stylelint-config-recommended-vue"
        ],
        "plugins": ["stylelint-order", "stylelint-stylistic"]
      }
    }
  }
}
```

### 지원 문법

- `css` - 순수 CSS
- `html` - HTML 내 `<style>` 태그

### 출력 스타일

- `compact` - 한 줄 형식
- `nested` - 들여쓰기 형식 (기본값)

---

## 코드 품질 및 포맷팅

### TypeScript 설정

- **타겟**: ESNext
- **모듈**: ESNext
- **엄격 모드**: 활성화
- **타입 체크**: skipLibCheck 제외 전체 체크

### Prettier 설정

프로젝트에 `.prettierrc` 파일 존재

**코드 포맷팅:**

```bash
bun run format
```

---

## 주요 개발 포인트

### 1. 에러 핸들링 전략

- 비즈니스 로직 에러: `LintError` 클래스
- 유효성 검사 실패: 400 응답
- 예상치 못한 에러: 500 응답, 콘솔 로깅

### 2. 보안 고려사항

- CORS 설정: 모든 origin 허용 (`*`)
  - **주의**: 프로덕션에서는 특정 도메인으로 제한 권장
- 입력 유효성 검사: syntax, rules 검증

### 3. 성능 최적화

- Bun 런타임 사용으로 빠른 실행
- HMR 지원으로 개발 생산성 향상
- PostCSS를 통한 효율적인 CSS 파싱

### 4. 확장 가능성

- 모듈화된 구조 (controllers, services, utils 분리)
- 타입 정의를 통한 타입 안전성
- 설정 파일 분리로 커스터마이징 용이

---

## 일반적인 작업 시나리오

### 새로운 린트 규칙 추가

1. `src/config/stylelint.ts`에서 `DEFAULT_EXTENDS` 또는 `DEFAULT_PLUGINS` 수정
2. 필요시 `package.json`에 새로운 플러그인 추가
3. `bun install` 실행

### 새로운 포맷터 추가

1. `src/utils/formatters.ts`에 새로운 포맷터 함수 작성
2. `src/services/lintService.ts`에서 outputStyle 분기 추가

### 새로운 API 엔드포인트 추가

1. `src/controllers/`에 새로운 컨트롤러 생성
2. `src/services/`에 비즈니스 로직 구현
3. `src/index.ts`에 라우트 등록
4. Swagger 스키마 추가

### 환경별 설정 분리

1. `.env` 파일 생성 (현재 미사용)
2. `src/index.ts`에서 환경 변수 로드
3. `.gitignore`에 `.env` 추가

---

## 트러블슈팅

### Bun이 설치되지 않은 경우

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 포트 충돌 시

```bash
# 환경 변수로 포트 변경
PORT=3000 bun run dev
```

### Docker 빌드 실패 시

```bash
# 캐시 무시하고 재빌드
docker-compose build --no-cache
```

### TypeScript 에러 발생 시

```bash
# 타입 정의 재설치
bun install
```

---

## 다음 단계

### AI 개발자를 위한 권장 작업

1. **테스트 작성**: 현재 테스트 코드가 없음
   - `bun:test` 프레임워크 활용
   - 각 서비스 및 컨트롤러 단위 테스트

2. **로깅 시스템 개선**:
   - 구조화된 로깅 라이브러리 도입 (예: pino)
   - 요청/응답 로깅 미들웨어

3. **환경 변수 관리**:
   - `.env` 파일 지원 추가
   - 환경별 설정 분리

4. **에러 응답 표준화**:
   - 일관된 에러 응답 형식
   - 에러 코드 체계 정립

5. **성능 모니터링**:
   - 응답 시간 측정
   - 메모리 사용량 모니터링

6. **보안 강화**:
   - CORS origin 제한
   - Rate limiting 추가
   - 입력 sanitization

7. **문서화 개선**:
   - Swagger 스키마 상세화
   - 사용 예시 추가
   - 에러 케이스 문서화

---

## 참고 자료

- [Bun 공식 문서](https://bun.sh/docs)
- [Elysia 공식 문서](https://elysiajs.com)
- [Stylelint 공식 문서](https://stylelint.io)
- [PostCSS 공식 문서](https://postcss.org)
- [TypeScript 공식 문서](https://www.typescriptlang.org)

