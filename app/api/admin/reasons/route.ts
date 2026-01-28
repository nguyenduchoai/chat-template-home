import { NextRequest, NextResponse } from 'next/server'
import { getAllReasons, createReason, reorderReasons } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
    try {
        await requireAdmin()
        const reasons = await getAllReasons()
        return NextResponse.json(reasons)
    } catch (error: any) {
        console.error('Error fetching reasons:', error)
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

        const reason = await createReason({
            icon,
            title,
            description,
            order: 0, // Will be set automatically
            active: active !== undefined ? active : true,
        })

        if (!reason) {
            return NextResponse.json({ error: 'Failed to create reason' }, { status: 500 })
        }

        return NextResponse.json(reason)
    } catch (error: any) {
        console.error('Error creating reason:', error)
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
        const { reasons } = body

        if (!Array.isArray(reasons)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        const reasonOrders = reasons.map((r, index) => ({
            id: r.id,
            order: index + 1,
        }))

        const success = await reorderReasons(reasonOrders)

        if (!success) {
            return NextResponse.json({ error: 'Failed to reorder reasons' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error reordering reasons:', error)
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
