/**
 * Rate limiting for payment endpoints
 * Uses in-memory storage (suitable for Vercel serverless)
 * For production at scale, consider Upstash Redis
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

const defaultOptions: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 requests per minute
}

/**
 * Rate limit check
 * @param identifier - Unique identifier (userId, IP address, etc.)
 * @param options - Rate limit options
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = defaultOptions
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = store[identifier]

  // Clean up old entries periodically (every 1000 checks)
  if (Math.random() < 0.001) {
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })
  }

  if (!record || record.resetTime < now) {
    // New window or expired window
    store[identifier] = {
      count: 1,
      resetTime: now + options.windowMs,
    }
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    }
  }

  if (record.count >= options.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  // Increment count
  record.count++
  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': '5',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.floor(resetTime / 1000).toString(),
  }
}

/**
 * Get identifier from request (userId or IP)
 */
export function getRateLimitIdentifier(request: Request, userId?: string | null): string {
  // Prefer userId if available (more accurate)
  if (userId) {
    return `user:${userId}`
  }

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}
