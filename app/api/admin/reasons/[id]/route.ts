import { NextRequest, NextResponse } from 'next/server'
import { getReasonById, updateReason, deleteReason } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params
        const reason = await getReasonById(id)

        if (!reason) {
            return NextResponse.json({ error: 'Reason not found' }, { status: 404 })
        }

        return NextResponse.json(reason)
    } catch (error: any) {
        console.error('Error fetching reason:', error)
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params
        const body = await request.json()
        const { icon, title, description, active, order } = body

        const reason = await updateReason(id, {
            icon,
            title,
            description,
            active,
            order,
        })

        if (!reason) {
            return NextResponse.json({ error: 'Failed to update reason' }, { status: 500 })
        }

        return NextResponse.json(reason)
    } catch (error: any) {
        console.error('Error updating reason:', error)
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params
        const success = await deleteReason(id)

        if (!success) {
            return NextResponse.json({ error: 'Failed to delete reason' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting reason:', error)
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
