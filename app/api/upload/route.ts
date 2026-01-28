import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { uploadImage } from '@/lib/storage'

export async function POST(request: Request) {
    try {
        // Require admin authentication
        await requireAdmin()

        const formData = await request.formData()
        const file = formData.get('file') as File
        const folder = formData.get('folder') as string || 'images'

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Only image files are allowed' },
                { status: 400 }
            )
        }

        // Upload the file
        const result = await uploadImage(file, folder)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Upload failed' },
                { status: 500 }
            )
        }

        return NextResponse.json({ url: result.url, success: true })
    } catch (error: any) {
        console.error('Upload error:', error)
        
        if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        )
    }
}

