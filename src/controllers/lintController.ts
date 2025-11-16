import { lintCode, LintError } from '../services/lintService';
import { LintRequest, LintResult } from '../types';

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
    // LintError: 사용자 입력 오류 (400 Bad Request)
    if (error instanceof LintError) {
      set.status = 400;
      return {
        success: false,
        message: error.message,
        content: null,
      };
    }

    // 예상치 못한 에러 (500 Internal Server Error)
    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';

    console.error('[lintController] Unexpected error:', {
      message: errorMessage,
      error,
      timestamp: new Date().toISOString(),
    });

    set.status = 500;
    return {
      success: false,
      message: '내부 서버 오류가 발생했습니다',
      content: null,
    };
  }
}
