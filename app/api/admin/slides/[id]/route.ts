import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getSlideById, updateSlide, deleteSlide } from "@/lib/db"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params

        const slide = await getSlideById(id)

        if (!slide) {
            return NextResponse.json(
                { error: "Slide not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(slide)
    } catch (error) {
        console.error("Error fetching slide:", error)
        return NextResponse.json(
            { error: "Failed to fetch slide" },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params

        const body = await request.json()
        const { title, image, link, order, active } = body

        const slide = await updateSlide(id, {
            title,
            image,
            link,
            order,
            active,
        })

        if (!slide) {
            return NextResponse.json(
                { error: "Failed to update slide" },
                { status: 500 }
            )
        }

        return NextResponse.json(slide)
    } catch (error) {
        console.error("Error updating slide:", error)
        return NextResponse.json(
            { error: "Failed to update slide" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params

        const success = await deleteSlide(id)

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete slide" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting slide:", error)
        return NextResponse.json(
            { error: "Failed to delete slide" },
            { status: 500 }
        )
    }
}
