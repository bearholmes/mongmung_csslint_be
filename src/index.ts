import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import figlet from 'figlet';
import { swagger } from '@elysiajs/swagger';
import { handleLintRequest } from './controllers/lintController';

const PORT = process.env.PORT ?? 5002;
const HOST = '0.0.0.0';

const app = new Elysia({
  serve: {
    hostname: HOST,
  },
});

// 미들웨어 설정
app.use(
  swagger({
    documentation: {
      info: {
        title: 'StyleLint Documentation',
        version: '2.0.0',
      },
      tags: [
        {
          name: 'StyleLint',
          description: 'StyleLint API',
        },
      ],
    },
    exclude: ['/'],
  }),
);

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

app.use(staticPlugin());

// 에러 핸들링
app.onError(({ code, error, set }) => {
  if (code === 'NOT_FOUND') {
    set.status = 404;
    return figlet.textSync('Not Found');
  }
});

// 라우트 설정
app.get('/favicon.ico', () => Bun.file('public/favicon.ico'));
app.get('/', () => figlet.textSync('Hello StyleLint!'));

// 린트 API 엔드포인트
app.post(
  '/api/lint',
  handleLintRequest,
  {
    type: 'json',
    body: t.Object({
      code: t.String(),
      syntax: t.String(),
      config: t.Object({}),
    }),
    detail: {
      tags: ['StyleLint'],
    },
  },
);

// 서버 시작
app.listen(PORT, ({ hostname, port }) => {
  console.info(`🦊 Running at http://${hostname}:${port}`);
});

export default app;
