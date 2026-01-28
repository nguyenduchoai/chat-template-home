"use client"

import { useEffect, useState, useCallback } from 'react'

interface SessionUser {
    id: string
    email: string
    name?: string | null
    role: string
    image?: string | null
}

export function useSession() {
    const [user, setUser] = useState<SessionUser | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/user', {
                credentials: 'include', // Include cookies
            })
            if (response.ok) {
                const userData = await response.json()
                setUser({
                    id: userData.id,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                    image: userData.image,
                })
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUserData()
    }, [fetchUserData])

    const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setUser(data.user)
                return { success: true }
            } else {
                return { success: false, error: data.error || 'Sign in failed' }
            }
        } catch (error) {
            console.error('Sign in error:', error)
            return { success: false, error: 'Network error' }
        }
    }

    const signOut = async (): Promise<void> => {
        try {
            await fetch('/api/auth/signout', {
                method: 'POST',
                credentials: 'include',
            })
            setUser(null)
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    const refresh = () => {
        setLoading(true)
        fetchUserData()
    }

    return { 
        user, 
        loading, 
        signIn, 
        signOut, 
        refresh,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
        isSuperAdmin: user?.role === 'superadmin',
    }
}

// Backwards compatibility alias
export const useSupabaseSession = useSession
