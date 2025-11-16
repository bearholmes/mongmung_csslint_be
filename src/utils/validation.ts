import { STYLELINT_CONSTANTS, VALIDATION_ERRORS } from '../constants';
import { ValidationError } from '../errors';
import { CssSyntax, OutputStyle } from '../types';

/**
 * 문자열이 비어있는지 확인 (trim 후)
 */
export function isEmptyString(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * 값이 유효한 CSS 문법인지 확인
 */
export function isValidSyntax(syntax: string): syntax is CssSyntax {
  return STYLELINT_CONSTANTS.SUPPORTED_SYNTAXES.includes(syntax as CssSyntax);
}

/**
 * 값이 유효한 출력 스타일인지 확인
 */
export function isValidOutputStyle(style: string): style is OutputStyle {
  return STYLELINT_CONSTANTS.SUPPORTED_OUTPUT_STYLES.includes(style as OutputStyle);
}

/**
 * 객체가 비어있지 않은지 확인
 */
export function isNonEmptyObject(obj: unknown): boolean {
  return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0;
}

/**
 * CSS 코드 유효성 검증
 *
 * @param code - 검증할 CSS 코드
 * @throws {ValidationError} 유효하지 않은 코드
 */
export function validateCode(code: unknown): asserts code is string {
  if (typeof code !== 'string') {
    throw new ValidationError(VALIDATION_ERRORS.INVALID_CODE_TYPE);
  }

  if (isEmptyString(code)) {
    throw new ValidationError(VALIDATION_ERRORS.EMPTY_CODE);
  }
}

/**
 * CSS 문법 유효성 검증
 *
 * @param syntax - 검증할 문법
 * @throws {ValidationError} 유효하지 않은 문법
 */
export function validateSyntax(syntax: unknown): asserts syntax is CssSyntax {
  if (typeof syntax !== 'string' || !isValidSyntax(syntax)) {
    throw new ValidationError(
      `${VALIDATION_ERRORS.INVALID_SYNTAX}. 사용 가능한 문법: ${STYLELINT_CONSTANTS.SUPPORTED_SYNTAXES.join(', ')}`
    );
  }
}

/**
 * Stylelint 규칙 유효성 검증
 *
 * @param rules - 검증할 규칙
 * @throws {ValidationError} 유효하지 않은 규칙
 */
export function validateRules(rules: unknown): asserts rules is Record<string, unknown> {
  if (typeof rules !== 'object' || rules === null) {
    throw new ValidationError(VALIDATION_ERRORS.INVALID_RULES_TYPE);
  }

  if (Object.keys(rules).length < STYLELINT_CONSTANTS.MIN_RULES_COUNT) {
    throw new ValidationError(VALIDATION_ERRORS.EMPTY_RULES);
  }
}

/**
 * 출력 스타일 유효성 검증 (선택적)
 *
 * @param outputStyle - 검증할 출력 스타일
 * @throws {ValidationError} 유효하지 않은 출력 스타일
 */
export function validateOutputStyle(outputStyle: unknown): asserts outputStyle is OutputStyle | undefined {
  if (outputStyle === undefined) {
    return;
  }

  if (typeof outputStyle !== 'string' || !isValidOutputStyle(outputStyle)) {
    throw new ValidationError(
      `${VALIDATION_ERRORS.INVALID_OUTPUT_STYLE}. 사용 가능한 스타일: ${STYLELINT_CONSTANTS.SUPPORTED_OUTPUT_STYLES.join(', ')}`
    );
  }
}
