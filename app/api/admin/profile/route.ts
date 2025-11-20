import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-supabase"
import { getUserById, updateUser } from "@/lib/db"

export async function GET() {
    try {
        const user = await requireAuth()
        const dbUser = await getUserById(user.id)

        if (!dbUser) {
            return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
        }

        return NextResponse.json({
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            image: dbUser.image,
        })
    } catch (error) {
        console.error("Error fetching profile:", error)
        return NextResponse.json({ error: "Không thể tải thông tin cá nhân" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const user = await requireAuth()
        const { name, image } = await request.json()

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Tên không được để trống" }, { status: 400 })
        }

        const payload: { name: string; image?: string | null } = {
            name: name.trim(),
        }

        if (image !== undefined) {
            payload.image = image || null
        }

        const updatedUser = await updateUser(user.id, payload)

        if (!updatedUser) {
            return NextResponse.json({ error: "Không thể cập nhật thông tin" }, { status: 500 })
        }

        return NextResponse.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            image: updatedUser.image,
        })
    } catch (error) {
        console.error("Error updating profile:", error)
        return NextResponse.json({ error: "Không thể cập nhật thông tin" }, { status: 500 })
    }
}

