import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { requireAuth } from "@/lib/auth-supabase"
import { getUserById, updateUser } from "@/lib/db"

export async function PUT(request: Request) {
    try {
        const user = await requireAuth()
        const { currentPassword, newPassword } = await request.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 })
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự" }, { status: 400 })
        }

        const dbUser = await getUserById(user.id)
        if (!dbUser || !dbUser.password) {
            return NextResponse.json({ error: "Không thể xác thực người dùng" }, { status: 400 })
        }

        const isValid = await bcrypt.compare(currentPassword, dbUser.password)

        if (!isValid) {
            return NextResponse.json({ error: "Mật khẩu hiện tại không chính xác" }, { status: 400 })
        }

        const hashed = await bcrypt.hash(newPassword, 10)
        const updated = await updateUser(user.id, { password: hashed })

        if (!updated) {
            return NextResponse.json({ error: "Không thể cập nhật mật khẩu" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating password:", error)
        return NextResponse.json({ error: "Không thể cập nhật mật khẩu" }, { status: 500 })
    }
}

