import { NextResponse } from "next/server"
import { getSiteInfoRecord } from "@/lib/db"

const FALLBACK_SITE_INFO = {
    siteUrl: "https://example.com",
    title: "AI Platform",
    name: "AI Platform",
    description: "Nền tảng khám phá trí tuệ nhân tạo.",
    author: "AI Platform",
    bannerTitle: "Trải nghiệm AI thông minh",
    bannerDescription: "Khám phá sức mạnh của trí tuệ nhân tạo với công cụ chat tiên tiến.",
}

export async function GET() {
    try {
        const siteInfo = await getSiteInfoRecord()
        if (!siteInfo) {
            return NextResponse.json(FALLBACK_SITE_INFO)
        }
        return NextResponse.json(siteInfo)
    } catch (error) {
        console.error("Error fetching site info:", error)
        return NextResponse.json(FALLBACK_SITE_INFO)
    }
}