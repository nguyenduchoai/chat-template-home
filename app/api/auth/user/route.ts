import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserByEmail } from '@/lib/db-mysql'

export async function GET() {
    try {
        // Get session from JWT cookie
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get fresh user data from database
        const dbUser = await getUserByEmail(session.email)

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            image: dbUser.image,
        })
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
