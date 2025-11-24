import { HTTP_STATUS } from '../constants';

/**
 * 기본 애플리케이션 에러
 */
export class AppError extends Error {
  /**
   * HTTP 상태 코드
   */
  public readonly statusCode: number;

  /**
   * 에러 코드 (앱 내부용)
   */
  public readonly code: string;

  /**
   * 추가 컨텍스트 데이터
   */
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_ERROR',
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;

    // 스택 트레이스 캡처 (V8 엔진 최적화)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

}

/**
 * 유효성 검사 에러 (400 Bad Request)
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR', context);
  }
}

/**
 * 린트 처리 에러 (400 Bad Request)
 */
export class LintError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, HTTP_STATUS.BAD_REQUEST, 'LINT_ERROR', context);
  }
}

/**
 * 파싱 에러 (422 Unprocessable Entity)
 */
export class ParseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, 'PARSE_ERROR', context);
  }
}

/**
 * 에러가 AppError 인스턴스인지 확인하는 타입 가드
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 에러 객체를 AppError로 변환
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError(String(error));
}
