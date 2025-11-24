/**
 * Rate Limiter 유틸리티
 * 메모리 기반 간단한 Token Bucket 알고리즘 구현
 */

interface RateLimitEntry {
  /** 남은 요청 수 */
  tokens: number;
  /** 마지막 요청 시간 (ms) */
  lastRefill: number;
}

/**
 * Rate Limiter 클래스
 */
export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  /**
   * @param maxRequests - 시간 창 내 최대 요청 수
   * @param windowMs - 시간 창 (밀리초)
   */
  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // 메모리 누수 방지를 위해 1분마다 오래된 항목 정리
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * 요청 허용 여부 확인 및 토큰 소비
   * @param identifier - 클라이언트 식별자 (IP 주소 등)
   * @returns 요청 허용 여부
   */
  consume(identifier: string): boolean {
    const now = Date.now();
    let entry = this.store.get(identifier);

    if (!entry) {
      // 새로운 클라이언트
      entry = {
        tokens: this.maxRequests - 1,
        lastRefill: now,
      };
      this.store.set(identifier, entry);
      return true;
    }

    // 토큰 재충전 계산
    const elapsed = now - entry.lastRefill;
    const refillTokens = Math.floor(
      (elapsed / this.windowMs) * this.maxRequests,
    );

    if (refillTokens > 0) {
      entry.tokens = Math.min(this.maxRequests, entry.tokens + refillTokens);
      entry.lastRefill = now;
    }

    // 토큰 소비
    if (entry.tokens > 0) {
      entry.tokens--;
      return true;
    }

    return false;
  }

  /**
   * 남은 요청 수 확인
   * @param identifier - 클라이언트 식별자
   * @returns 남은 요청 수
   */
  remaining(identifier: string): number {
    const entry = this.store.get(identifier);
    if (!entry) {
      return this.maxRequests;
    }

    const now = Date.now();
    const elapsed = now - entry.lastRefill;
    const refillTokens = Math.floor(
      (elapsed / this.windowMs) * this.maxRequests,
    );

    return Math.min(this.maxRequests, entry.tokens + refillTokens);
  }

  /**
   * 오래된 항목 정리 (메모리 누수 방지)
   */
  private cleanup(): void {
    const now = Date.now();
    const threshold = this.windowMs * 2;

    for (const [key, entry] of this.store.entries()) {
      if (now - entry.lastRefill > threshold) {
        this.store.delete(key);
      }
    }
  }

  /**
   * 특정 클라이언트 제한 초기화
   */
}

/**
 * 싱글톤 Rate Limiter 인스턴스
 * 기본 설정: 1분에 100 요청
 */
export const rateLimiter = new RateLimiter(100, 60000);
