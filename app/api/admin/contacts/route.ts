import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import {
    getAllContacts,
    getContactById,
    updateContact,
    deleteContact,
    getUnreadContactsCount,
    type Contact,
} from "@/lib/db"

export async function GET(request: Request) {
    try {
        await requireAdmin()
        const { searchParams } = new URL(request.url)
        const unreadOnly = searchParams.get("unread") === "true"

        if (unreadOnly) {
            const count = await getUnreadContactsCount()
            return NextResponse.json({ count })
        }

        const contacts = await getAllContacts()
        return NextResponse.json(contacts)
    } catch (error) {
        console.error("Error fetching contacts:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch contacts"
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        await requireAdmin()
        const payload = await request.json()
        const { id, read } = payload

        if (!id || typeof read !== "boolean") {
            return NextResponse.json(
                { error: "id và read là bắt buộc" },
                { status: 400 }
            )
        }

        const contact = await updateContact(id, { read })

        if (!contact) {
            return NextResponse.json(
                { error: "Failed to update contact" },
                { status: 500 }
            )
        }

        return NextResponse.json(contact)
    } catch (error) {
        console.error("Error updating contact:", error)
        return NextResponse.json(
            { error: "Failed to update contact" },
            { status: 500 }
        )
    }
}

