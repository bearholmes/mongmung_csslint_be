import { SERVER_CONFIG, ENV_MODE } from '../constants';

/**
 * 환경 변수 타입 정의
 */
export interface AppEnv {
  /** 서버 포트 */
  PORT: number;
  /** 서버 호스트 */
  HOST: string;
  /** Node 환경 (development, production, test) */
  NODE_ENV: string;
  /** 개발 모드 여부 */
  isDev: boolean;
  /** CORS 허용 Origin (단일 또는 배열) */
  CORS_ORIGIN: string | string[];
}

/**
 * CORS Origin 파싱
 * - 쉼표로 구분된 여러 도메인 지원
 * - 개발/테스트 환경: 기본값 '*' (모든 도메인 허용)
 * - 프로덕션: 환경 변수 필수, 명시적 설정 필요
 *
 * @param nodeEnv - Node 환경
 * @returns 파싱된 CORS Origin
 * @throws {Error} 프로덕션 환경에서 CORS_ORIGIN 미설정 시
 */
function parseCorsOrigin(nodeEnv: string): string | string[] {
  const corsOrigin = process.env.CORS_ORIGIN;
  const isProduction = nodeEnv === ENV_MODE.PRODUCTION;

  // 개발/테스트 환경: 기본값 '*'
  if (!isProduction) {
    return corsOrigin || '*';
  }

  // 프로덕션 환경: 명시적 설정 필수
  if (!corsOrigin || corsOrigin.trim().length === 0) {
    throw new Error(
      'CORS_ORIGIN is required in production. Set it to a specific domain or comma-separated list of domains.'
    );
  }

  // 쉼표로 구분된 여러 도메인 처리
  if (corsOrigin.includes(',')) {
    return corsOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
  }

  return corsOrigin.trim();
}

/**
 * 환경 변수 파싱 및 검증
 *
 * @returns 검증된 환경 변수 객체
 * @throws {Error} 환경 변수가 유효하지 않은 경우
 */
function parseEnv(): AppEnv {
  const port = process.env.PORT ? Number(process.env.PORT) : SERVER_CONFIG.DEFAULT_PORT;
  const host = process.env.HOST || SERVER_CONFIG.DEFAULT_HOST;
  const nodeEnv = process.env.NODE_ENV || ENV_MODE.DEVELOPMENT;
  const isDev = nodeEnv === ENV_MODE.DEVELOPMENT;

  // 포트 유효성 검증
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}. Must be between 1 and 65535.`);
  }

  // 호스트 유효성 검증 (간단한 검증)
  if (!host || host.trim().length === 0) {
    throw new Error('Invalid HOST: Must be a non-empty string.');
  }

  // CORS Origin 파싱
  const corsOrigin = parseCorsOrigin(nodeEnv);

  return {
    PORT: port,
    HOST: host,
    NODE_ENV: nodeEnv,
    isDev,
    CORS_ORIGIN: corsOrigin,
  };
}

/**
 * 검증된 환경 변수 (싱글톤)
 */
export const env = parseEnv();

/**
 * 환경 변수 정보 출력 (디버깅용)
 */
export function logEnvInfo(): void {
  console.info('Environment Configuration:');
  console.info(`  PORT: ${env.PORT}`);
  console.info(`  HOST: ${env.HOST}`);
  console.info(`  NODE_ENV: ${env.NODE_ENV}`);
  console.info(`  isDev: ${env.isDev}`);
  console.info(`  CORS_ORIGIN: ${Array.isArray(env.CORS_ORIGIN) ? env.CORS_ORIGIN.join(', ') : env.CORS_ORIGIN}`);
}
