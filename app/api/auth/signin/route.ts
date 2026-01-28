import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db-mysql'
import { createToken, setAuthCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Find user in database
        const user = await getUserByEmail(email)

        if (!user || !user.password) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Create JWT token
        const token = await createToken({
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            role: user.role,
        })

        // Set auth cookie
        await setAuthCookie(token)

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image,
            }
        })
    } catch (error) {
        console.error('Sign in error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
