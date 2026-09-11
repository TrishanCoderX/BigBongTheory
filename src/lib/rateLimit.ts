// In-memory fixed-window rate limiter. Deliberately simple: no external
// service (Redis etc.) required, works fine for a single Node process.
// Known limitation: resets on server restart, and does NOT share state
// across multiple instances — if this app is ever deployed behind a
// multi-instance/serverless setup, replace this with a shared store
// (Redis, Upstash, etc.) so limits apply per-account rather than per-process.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so this map can't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref?.();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}
