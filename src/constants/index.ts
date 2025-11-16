/**
 * 애플리케이션 전역 상수
 */

/**
 * HTTP 상태 코드
 */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 서버 기본 설정
 */
export const SERVER_CONFIG = {
  DEFAULT_PORT: 5002,
  DEFAULT_HOST: '0.0.0.0',
  REQUEST_TIMEOUT_MS: 30000,
  /** 최대 요청 본문 크기 (5MB) - 보안을 위한 제한 */
  MAX_BODY_SIZE: 5 * 1024 * 1024,
} as const;

/**
 * API 경로
 */
export const API_ROUTES = {
  ROOT: '/',
  FAVICON: '/favicon.ico',
  SWAGGER: '/swagger',
  LINT: '/api/lint',
} as const;

/**
 * 환경 모드
 */
export const ENV_MODE = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

/**
 * 로그 레벨
 */
export const LOG_LEVEL = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

/**
 * 응답 메시지
 */
export const MESSAGES = {
  SUCCESS: '성공',
  SERVER_ERROR: '서버 오류가 발생했습니다',
  INTERNAL_ERROR: '내부 서버 오류가 발생했습니다',
} as const;

/**
 * 검증 에러 메시지
 */
export const VALIDATION_ERRORS = {
  EMPTY_CODE: 'CSS 코드가 비어있습니다',
  INVALID_CODE_TYPE: 'CSS 코드는 문자열이어야 합니다',
  INVALID_SYNTAX: '지원하지 않는 문법입니다',
  INVALID_OUTPUT_STYLE: '지원하지 않는 출력 스타일입니다',
  EMPTY_RULES: '최소 하나 이상의 린트 규칙이 필요합니다',
  INVALID_RULES_TYPE: '린트 규칙은 객체여야 합니다',
  PARSE_ERROR: 'CSS 파싱 중 오류가 발생했습니다',
  LINT_ERROR: '린트 실행 중 오류가 발생했습니다',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다',
} as const;

/**
 * Stylelint 관련 상수
 */
export const STYLELINT_CONSTANTS = {
  MIN_RULES_COUNT: 1,
  SUPPORTED_SYNTAXES: ['css', 'html'] as const,
  SUPPORTED_OUTPUT_STYLES: ['compact', 'nested'] as const,
} as const;

/**
 * 포맷팅 관련 상수
 */
export const FORMATTING = {
  /** 들여쓰기 문자열 (스페이스 2개) */
  INDENT: '  ',
  /** 들여쓰기 레벨당 스페이스 수 */
  INDENT_SIZE: 2,
} as const;
