import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import figlet from 'figlet';
import { swagger } from '@elysiajs/swagger';
import { handleLintRequest } from './controllers/lintController';

/**
 * 환경 변수
 */
const PORT = Number(process.env.PORT) || 5002;
const HOST = '0.0.0.0';
const isDev = process.env.NODE_ENV === 'development';

/**
 * Elysia 애플리케이션 초기화
 */
const app = new Elysia({
  serve: {
    hostname: HOST,
    port: PORT,
  },
  // 개발 환경에서만 HMR 활성화
  hot: isDev,
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
    exclude: ['/'],
  })
);

/**
 * CORS 설정
 * TODO: 프로덕션 환경에서는 특정 도메인으로 제한 필요
 */
app.use(
  cors({
    origin: '*',
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
  console.error('[App] Error:', {
    code,
    message: error.message,
    timestamp: new Date().toISOString(),
  });

  return {
    success: false,
    message: '서버 오류가 발생했습니다',
    error: isDev ? error.message : undefined,
  };
});

/**
 * 라우트 정의
 */

// Favicon
app.get('/favicon.ico', () => Bun.file('public/favicon.ico'));

// 헬스 체크 엔드포인트
app.get('/', () => figlet.textSync('Hello StyleLint!'));

// 린트 API 엔드포인트
app.post('/api/lint', handleLintRequest, {
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
app.listen(PORT, ({ hostname, port }) => {
  console.info(`🦊 Elysia server running at http://${hostname}:${port}`);
  console.info(`📚 Swagger documentation: http://${hostname}:${port}/swagger`);
  if (isDev) {
    console.info('🔥 Development mode with HMR enabled');
  }
});

export default app;
