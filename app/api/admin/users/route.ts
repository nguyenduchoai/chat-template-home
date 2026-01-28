import { NextResponse } from "next/server"
import { requireAdmin, requireSuperadmin } from "@/lib/auth"
import { createUser, getAllUsers, getUsersPaginated } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(request: Request) {
    try {
        await requireAdmin()

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1", 10)
        const limit = parseInt(searchParams.get("limit") || "10", 10)

        if (searchParams.has("page") || searchParams.has("limit")) {
            const result = await getUsersPaginated(page, limit)
            return NextResponse.json(result)
        }

        const users = await getAllUsers()
        return NextResponse.json(users)
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        await requireSuperadmin()
        const { name = "admin", email, password, role = "admin" } = await request.json()
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email và mật khẩu là bắt buộc" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        
        const user = await createUser({
            email,
            name,
            password: hashedPassword,
            role,
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error: any) {
        const message = error?.message || "Failed to create user"
        const status = message.includes("Email đã tồn tại") ? 409 : 500
        return NextResponse.json({ error: message }, { status })
    }
}
