import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getPublishedPosts, createPost, countPosts, countPublishedPosts, checkSlugExists } from "@/lib/db"

export async function GET() {
    try {

        const posts = await getPublishedPosts()

        return NextResponse.json(posts)
    } catch (error) {
        console.error("Error fetching posts:", error)
        return NextResponse.json(
            { error: "Failed to fetch posts" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireAdmin()

        const body = await request.json()
        const { title, slug, content, excerpt, coverImage, published } = body

        if (!title || !slug || !content) {
            return NextResponse.json(
                { error: "Title, slug, and content are required" },
                { status: 400 }
            )
        }

        // Check if slug already exists before creating
        const slugExists = await checkSlugExists(slug)
        if (slugExists) {
            return NextResponse.json(
                { error: `Slug "${slug}" đã tồn tại. Vui lòng chọn slug khác.` },
                { status: 409 } // Conflict status code
            )
        }

        const post = await createPost({
            title,
            slug,
            content,
            excerpt,
            coverImage,
            published: published ?? false,
            authorId: user.id,
        })

        if (!post) {
            return NextResponse.json(
                { error: "Failed to create post" },
                { status: 500 }
            )
        }

        return NextResponse.json(post)
    } catch (error: any) {
        console.error("Error creating post:", error)
        
        // Handle duplicate slug error
        if (error.message?.includes('đã tồn tại') || error.code === '23505') {
            return NextResponse.json(
                { error: error.message || "Slug đã tồn tại. Vui lòng chọn slug khác." },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: error.message || "Failed to create post" },
            { status: 500 }
        )
    }
}

