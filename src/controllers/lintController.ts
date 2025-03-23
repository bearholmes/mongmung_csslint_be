import { lintCode, LintError } from '../services/lintService';
import { LintRequest, LintResult } from '../types';

export async function handleLintRequest({ body, set }: { body: LintRequest, set: any }): Promise<LintResult> {
  try {
    const result = await lintCode(body);
    return result;
  } catch (error) {
    if (error instanceof LintError) {
      set.status = 400;
      return {
        success: false,
        message: error.message,
        content: null,
      };
    }
    
    // 예상치 못한 에러 처리
    console.error('Unexpected error:', error);
    set.status = 500;
    return {
      success: false,
      message: '내부 서버 오류가 발생했습니다',
      content: null,
    };
  }
}
