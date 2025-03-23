import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import figlet from 'figlet';
import styleLint from 'stylelint';
import postcss from 'postcss';
// @ts-ignore
import { swagger } from '@elysiajs/swagger';

// @ts-ignore
import packageJson from './package.json';
import { compactFormatter, nestedFormatter } from './formatter.ts';
const listVersion = packageJson.dependencies?.stylelint?.replace(/\^/gi, '');

interface Config {
  extends: string[];
  fix: boolean;
  plugins: string[];
  rules: Record<string, any>;
  customSyntax?: string;
}

interface Options {
  code: string;
  config: Config;
}

new Elysia({
  serve: {
    hostname: '0.0.0.0',
  },
})
  .use(
    // /swagger
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
  )
  .use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  )
  .use(staticPlugin())
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return figlet.textSync('Not Found');
    }
  })
  .get('/favicon.ico', () => Bun.file('public/favicon.ico'))
  .get('/', () => figlet.textSync('Hello StyleLint!'))
  .post(
    '/api/lint',
    async ({ body, set }) => {
      try {
        const syntax: string = body.syntax;

        const { rules, outputStyle = '' }: any = body.config || {};
        if (
          !rules ||
          (typeof rules === 'object' && Object.keys(rules).length < 1)
        ) {
          // 스타일린트 설정을 파싱할 수 없을 때
          set.status = 400;
          return {
            success: false,
            message: '스타일린트 설정을 파싱할 수 없습니다',
            content: null,
          };
        } else if (!syntax || !['css', 'html'].includes(syntax)) {
          // 스타일린트 문법을 파싱할 수 없을 때
          set.status = 400;
          return {
            success: false,
            message: '스타일린트 문법을 파싱할 수 없습니다',
            content: null,
          };
        }

        // 스타일린트 옵션 설정
        const opts: Options = {
          code: body.code,
          config: {
            extends: [
              'stylelint-config-standard',
              'stylelint-config-recommended-scss',
              'stylelint-config-recommended-vue',
            ],
            fix: true,
            plugins: ['stylelint-order', 'stylelint-stylistic'],
            rules: {
              ...rules,
            },
          },
        };

        if (syntax === 'html') {
          opts.config.customSyntax = 'postcss-html';
        }

        // 스타일린트 실행
        const lintResult = await styleLint.lint(opts);

        let formatOutput = '';
        // customSyntax가 설정된 경우, 해당 구문 파서를 사용하여 파싱
        if (syntax === 'html' || !outputStyle) {
          formatOutput = lintResult.output;
        } else {
          const root = postcss.parse(lintResult.output); // CSS만 포함된 경우 기본 파서 사용

          // Formatter를 적용하여 결과를 변환
          if (outputStyle === 'nested') {
            formatOutput = nestedFormatter(root);
          } else {
            formatOutput = compactFormatter(root);
          }
        }

        // 성공적인 결과 반환
        return {
          success: true,
          message: '성공',
          content: {
            warnings: lintResult.results[0].warnings,
            output: formatOutput,
            info: {
              version: listVersion,
              config: {
                extends: opts.config.extends,
                plugins: opts.config.plugins,
                customSyntax: opts.config.customSyntax,
              },
            },
          },
        };
      } catch (err) {
        // 오류 처리
        console.error(err);
        set.status = 400;
        return {
          success: false,
          message: '린트 실패',
          content: null,
        };
      }
    },
    {
      // Short form of application/json
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
  )
  .listen(process.env.PORT ?? 5002, ({ hostname, port }) => {
    console.info(`🦊 Running at http://${hostname}:${port}`);
  });
