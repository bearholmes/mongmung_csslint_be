import { lint } from 'stylelint';
import postHtml from 'posthtml';
import attrsSorter from 'posthtml-attrs-sorter';
import { createPatch } from 'diff';
import * as Diff2Html from 'diff2html';

class RetRes {
  constructor (res) {
    this.res = res;
    this.res.set('Content-Type', 'application/json');
  }
  success (json) {
    this.res.status(200).json(Object.assign(json, { success: true, message: 'ok' }));
  }
  fail (msg) {
    this.res.status(500).json({
      success: true,
      message: msg
    });
  }
}

export function report (req, res, next) {
  console.log('start');
  const ret = new RetRes(res);

  const config = req.body.config || '';
  if (!config) ret.fail('Could not parse stylelint config');

  // console.log(req.body.config)
  const opts = {
    code: req.body.code,
    config,
    syntax: req.body.syntax,
    fix: true
  };

  const htmlOrder = [
      'rel',
      'type',
      'href',
      'src',
      'width',
      'height',
      'target',
      'id',
      'name',
      'class',
      'style',
      'title',
      'alt',
      'placeholder',
      'role', 'aria-.+',
      'data-.+',
      '$unknown$'
    ]

  const codeDiff = (OriginCode, lintCode) => {
    let html = '';
    const diffText = createPatch('', OriginCode, lintCode, '', '');
    if (diffText.length > 88) {
      console.log('pretty');
      html = Diff2Html.html(diffText, {
        inputFormat: 'diff',
        showFiles: false,
        matching: 'lines',
        outputFormat: 'side-by-side'
      });
    };
    html = html.replace('<span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>', '<span class="d2h-tag d2h-changed d2h-changed-tag">비교</span></span>');
    return html;
  };

  const procPostHtml = (response) => {
    console.log('lint');
    if (req.body.syntax === 'html') {
      postHtml()
        .use(attrsSorter(htmlOrder))
        .process(response.output, {
          lowerCaseTags: true,
          lowerCaseAttributeNames: true,
          closingSingleTag: 'slash'
        })
        .then((result) => {
          console.log('diff', result.html.length);
          const diffHtml = codeDiff(opts.code, result.html);
          console.log('end');
          ret.success({
            warnings: response.results[0].warnings,
            output: result.html,
            diff: diffHtml
          });
        });
    } else {
      console.log('diff', response.output.length);
      const diffHtml = codeDiff(opts.code, response.output);
      console.log('end');
      ret.success({
        warnings: response.results[0].warnings,
        output: response.output,
        diff: diffHtml
      });
    }
  };

  lint(opts)
    .then(procPostHtml)
    .catch(err => {
      console.log('err :::' + err);
      ret.fail('lint failed');
    });
}
