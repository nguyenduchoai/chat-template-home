import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getAllSlides, createSlide } from "@/lib/db"

export async function GET() {
    try {
        await requireAdmin()

        const slides = await getAllSlides()

        return NextResponse.json(slides)
    } catch (error) {
        console.error("Error fetching slides:", error)
        return NextResponse.json(
            { error: "Failed to fetch slides" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        await requireAdmin()

        const body = await request.json()
        const { title, image, link, order, active } = body

        if (!title || !image) {
            return NextResponse.json(
                { error: "Title and image are required" },
                { status: 400 }
            )
        }

        const slide = await createSlide({
            title,
            image,
            link,
            order,
            active,
        })

        if (!slide) {
            console.error("Slide creation returned null")
            return NextResponse.json(
                { error: "Failed to create slide" },
                { status: 500 }
            )
        }

        return NextResponse.json(slide, { status: 201 })
    } catch (error) {
        console.error("Error creating slide:", error)
        return NextResponse.json(
            { error: "Failed to create slide" },
            { status: 500 }
        )
    }
}
