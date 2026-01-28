import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { deleteImage, isSupabaseConfigured } from "@/lib/storage"

export async function DELETE(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      )
    }

    // Try to delete from local storage or Supabase
    const success = await deleteImage(path)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting image:", error)
    const message = error?.message || "Failed to delete image"
    const status = message === "Unauthorized" || message === "Forbidden" ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
