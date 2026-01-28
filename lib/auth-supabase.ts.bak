import { createSupabaseServerClient } from './supabase'
import { getUserByEmail } from './db'

export interface User {
    id: string
    email: string
    name?: string | null
    role: string
    image?: string | null
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const supabase = await createSupabaseServerClient()
        const {
            data: { user: supabaseUser },
            error,
        } = await supabase.auth.getUser()

        if (error || !supabaseUser) {
            return null
        }

        const dbUser = await getUserByEmail(supabaseUser.email!)

        if (!dbUser) {
            return null
        }

        return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            image: dbUser.image,
        }
    } catch (error) {
        console.error('Error getting current user:', error)
        return null
    }
}

export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === 'admin' || user?.role === 'superadmin'
}

export async function requireAuth(): Promise<User> {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user
}


export async function requireAdmin(): Promise<User> {
    const user = await requireAuth()
    if (user.role !== 'admin' && user.role !== 'superadmin') {
        throw new Error('Forbidden')
    }
    return user
}
export async function requireSuperadmin(): Promise<User> {
    const user = await requireAuth()
    if (user.role !== 'superadmin') {
        throw new Error('Forbidden')
    }
    return user
}

