import { NextResponse } from "next/server"
import { getPostBySlug } from "@/lib/db"

export async function GET(
  _request: Request,
  {
    params
  }: {
    params: Promise<{ slug: string }>
  }
) {
  try {
    console.log("fetching post route", params)
    const { slug } = await params
    console.log("fetching post", slug)
    const post = await getPostBySlug(slug)

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("[API] Lỗi lấy bài viết:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

