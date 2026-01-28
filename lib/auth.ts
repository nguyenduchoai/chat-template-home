/**
 * JWT Authentication Utilities
 * Uses jose library for JWT operations (Edge-compatible)
 */

import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { cookies } from 'next/headers'

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-characters-long'
)
const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const COOKIE_NAME = 'auth_token'

// User payload interface
export interface UserPayload {
    id: string
    email: string
    name?: string
    role: string
}

export interface SessionPayload extends JWTPayload {
    user: UserPayload
}

/**
 * Create a JWT token for a user
 */
export async function createToken(user: UserPayload): Promise<string> {
    const token = await new SignJWT({ user })
        .setProtectedHeader({ alg: JWT_ALGORITHM })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(JWT_SECRET)

    return token
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as SessionPayload
    } catch (error) {
        return null
    }
}

/**
 * Get the current session from cookies (Server Component / API Route)
 */
export async function getSession(): Promise<UserPayload | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(COOKIE_NAME)?.value

        if (!token) {
            return null
        }

        const payload = await verifyToken(token)
        return payload?.user || null
    } catch (error) {
        console.error('Error getting session:', error)
        return null
    }
}

/**
 * Set auth cookie (for API routes)
 */
export async function setAuthCookie(token: string): Promise<void> {
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === 'production'
    
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })
}

/**
 * Clear auth cookie (for logout)
 */
export async function clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
}

/**
 * Get token from request headers (for manual verification)
 */
export function getTokenFromRequest(request: Request): string | null {
    // Check Authorization header first
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7)
    }

    // Check cookie header
    const cookieHeader = request.headers.get('Cookie')
    if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim())
        const authCookie = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`))
        if (authCookie) {
            return authCookie.split('=')[1]
        }
    }

    return null
}

/**
 * Verify request and get user (for API routes)
 */
export async function verifyRequest(request: Request): Promise<UserPayload | null> {
    const token = getTokenFromRequest(request)
    if (!token) return null

    const payload = await verifyToken(token)
    return payload?.user || null
}

/**
 * Middleware-style auth check for API routes
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<UserPayload> {
    const user = await getSession()
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user
}

/**
 * Check if user has admin role
 */
export async function requireAdmin(): Promise<UserPayload> {
    const user = await requireAuth()
    if (user.role !== 'admin' && user.role !== 'superadmin') {
        throw new Error('Forbidden: Admin access required')
    }
    return user
}

/**
 * Check if user has superadmin role
 */
export async function requireSuperadmin(): Promise<UserPayload> {
    const user = await requireAuth()
    if (user.role !== 'superadmin') {
        throw new Error('Forbidden: Superadmin access required')
    }
    return user
}

export default {
    createToken,
    verifyToken,
    getSession,
    setAuthCookie,
    clearAuthCookie,
    getTokenFromRequest,
    verifyRequest,
    requireAuth,
    requireAdmin,
    requireSuperadmin,
}
