import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
    try {
        // Clear the auth cookie
        await clearAuthCookie()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Sign out error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
