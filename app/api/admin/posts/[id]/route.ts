import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-supabase"
import { getPostById, updatePost, deletePost, checkSlugExists } from "@/lib/db"
import { deletePostImages, extractImageUrlsFromHtml, deleteImageFromStorage } from "@/lib/storage-utils"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        await requireAdmin()

        // Handle params as Promise (Next.js 15) or object (Next.js 14)
        const resolvedParams = params instanceof Promise ? await params : params

        const post = await getPostById(resolvedParams.id)

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(post)
    } catch (error) {
        console.error("Error fetching post:", error)
        return NextResponse.json(
            { error: "Failed to fetch post" },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        await requireAdmin()

        // Handle params as Promise (Next.js 15) or object (Next.js 14)
        const resolvedParams = params instanceof Promise ? await params : params

        // Get current post data to compare with new data
        const currentPost = await getPostById(resolvedParams.id)
        if (!currentPost) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            )
        }

        const body = await request.json()
        const { title, slug, content, excerpt, coverImage, published } = body

        // Check if slug is being updated and if it already exists
        if (slug && slug !== currentPost.slug) {
            const slugExists = await checkSlugExists(slug, resolvedParams.id)
            if (slugExists) {
                return NextResponse.json(
                    { error: `Slug "${slug}" đã tồn tại. Vui lòng chọn slug khác.` },
                    { status: 409 } // Conflict status code
                )
            }
        }

        const updateData: any = {}
        if (title) updateData.title = title
        if (slug) updateData.slug = slug
        if (content) updateData.content = content
        if (excerpt !== undefined) updateData.excerpt = excerpt
        if (coverImage !== undefined) updateData.coverImage = coverImage
        if (published !== undefined) updateData.published = published

        // Delete old images that are no longer used
        const imagesToDelete: string[] = []

        // Check if coverImage changed
        if (coverImage !== undefined && coverImage !== currentPost.coverImage) {
            // Delete old coverImage if it exists and is from Supabase
            if (currentPost.coverImage) {
                imagesToDelete.push(currentPost.coverImage)
            }
        }

        // Check if content changed
        if (content !== undefined && content !== currentPost.content) {
            // Get old images from content
            const oldContentImages = extractImageUrlsFromHtml(currentPost.content || "")
            // Get new images from content
            const newContentImages = extractImageUrlsFromHtml(content)
            
            // Find images that were removed
            oldContentImages.forEach((oldUrl) => {
                if (!newContentImages.includes(oldUrl)) {
                    imagesToDelete.push(oldUrl)
                }
            })
        }

        // Delete unused images
        let deletedCount = 0
        if (imagesToDelete.length > 0) {
            for (const url of imagesToDelete) {
                const deleted = await deleteImageFromStorage(url)
                if (deleted) {
                    deletedCount++
                }
            }
        }
        const post = await updatePost(resolvedParams.id, updateData)

        if (!post) {
            return NextResponse.json(
                { error: "Failed to update post" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            ...post,
            deletedImagesCount: deletedCount
        })
    } catch (error: any) {
        console.error("Error updating post:", error)
        
        // Handle duplicate slug error
        if (error.message?.includes('đã tồn tại') || error.code === '23505') {
            return NextResponse.json(
                { error: error.message || "Slug đã tồn tại. Vui lòng chọn slug khác." },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: error.message || "Failed to update post" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        await requireAdmin()

        const resolvedParams = params instanceof Promise ? await params : params
            
        const post = await getPostById(resolvedParams.id)
        
        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            )
        }

        const deletedImagesCount = await deletePostImages(
            post.coverImage || null,
            post.content
        )

        const success = await deletePost(resolvedParams.id)

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete post" },
                { status: 500 }
            )
        }

        return NextResponse.json({ 
            success: true,
            deletedImagesCount 
        })
    } catch (error) {
        console.error("Error deleting post:", error)
        return NextResponse.json(
            { error: "Failed to delete post" },
            { status: 500 }
        )
    }
}
