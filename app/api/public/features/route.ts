import { NextResponse } from 'next/server'
import { getActiveFeatures } from '@/lib/db'

export async function GET() {
    try {
        const features = await getActiveFeatures()
        return NextResponse.json(features)
    } catch (error) {
        console.error('Error fetching features:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
