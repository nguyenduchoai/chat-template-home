import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getSiteInfoRecord, updateSiteInfoRecord } from "@/lib/db"

export async function GET() {
    try {
        const siteInfo = await getSiteInfoRecord()
        return NextResponse.json(siteInfo)
    } catch (error) {
        console.error("Error fetching site info:", error)
        return NextResponse.json(
            { error: "Failed to fetch site info" },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const user = await requireAdmin()
        const payload = await request.json()

        if (!payload.siteUrl || !payload.title) {
            return NextResponse.json(
                { error: "siteUrl và title là bắt buộc" },
                { status: 400 }
            )
        }

        const siteInfo = await updateSiteInfoRecord(payload, user.id)

        if (!siteInfo) {
            return NextResponse.json(
                { error: "Failed to update site info" },
                { status: 500 }
            )
        }

        return NextResponse.json(siteInfo)
    } catch (error) {
        console.error("Error updating site info:", error)
        return NextResponse.json(
            { error: "Failed to update site info" },
            { status: 500 }
        )
    }
}

