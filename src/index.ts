import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import figlet from 'figlet';
import { swagger } from '@elysiajs/swagger';
import { handleLintRequest } from './controllers/lintController';
import { env } from './config/env';
import { logger } from './utils/logger';
import { rateLimiter } from './utils/rateLimiter';
import { API_ROUTES, MESSAGES, SERVER_CONFIG, HTTP_STATUS } from './constants';

/**
 * Elysia 애플리케이션 초기화
 */
const app = new Elysia({
  serve: {
    hostname: env.HOST,
    port: env.PORT,
  },
  // 개발 환경에서만 HMR 활성화
  hot: env.isDev,
});

/**
 * Swagger 문서화 설정
 */
app.use(
  swagger({
    documentation: {
      info: {
        title: 'StyleLint API Documentation',
        version: '3.0.0',
        description: 'CSS 코드 품질 검사를 위한 RESTful API',
      },
      tags: [
        {
          name: 'Lint',
          description: 'CSS 린팅 관련 API',
        },
      ],
    },
    exclude: [API_ROUTES.ROOT],
  })
);

/**
 * 보안 헤더 미들웨어
 * XSS, Clickjacking 등의 공격 방어
 */
app.onAfterHandle(({ set }) => {
  set.headers = {
    ...set.headers,
    // XSS 방어
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    // Clickjacking 방어
    'X-Frame-Options': 'DENY',
    // HTTPS 강제 (프로덕션에서만)
    ...(env.isDev
      ? {}
      : {
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        }),
    // Referrer 정책
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Permissions Policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
});

/**
 * CORS 설정
 * - 개발 환경: 기본값 '*' (모든 도메인 허용)
 * - 프로덕션: 환경 변수로 명시적 도메인 제한
 * - 환경 변수: CORS_ORIGIN (단일 도메인 또는 쉼표로 구분된 여러 도메인)
 *
 * @example
 * CORS_ORIGIN=https://example.com
 * CORS_ORIGIN=https://example.com,https://api.example.com
 */
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

/**
 * 정적 파일 제공 설정
 */
app.use(staticPlugin());

/**
 * Rate Limiting 미들웨어
 * API 남용 방지를 위한 요청 제한 (1분에 100 요청)
 */
app.onBeforeHandle(({ request, set }) => {
  // 클라이언트 IP 식별
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Rate limit 확인
  if (!rateLimiter.consume(clientIp)) {
    set.status = 429; // Too Many Requests
    const remaining = rateLimiter.remaining(clientIp);
    set.headers = {
      ...set.headers,
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': String(remaining),
      'Retry-After': '60',
    };

    logger.warn('Rate limit exceeded', {
      clientIp,
      path: new URL(request.url).pathname,
    });

    return {
      success: false,
      message: '요청 제한을 초과했습니다. 잠시 후 다시 시도해주세요.',
      content: null,
    };
  }

  // Rate limit 헤더 추가
  const remaining = rateLimiter.remaining(clientIp);
  set.headers = {
    ...set.headers,
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': String(remaining),
  };
});

/**
 * Body Size Limit 미들웨어
 * DoS 공격 및 메모리 과다 사용 방지를 위해 요청 본문 크기 제한
 */
app.onBeforeHandle(({ request, set }) => {
  const contentLength = request.headers.get('content-length');

  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > SERVER_CONFIG.MAX_BODY_SIZE) {
      set.status = HTTP_STATUS.PAYLOAD_TOO_LARGE;
      logger.warn('Request body too large', {
        size,
        maxSize: SERVER_CONFIG.MAX_BODY_SIZE,
        path: new URL(request.url).pathname,
      });
      return {
        success: false,
        message: `요청 본문 크기가 너무 큽니다. 최대 ${SERVER_CONFIG.MAX_BODY_SIZE / 1024 / 1024}MB까지 허용됩니다.`,
        content: null,
      };
    }
  }
});

/**
 * 전역 에러 핸들러
 */
app.onError(({ code, error, set }) => {
  if (code === 'NOT_FOUND') {
    set.status = 404;
    return figlet.textSync('Not Found');
  }

  // 기타 에러는 기본 처리
  logger.error('Application error', {
    code,
    message: error.message,
    stack: env.isDev ? error.stack : undefined,
  });

  return {
    success: false,
    message: MESSAGES.SERVER_ERROR,
    error: env.isDev ? error.message : undefined,
  };
});

/**
 * 라우트 정의
 */

// Favicon
app.get(API_ROUTES.FAVICON, () => Bun.file('public/favicon.ico'));

// 헬스 체크 엔드포인트
app.get(API_ROUTES.ROOT, () => figlet.textSync('Hello StyleLint!'));

// 린트 API 엔드포인트
app.post(API_ROUTES.LINT, handleLintRequest, {
  type: 'json',
  body: t.Object({
    code: t.String({
      description: '린트할 CSS 코드',
      minLength: 1,
    }),
    syntax: t.String({
      description: 'CSS 문법 타입 (css 또는 html)',
    }),
    config: t.Object({
      rules: t.Record(
        t.String(),
        t.Any({
          description: 'Stylelint 규칙 값',
        })
      ),
      outputStyle: t.Optional(
        t.String({
          description: '출력 포맷 스타일 (compact 또는 nested)',
        })
      ),
    }),
  }),
  detail: {
    tags: ['Lint'],
    summary: 'CSS 코드 린팅',
    description: 'CSS 코드를 분석하고 Stylelint 규칙에 따라 자동 수정 및 경고를 반환합니다.',
  },
});

/**
 * 서버 시작
 */
app.listen(env.PORT, ({ hostname, port }) => {
  logger.info(`Elysia server running at http://${hostname}:${port}`);
  logger.info(`Swagger documentation: http://${hostname}:${port}${API_ROUTES.SWAGGER}`);
  if (env.isDev) {
    logger.info('Development mode with HMR enabled');
  }
});

export default app;
