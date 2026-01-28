import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getAllPosts, getPostsPaginated } from "@/lib/db"

export async function GET(request: Request) {
    try {
        await requireAdmin()

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1", 10)
        const limit = parseInt(searchParams.get("limit") || "10", 10)

        // If pagination params are provided, use paginated endpoint
        if (searchParams.has("page") || searchParams.has("limit")) {
            const result = await getPostsPaginated(page, limit)
            return NextResponse.json(result)
        }

        // Otherwise return all posts (for backward compatibility)
        const posts = await getAllPosts()
        return NextResponse.json(posts)
    } catch (error) {
        console.error("Error fetching posts:", error)
        return NextResponse.json(
            { error: "Failed to fetch posts" },
            { status: 500 }
        )
    }
}

