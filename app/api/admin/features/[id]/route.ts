import { NextRequest, NextResponse } from 'next/server'
import { getFeatureById, updateFeature, deleteFeature } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params
        const feature = await getFeatureById(id)

        if (!feature) {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }

        return NextResponse.json(feature)
    } catch (error: any) {
        console.error('Error fetching feature:', error)
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

        const feature = await updateFeature(id, {
            icon,
            title,
            description,
            active,
            order,
        })

        if (!feature) {
            return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 })
        }

        return NextResponse.json(feature)
    } catch (error: any) {
        console.error('Error updating feature:', error)
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
        const success = await deleteFeature(id)

        if (!success) {
            return NextResponse.json({ error: 'Failed to delete feature' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting feature:', error)
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
