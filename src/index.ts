import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import figlet from 'figlet';
import { swagger } from '@elysiajs/swagger';
import { handleLintRequest } from './controllers/lintController';
import { env } from './config/env';
import { logger } from './utils/logger';
import { API_ROUTES, MESSAGES } from './constants';

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
