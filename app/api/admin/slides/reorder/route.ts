import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { reorderSlides } from "@/lib/db"

export async function POST(request: Request) {
    try {
        await requireAdmin()

        const body = await request.json()
        const { slides } = body

        if (!Array.isArray(slides)) {
            return NextResponse.json(
                { error: "Invalid slides data" },
                { status: 400 }
            )
        }

        const slideOrders = slides.map((slide, index) => ({
            id: slide.id,
            order: index,
        }))

        const success = await reorderSlides(slideOrders)

        if (!success) {
            return NextResponse.json(
                { error: "Failed to reorder slides" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error reordering slides:", error)
        return NextResponse.json(
            { error: "Failed to reorder slides" },
            { status: 500 }
        )
    }
}
