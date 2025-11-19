import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  user?: {
    id: string
    email: string
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'

/**
 * Verify JWT token and attach user to request
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    req.userId = decoded.userId
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    }
    next()
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '15m' })
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; email: string }
  } catch (error) {
    return null
  }
}

