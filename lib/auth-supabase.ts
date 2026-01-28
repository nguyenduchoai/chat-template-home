/**
 * Authentication Layer - JWT Based
 * 
 * MIGRATION NOTE: Supabase Auth has been replaced with JWT
 * This file re-exports from auth.ts for backwards compatibility.
 */

export { 
    getSession as getCurrentUser,
    requireAuth,
    requireAdmin,
    requireSuperadmin,
    verifyRequest,
    createToken,
    verifyToken,
    setAuthCookie,
    clearAuthCookie,
} from './auth'

export type { UserPayload, SessionPayload } from './auth'
