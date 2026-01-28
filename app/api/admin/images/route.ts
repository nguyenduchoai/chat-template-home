import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { listImages } from "@/lib/storage"

function sanitizePrefix(prefix?: string | null) {
  if (!prefix) return ""
  return prefix.replace(/^\/*/, "").replace(/\/*$/, "").replace(/\.\./g, "")
}

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const prefix = sanitizePrefix(searchParams.get("prefix")) || "posts"
    const limit = Math.min(Number(searchParams.get("limit") ?? "60"), 200)

    const files = await listImages(prefix, limit)

    return NextResponse.json({ files })
  } catch (error: any) {
    console.error("Error fetching image library:", error)
    const message = error?.message || "Failed to fetch images"
    const status = message === "Unauthorized" || message === "Forbidden" ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
