import { lintCode } from '../services/lintService';
import { LintRequest, LintResult } from '../types';
import { logger } from '../utils/logger';
import { isAppError, toAppError } from '../errors';
import { HTTP_STATUS, MESSAGES } from '../constants';

/**
 * Elysia 컨텍스트 타입
 */
interface ElysiaContext {
  body: LintRequest;
  set: {
    status?: number;
  };
}

/**
 * 린트 요청 핸들러
 * POST /api/lint 엔드포인트의 요청을 처리하고 적절한 응답을 반환
 *
 * @param context - Elysia 컨텍스트 (body, set 포함)
 * @returns 린트 결과 또는 에러 응답
 *
 * @example
 * ```typescript
 * // 성공 응답:
 * {
 *   success: true,
 *   message: "성공",
 *   content: { warnings: [], output: "...", info: {...} }
 * }
 *
 * // 에러 응답:
 * {
 *   success: false,
 *   message: "CSS 코드가 비어있습니다",
 *   content: null
 * }
 * ```
 */
export async function handleLintRequest(context: ElysiaContext): Promise<LintResult> {
  const { body, set } = context;

  try {
    // 린트 서비스 호출
    const result = await lintCode(body);
    return result;
  } catch (error) {
    // AppError 계열 에러 처리
    const appError = toAppError(error);

    logger.error('Lint request failed', {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      context: appError.context,
    });

    // HTTP 상태 코드 설정
    set.status = appError.statusCode;

    return {
      success: false,
      message: appError.message,
      content: null,
    };
  }
}
