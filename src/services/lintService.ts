import styleLint from 'stylelint';
import postcss from 'postcss';
import {
  LintOptions,
  LintResult,
  LintRequest,
  CssSyntax,
  OutputStyle,
  StylelintWarning,
} from '../types';
import { createStylelintConfig } from '../config/stylelint';
import { compactFormatter, nestedFormatter } from '../utils/formatters';
import packageJson from '../../package.json';

/**
 * Stylelint 버전 (package.json에서 추출, 캐싱)
 */
const STYLELINT_VERSION = packageJson.dependencies?.stylelint?.replace(/\^|~|>=?/g, '') || 'unknown';

/**
 * 유효한 CSS 문법 목록
 */
const VALID_SYNTAXES: readonly CssSyntax[] = ['css', 'html'];

/**
 * 유효한 출력 스타일 목록
 */
const VALID_OUTPUT_STYLES: readonly OutputStyle[] = ['compact', 'nested'];

/**
 * 린트 에러 클래스
 * 사용자 입력 오류 및 린트 실행 오류를 표현
 */
export class LintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LintError';
    // 스택 트레이스 캡처 (V8 엔진 최적화)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LintError);
    }
  }
}

/**
 * 린트 요청 유효성 검증
 *
 * @param request - 검증할 린트 요청 객체
 * @throws {LintError} 유효하지 않은 입력 시
 */
function validateLintRequest(request: LintRequest): void {
  const { code, syntax, config } = request;

  // 코드 검증
  if (typeof code !== 'string') {
    throw new LintError('CSS 코드는 문자열이어야 합니다');
  }

  if (code.trim().length === 0) {
    throw new LintError('CSS 코드가 비어있습니다');
  }

  // 문법 검증
  if (!VALID_SYNTAXES.includes(syntax)) {
    throw new LintError(
      `지원하지 않는 문법입니다. 사용 가능한 문법: ${VALID_SYNTAXES.join(', ')}`
    );
  }

  // 규칙 검증
  if (!config.rules || typeof config.rules !== 'object') {
    throw new LintError('린트 규칙은 객체여야 합니다');
  }

  if (Object.keys(config.rules).length === 0) {
    throw new LintError('최소 하나 이상의 린트 규칙이 필요합니다');
  }

  // 출력 스타일 검증 (선택적)
  if (
    config.outputStyle &&
    !VALID_OUTPUT_STYLES.includes(config.outputStyle as OutputStyle)
  ) {
    throw new LintError(
      `지원하지 않는 출력 스타일입니다. 사용 가능한 스타일: ${VALID_OUTPUT_STYLES.join(', ')}`
    );
  }
}

/**
 * Stylelint 결과에서 경고 목록을 안전하게 추출
 *
 * @param lintResult - Stylelint 실행 결과
 * @returns 경고 목록 (없으면 빈 배열)
 */
function extractWarnings(lintResult: styleLint.LintResult): StylelintWarning[] {
  if (!lintResult.results || lintResult.results.length === 0) {
    return [];
  }

  const firstResult = lintResult.results[0];
  if (!firstResult.warnings || !Array.isArray(firstResult.warnings)) {
    return [];
  }

  return firstResult.warnings as StylelintWarning[];
}

/**
 * CSS 출력 포맷팅
 *
 * @param lintedCode - Stylelint로 수정된 CSS 코드
 * @param outputStyle - 출력 스타일 ('compact' | 'nested')
 * @param syntax - CSS 문법 타입
 * @returns 포맷팅된 CSS 문자열
 * @throws {LintError} 파싱 오류 시
 */
function formatOutput(
  lintedCode: string,
  outputStyle: OutputStyle | undefined,
  syntax: CssSyntax
): string {
  // HTML 문법이거나 출력 스타일이 지정되지 않은 경우 원본 반환
  if (syntax === 'html' || !outputStyle) {
    return lintedCode;
  }

  try {
    const root = postcss.parse(lintedCode);

    if (outputStyle === 'nested') {
      return nestedFormatter(root);
    } else {
      return compactFormatter(root);
    }
  } catch (error) {
    throw new LintError(
      `CSS 파싱 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * CSS 코드 린트 실행
 *
 * @param request - 린트 요청 객체
 * @returns 린트 결과 (성공/실패, 경고, 포맷팅된 코드 포함)
 * @throws {LintError} 입력 유효성 검사 실패 또는 린트 실행 오류 시
 *
 * @example
 * ```typescript
 * const result = await lintCode({
 *   code: 'body { color: #FFF; }',
 *   syntax: 'css',
 *   config: {
 *     rules: { 'color-hex-case': 'lower' },
 *     outputStyle: 'nested'
 *   }
 * });
 * ```
 */
export async function lintCode(request: LintRequest): Promise<LintResult> {
  // 입력 유효성 검증
  validateLintRequest(request);

  const { code, syntax, config } = request;
  const { rules, outputStyle } = config;

  // Stylelint 설정 생성
  const stylelintConfig = createStylelintConfig(rules, syntax);
  const options: LintOptions = {
    code,
    config: stylelintConfig,
  };

  try {
    // Stylelint 실행
    const lintResult = await styleLint.lint(options);

    // 경고 추출
    const warnings = extractWarnings(lintResult);

    // 출력 포맷팅
    const formattedOutput = formatOutput(
      lintResult.output || code,
      outputStyle as OutputStyle | undefined,
      syntax
    );

    // 성공 결과 반환
    return {
      success: true,
      message: '성공',
      content: {
        warnings,
        output: formattedOutput,
        info: {
          version: STYLELINT_VERSION,
          config: {
            extends: stylelintConfig.extends,
            plugins: stylelintConfig.plugins,
            customSyntax: stylelintConfig.customSyntax,
          },
        },
      },
    };
  } catch (error) {
    // LintError는 그대로 전파
    if (error instanceof LintError) {
      throw error;
    }

    // Stylelint 내부 오류 처리
    const errorMessage =
      error instanceof Error
        ? `린트 실행 중 오류가 발생했습니다: ${error.message}`
        : '알 수 없는 오류가 발생했습니다';

    console.error('[lintService] Stylelint error:', error);
    throw new LintError(errorMessage);
  }
}
