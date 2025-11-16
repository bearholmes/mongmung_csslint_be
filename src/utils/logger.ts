import { LOG_LEVEL } from '../constants';

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
 * 콘솔 로거 구현
 * 향후 Winston, Pino 등으로 쉽게 교체 가능
 */
class ConsoleLogger implements Logger {
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
    }

    return `${prefix} ${message}`;
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage(LOG_LEVEL.ERROR, message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(LOG_LEVEL.WARN, message, context));
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage(LOG_LEVEL.INFO, message, context));
  }

  debug(message: string, context?: LogContext): void {
    console.debug(this.formatMessage(LOG_LEVEL.DEBUG, message, context));
  }
}

/**
 * 싱글톤 로거 인스턴스
 */
export const logger: Logger = new ConsoleLogger();

/**
 * 로거 팩토리 (향후 다른 로거로 교체 시 사용)
 *
 * @param type - 로거 타입 (기본값: 'console')
 * @returns Logger 인스턴스
 */
export function createLogger(type: 'console' = 'console'): Logger {
  switch (type) {
    case 'console':
    default:
      return new ConsoleLogger();
  }
}
