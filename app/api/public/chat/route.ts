import { NextResponse } from "next/server";
import { getSiteInfoRecord } from "@/lib/db";

export async function POST(req: Request) {
    try {
        let body: any = {};
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { message: "Payload không hợp lệ" },
                { status: 400 }
            );
        }

        // Get chat config from database
        const siteInfo = await getSiteInfoRecord();
        const chatApiUrl = siteInfo?.chatApiUrl || process.env.NEXT_PUBLIC_BIZINO_API || process.env.NEXT_PUBLIC_IA_BASE_URL;
        const chatAssistantId = siteInfo?.chatAssistantId || process.env.NEXT_PUBLIC_BIZINO_BOT_UUID || process.env.NEXT_PUBLIC_IA_ASSISTANT_ID;
        
        if (!chatApiUrl || !chatAssistantId) {
            return NextResponse.json(
                { message: "Chat không được cấu hình. Vui lòng cấu hình trong Admin > Cài đặt" },
                { status: 503 }
            );
        }

        // Check if chat is enabled
        if (siteInfo?.chatEnabled === false) {
            return NextResponse.json(
                { message: "Chat đã tạm thời đóng" },
                { status: 503 }
            );
        }

        const threadId = req.headers.get("cookie")
            ?.split(/;\s*/)
            .find((c) => c.startsWith("thread_id="))
            ?.split("=")[1];

        if (!threadId) {
            return NextResponse.json(
                { message: "Thread ID không được mở", isOpen: false },
                { status: 400 }
            );
        }

        if (!body.message || typeof body.message !== "string") {
            return NextResponse.json(
                { message: "Tin nhắn không được để trống", isOpen: false },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${chatApiUrl}/botChat/chat`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bot_uuid: chatAssistantId,
                    channel_id: "web",
                    environment: "prod",
                    message: body.message,
                    thread_id: threadId,
                }),
            }
        );

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (err: any) {
        return NextResponse.json(
            { message: "Proxy error", error: err.message },
            { status: 500 }
        );
    }
}
