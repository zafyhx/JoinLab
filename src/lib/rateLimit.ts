/**
 * Simple in-memory sliding-window rate limiter.
 * Sufficient for the single-server demo deployment target (doc 02 §7).
 */

const buckets = new Map<string, number[]>();
const MAX_BUCKETS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  // Periodic pruning so idle buckets do not accumulate forever
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, arr] of buckets) {
      const alive = arr.filter((t) => now - t < windowMs);
      if (alive.length === 0) buckets.delete(k);
      else buckets.set(k, alive);
    }
  }

  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowMs - (now - hits[0])) / 1000)
    );
    return { allowed: false, retryAfterSec };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true, retryAfterSec: 0 };
}
