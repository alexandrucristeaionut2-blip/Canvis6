type Key = string;

type AttemptState = {
  count: number;
  firstAt: number;
  blockedUntil?: number;
};

const attempts = new Map<Key, AttemptState>();

export function rateLimitLogin({
  key,
  maxAttempts,
  windowMs,
  blockMs,
}: {
  key: string;
  maxAttempts: number;
  windowMs: number;
  blockMs: number;
}) {
  const now = Date.now();
  const existing = attempts.get(key);

  if (existing?.blockedUntil && existing.blockedUntil > now) {
    return { ok: false as const, retryAfterMs: existing.blockedUntil - now };
  }

  if (!existing || now - existing.firstAt > windowMs) {
    attempts.set(key, { count: 1, firstAt: now });
    return { ok: true as const };
  }

  const next = { ...existing, count: existing.count + 1 };
  if (next.count > maxAttempts) {
    next.blockedUntil = now + blockMs;
    attempts.set(key, next);
    return { ok: false as const, retryAfterMs: blockMs };
  }

  attempts.set(key, next);
  return { ok: true as const };
}
