/**
 * DEPRECATED: Supabase has been replaced with MySQL + JWT
 * 
 * This file is kept for backward compatibility with existing code
 * that references Supabase storage functions.
 * 
 * For new code, use:
 * - lib/db-mysql.ts for database operations
 * - lib/auth.ts for authentication
 * - lib/storage.ts for file uploads
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Check if Supabase is configured (for backward compatibility during migration)
const isSupabaseConfigured = () => {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Supabase client for client-side usage (browser)
// DEPRECATED: Use useSession hook from @/hooks/useSession instead
export function createSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('[DEPRECATED] Supabase is not configured. Please migrate to MySQL + JWT.')
        // Return a mock client that throws on actual use
        return {
            auth: {
                getSession: async () => ({ data: { session: null }, error: null }),
                signInWithPassword: async () => ({ data: null, error: { message: 'Supabase is not configured. Please use /api/auth/signin instead.' } }),
                signOut: async () => ({ error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            },
            storage: {
                from: () => ({
                    list: async () => ({ data: [], error: null }),
                    upload: async () => ({ data: null, error: { message: 'Supabase storage is not configured. Please use /api/upload instead.' } }),
                    remove: async () => ({ data: null, error: null }),
                    getPublicUrl: () => ({ data: { publicUrl: '' } }),
                }),
            },
        } as any
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// DEPRECATED: Use requireAdmin/requireAuth from @/lib/auth instead
export async function createSupabaseServerClient() {
    const { cookies } = await import('next/headers')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('[DEPRECATED] Supabase is not configured. Please migrate to MySQL + JWT.')
        // Return a mock client
        return {
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
            },
        } as any
    }

    const cookieStore = await cookies()

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                } catch {
                }
            },
        },
    })
}

// DEPRECATED: Use direct MySQL queries
export function createSupabaseAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.warn('[DEPRECATED] Supabase admin client is not configured.')
        return null
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}

// DEPRECATED: Use for migration scripts only
export function createSupabaseScriptClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('[DEPRECATED] Supabase script client is not configured.')
        return null
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}

export { isSupabaseConfigured }
