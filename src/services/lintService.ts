import styleLint from 'stylelint';
import postcss from 'postcss';
import { LintOptions, LintResult, LintRequest } from '../types';
import { createStylelintConfig } from '../config/stylelint';
import { compactFormatter, nestedFormatter } from '../utils/formatters';

export class LintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LintError';
  }
}

export async function lintCode(request: LintRequest): Promise<LintResult> {
  const { code, syntax, config } = request;
  const { rules, outputStyle = '' } = config;

  // 유효성 검사
  if (!rules || (typeof rules === 'object' && Object.keys(rules).length < 1)) {
    throw new LintError('스타일린트 설정을 파싱할 수 없습니다');
  }
  
  if (!syntax || !['css', 'html'].includes(syntax)) {
    throw new LintError('스타일린트 문법을 파싱할 수 없습니다');
  }

  // 스타일린트 옵션 설정
  const stylelintConfig = createStylelintConfig(rules, syntax);
  const options: LintOptions = {
    code,
    config: stylelintConfig
  };

  try {
    // 스타일린트 실행
    const lintResult = await styleLint.lint(options);

    let formatOutput = '';
    // customSyntax가 설정된 경우, 해당 구문 파서를 사용하여 파싱
    if (syntax === 'html' || !outputStyle) {
      formatOutput = lintResult.output;
    } else {
      const root = postcss.parse(lintResult.output);

      // Formatter를 적용하여 결과를 변환
      if (outputStyle === 'nested') {
        formatOutput = nestedFormatter(root);
      } else {
        formatOutput = compactFormatter(root);
      }
    }

    // packageJson에서 버전 정보 가져오기
    const packageJson = require('../../package.json');
    const listVersion = packageJson.dependencies?.stylelint?.replace(/\^/gi, '') || '';

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
            extends: options.config.extends,
            plugins: options.config.plugins,
            customSyntax: options.config.customSyntax,
          },
        },
      },
    };
  } catch (err) {
    console.error(err);
    throw new LintError('린트 실행 중 오류가 발생했습니다');
  }
}
