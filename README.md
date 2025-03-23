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
