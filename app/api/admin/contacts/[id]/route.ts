import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getContactById, updateContact, deleteContact } from "@/lib/db"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params
        const contact = await getContactById(id)

        if (!contact) {
            return NextResponse.json(
                { error: "Contact not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(contact)
    } catch (error) {
        console.error("Error fetching contact:", error)
        return NextResponse.json(
            { error: "Failed to fetch contact" },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params
        const payload = await request.json()

        const contact = await updateContact(id, payload)

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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params

        const success = await deleteContact(id)

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete contact" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting contact:", error)
        return NextResponse.json(
            { error: "Failed to delete contact" },
            { status: 500 }
        )
    }
}

