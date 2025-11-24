import { LOG_LEVEL } from '../constants';
import type { LogLevelType } from '../config/env';

/**
 * 로그 컨텍스트 (추가 메타데이터)
 */
export interface LogContext {
  [key: string]: unknown;
}

/**
 * 로거 인터페이스
 */
export interface Logger {
  error(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}

/**
 * 로그 레벨 우선순위 (낮을수록 높은 우선순위)
 */
const LOG_LEVEL_PRIORITY: Record<LogLevelType, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * 콘솔 로거 구현
 * 향후 Winston, Pino 등으로 쉽게 교체 가능
 */
class ConsoleLogger implements Logger {
  private minLevel: LogLevelType;

  constructor(minLevel: LogLevelType = 'debug') {
    this.minLevel = minLevel;
  }

  /**
   * 현재 설정된 로그 레벨에서 메시지를 출력해야 하는지 확인
   */
  private shouldLog(level: LogLevelType): boolean {
    return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  private formatMessage(
    level: string,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
    }

    return `${prefix} ${message}`;
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(LOG_LEVEL.ERROR, message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(LOG_LEVEL.WARN, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage(LOG_LEVEL.INFO, message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage(LOG_LEVEL.DEBUG, message, context));
    }
  }
}

/**
 * 환경 변수에서 로그 레벨 가져오기
 */
function getLogLevelFromEnv(): LogLevelType {
  const logLevel = process.env.LOG_LEVEL?.toLowerCase();
  const validLevels: LogLevelType[] = ['error', 'warn', 'info', 'debug'];
  const isDev = process.env.NODE_ENV === 'development';

  if (logLevel && validLevels.includes(logLevel as LogLevelType)) {
    return logLevel as LogLevelType;
  }

  // 기본값: 개발 환경은 debug, 프로덕션은 info
  return isDev ? 'debug' : 'info';
}

/**
 * 싱글톤 로거 인스턴스
 */
export const logger: Logger = new ConsoleLogger(getLogLevelFromEnv());

/**
 * 로거 팩토리 (향후 다른 로거로 교체 시 사용)
 *
 * @param type - 로거 타입 (기본값: 'console')
 * @param logLevel - 로그 레벨 (기본값: 환경 변수 또는 debug/info)
 * @returns Logger 인스턴스
 */
export function createLogger(
  type: 'console' = 'console',
  logLevel?: LogLevelType,
): Logger {
  const level = logLevel || getLogLevelFromEnv();
  switch (type) {
    case 'console':
    default:
      return new ConsoleLogger(level);
  }
}
