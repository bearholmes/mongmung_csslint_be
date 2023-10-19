import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import figlet from 'figlet';
import styleLint from 'stylelint';
// @ts-ignore
import { swagger } from '@elysiajs/swagger';

import packageJson from './package.json';
const listVersion = packageJson.dependencies?.stylelint?.replace(/\^/gi, '');

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
        // console.log(body, 'body')
        const { rules = {} } = <any>body.config;
        console.log(body.config, 'config');

        if (
          (typeof rules === 'object' && Object.keys(rules).length < 1) ||
          !rules
        ) {
          set.status = 400;
          return {
            success: false,
            message: 'Could not parse stylelint config',
            content: null,
          };
        }

        const opts = {
          code: body.code,
          config: {
            customSyntax: 'postcss-html',
            extends: [
              'stylelint-config-standard',
              'stylelint-config-recommended-scss',
              'stylelint-config-recommended-vue',
            ],
            fix: true,
            plugins: ['stylelint-order'],
            rules: {
              ...rules,
            },
          },
        };

        const lintResult = await styleLint.lint(opts);

        // console.log(lintResult, 'lintResult');

        return {
          success: true,
          message: 'ok',
          content: {
            warnings: lintResult.results[0].warnings,
            output: lintResult.output,
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
        console.error(err);
        set.status = 400;
        return {
          success: false,
          message: 'lint failed',
          content: null,
        };
      }
    },
    {
      // Short form of application/json
      type: 'json',
      body: t.Object({
        code: t.String(),
        config: t.Object({}),
      }),
      detail: {
        tags: ['StyleLint'],
      },
    },
  )
  .listen(process.env.PORT ?? 5000, ({ hostname, port }) => {
    console.log(`🦊 Running at http://${hostname}:${port}`);
  });
