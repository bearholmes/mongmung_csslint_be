import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import figlet from 'figlet';
import postHtml from 'posthtml';
import { lint } from 'stylelint';
import attrsSorter from 'posthtml-attrs-sorter';
import { swagger } from '@elysiajs/swagger';

import { codeDiff, htmlOrder } from './lint.ts';

const app = new Elysia({})
  .use(
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
        const config = body.config;

        if (
          (typeof config === 'object' && Object.keys(config).length < 1) ||
          !config
        ) {
          set.status = 400;
          return {
            success: false,
            message: 'Could not parse stylelint config',
            lint: null,
          };
        }

        const opts = {
          code: body.code,
          config,
          syntax: body.syntax,
          fix: true,
        };

        const lintResult = await lint(opts);

        if (body.syntax === 'html') {
          const htmlResult = await postHtml()
            .use(attrsSorter(htmlOrder))
            .process(lintResult.output, {
              lowerCaseTags: true,
              lowerCaseAttributeNames: true,
              closingSingleTag: 'slash',
            })
            .then((result) => result.html);
          const diffHtml = codeDiff(opts.code, htmlResult);
          return {
            success: true,
            message: 'ok',
            lint: {
              warnings: lintResult.results[0].warnings,
              output: htmlResult,
              diff: diffHtml,
            },
          };
        } else {
          const diffHtml = codeDiff(opts.code, lintResult.output);
          return {
            success: true,
            message: 'ok',
            lint: {
              warnings: lintResult.results[0].warnings,
              output: lintResult.output,
              diff: diffHtml,
            },
          };
        }
      } catch (err) {
        console.error(err);
        set.status = 400;
        return {
          success: false,
          message: 'lint failed',
          lint: null,
        };
      }
    },
    {
      // Short form of application/json
      type: 'json',
      body: t.Object({
        code: t.String(),
        config: t.Object({}),
        syntax: t.String(),
      }),
      detail: {
        tags: ['StyleLint'],
      },
    },
  )
  .listen(5002);

console.log(`🦊 Elysia is running at on port ${app.server?.port}...`);
