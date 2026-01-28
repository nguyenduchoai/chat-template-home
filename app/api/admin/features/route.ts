import { NextRequest, NextResponse } from 'next/server'
import { getAllFeatures, createFeature, reorderFeatures } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
    try {
        await requireAdmin()
        const features = await getAllFeatures()
        return NextResponse.json(features)
    } catch (error: any) {
        console.error('Error fetching features:', error)
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdmin()
        const body = await request.json()
        const { icon, title, description, active } = body

        if (!icon || !title || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const feature = await createFeature({
            icon,
            title,
            description,
            order: 0, // Will be set automatically
            active: active !== undefined ? active : true,
        })

        if (!feature) {
            return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 })
        }

        return NextResponse.json(feature)
    } catch (error: any) {
        console.error('Error creating feature:', error)
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        await requireAdmin()
        const body = await request.json()
        const { features } = body

        if (!Array.isArray(features)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        const featureOrders = features.map((f, index) => ({
            id: f.id,
            order: index + 1,
        }))

        const success = await reorderFeatures(featureOrders)

        if (!success) {
            return NextResponse.json({ error: 'Failed to reorder features' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error reordering features:', error)
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
