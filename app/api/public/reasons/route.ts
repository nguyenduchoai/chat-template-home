import { NextResponse } from 'next/server'
import { getActiveReasons } from '@/lib/db'

export async function GET() {
    try {
        const reasons = await getActiveReasons()
        return NextResponse.json(reasons)
    } catch (error) {
        console.error('Error fetching reasons:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
