import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { uploadImage } from "@/lib/storage"

function sanitizeFolder(folder?: string | null) {
  if (!folder) return "posts"
  return folder.replace(/^\/*/, "").replace(/\/*$/, "").replace(/\.\./g, "") || "posts"
}

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = sanitizeFolder(formData.get("folder") as string | null)

    if (!file) {
      return NextResponse.json({ error: "Không có file được tải lên" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File phải là ảnh" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Kích thước file không được vượt quá 5MB" }, { status: 400 })
    }

    // Upload to local storage
    const result = await uploadImage(file, folder)

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Không thể tải ảnh lên" }, { status: 500 })
    }

    return NextResponse.json({ url: result.url })
  } catch (error: any) {
    console.error("Error uploading image:", error)
    const message = error?.message || "Không thể tải ảnh lên"
    const status = message === "Unauthorized" || message === "Forbidden" ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
