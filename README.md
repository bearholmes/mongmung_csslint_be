# mongmung_csslint_be

CSS 코드 품질 검사를 위한 백엔드 서비스입니다. Stylelint를 기반으로 CSS 코드를 분석하고 개선된
결과를 제공합니다.

## 기능

- CSS 코드 린팅 (일반 CSS 및 HTML 내 CSS 지원)
- 다양한 출력 형식 지원 (compact, nested)
- Stylelint 규칙 커스터마이징 가능
- RESTful API 제공
- Swagger를 통한 API 문서화

## 기술 스택

- **런타임**: [Bun](https://bun.sh) v1.0.3
- **웹 프레임워크**: [Elysia](https://elysiajs.com/)
- **린터**: [Stylelint](https://stylelint.io/)
- **CSS 처리**: [PostCSS](https://postcss.org/)

## 프로젝트 구조

```
/src
  /config       - 애플리케이션 설정
  /controllers  - 요청 처리 및 응답 생성
  /services     - 비즈니스 로직 (린트 기능)
  /utils        - 유틸리티 함수 (포맷터 등)
  /types        - 타입 정의
  index.ts      - 진입점
```

## 설치

의존성 설치:

```bash
bun install
```

## 환경 변수 설정

프로젝트는 환경 변수를 통해 설정을 관리합니다. 개발을 시작하기 전에 환경 변수 파일을 설정하세요.

### 환경 변수 파일 생성

```bash
cp .env.example .env
```

### 주요 환경 변수

| 변수 | 설명 | 기본값 | 필수 여부 |
|------|------|--------|----------|
| `PORT` | 서버 포트 | `5002` | 선택 |
| `HOST` | 서버 호스트 | `0.0.0.0` | 선택 |
| `NODE_ENV` | Node 환경 (development/production/test) | `development` | 선택 |
| `CORS_ORIGIN` | CORS 허용 Origin | `*` (개발), 필수 (프로덕션) | 프로덕션에서 필수 |

### CORS 설정

CORS(Cross-Origin Resource Sharing) 설정은 보안을 위해 환경에 따라 다르게 동작합니다:

**개발 환경 (NODE_ENV=development)**
- 기본값: `*` (모든 도메인 허용)
- `CORS_ORIGIN` 미설정 시 자동으로 `*` 적용

**프로덕션 환경 (NODE_ENV=production)**
- `CORS_ORIGIN` 환경 변수 **필수**
- 명시적으로 허용할 도메인을 설정해야 함

**단일 도메인 허용:**
```bash
CORS_ORIGIN=https://example.com
```

**여러 도메인 허용 (쉼표로 구분):**
```bash
CORS_ORIGIN=https://example.com,https://api.example.com,https://admin.example.com
```

**개발 환경 예시:**
```bash
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**프로덕션 환경 예시:**
```bash
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

⚠️ **주의사항:**
- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션 환경에서는 반드시 특정 도메인으로 제한하세요
- `CORS_ORIGIN`을 설정하지 않으면 프로덕션 환경에서 서버 시작이 실패합니다

## 실행

개발 모드로 실행:

```bash
bun run dev
```

또는 HMR(Hot Module Replacement)을 사용하여 실행:

```bash
bun run serve
```

빌드:

```bash
bun run build
```

## API 엔드포인트

### `GET /`

서버 상태 확인을 위한 간단한 "Hello StyleLint!" 메시지를 반환합니다.

### `POST /api/lint`

CSS 코드를 분석하고 린트 결과를 반환합니다.

#### 요청 형식

```json
{
  "code": "your css code here",
  "syntax": "css",
  "config": {
    "rules": {
      "color-hex-case": "lower"
    },
    "outputStyle": "nested"
  }
}
```

- `code`: 분석할 CSS 코드
- `syntax`: 'css' 또는 'html' (HTML 내 CSS 코드 분석 시)
- `config`: 
  - `rules`: Stylelint 규칙 객체
  - `outputStyle`: 'nested' 또는 'compact' (기본값은 compact)

#### 응답 형식

```json
{
  "success": true,
  "message": "성공",
  "content": {
    "warnings": [],
    "output": "formatted css code",
    "info": {
      "version": "15.11.0",
      "config": {
        "extends": ["stylelint-config-standard", "..."],
        "plugins": ["stylelint-order", "..."],
        "customSyntax": "postcss-html"
      }
    }
  }
}
```

### `GET /swagger`

API 문서 UI를 제공합니다.

## 포맷팅 스타일

### Compact Format

모든 속성을 한 줄에 표시합니다:

```css
.selector { property: value; property2: value2; }
```

### Nested Format

계층 구조를 들여쓰기로 표현합니다:

```css
.selector {
  property: value;
  property2: value2;
}
```

## 도커 지원

도커 이미지 빌드:

```bash
docker build -t mongmung-csslint .
```

또는 docker-compose 사용:

```bash
docker-compose up
```

## API 테스트

curl을 사용한 API 테스트:

```bash
curl -X POST http://localhost:5002/api/lint \
  -H "Content-Type: application/json" \
  -d '{"code": "body{color:red}", "syntax": "css", "config": {"rules": {"color-hex-case": "lower"}, "outputStyle": "nested"}}'
```
