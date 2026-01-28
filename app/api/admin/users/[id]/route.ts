import { NextResponse } from "next/server"
import { requireSuperadmin } from "@/lib/auth"
import { deleteUser, updateUser, getUserById } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
    try {
        const user = await requireSuperadmin()
        const resolvedParams = params instanceof Promise ? await params : params
        const userId = resolvedParams?.id
        if (!userId) {
            return NextResponse.json({ error: "Thiếu ID người dùng" }, { status: 400 })
        }
        if (user.id === userId) {
            return NextResponse.json({ error: "Bạn không thể xóa chính mình" }, { status: 403 })
        }

        await deleteUser(userId)

        return NextResponse.json(
            { success: true },
            { status: 200 }
        )
    } catch (error: any) {
        const message = error?.message || "Không thể xóa người dùng"
        const status = message === "Unauthorized"
            ? 401
            : message === "Forbidden"
                ? 403
                : 500

        return NextResponse.json(
            { error: message },
            { status }
        )
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
    try {
        const currentUser = await requireSuperadmin()
        const resolvedParams = params instanceof Promise ? await params : params
        const userId = resolvedParams?.id
        if (!userId) {
            return NextResponse.json({ error: "Thiếu ID người dùng" }, { status: 400 })
        }

        const targetUser = await getUserById(userId)
        if (!targetUser) {
            return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
        }

        const body = await request.json()
        const { name, role } = body

        const updateData: { name?: string; role?: string } = {}
        if (name !== undefined) updateData.name = name
        if (role !== undefined) {
            if (!["user", "admin", "superadmin"].includes(role)) {
                return NextResponse.json({ error: "Vai trò không hợp lệ" }, { status: 400 })
            }
            
            if (currentUser.id === userId && targetUser.role === "superadmin" && role !== "superadmin") {
                return NextResponse.json(
                    { error: "Bạn không thể hạ cấp chính mình" },
                    { status: 403 }
                )
            }
            
            updateData.role = role
        }

        const updatedUser = await updateUser(userId, updateData)
        if (!updatedUser) {
            return NextResponse.json({ error: "Không thể cập nhật người dùng" }, { status: 500 })
        }

        return NextResponse.json(updatedUser, { status: 200 })
    } catch (error: any) {
        const message = error?.message || "Không thể cập nhật người dùng"
        const status = message === "Unauthorized"
            ? 401
            : message === "Forbidden"
                ? 403
                : 500

        return NextResponse.json(
            { error: message },
            { status }
        )
    }
}


