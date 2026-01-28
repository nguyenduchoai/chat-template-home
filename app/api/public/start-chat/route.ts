import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSiteInfoRecord } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { isReset } = await req.json();
        
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
        
        // Safari-compatible cookie parsing
        let threadId: string | undefined;
        const cookieHeader = req.headers.get("cookie");
        
        if (cookieHeader) {
            const cookies = cookieHeader.split(/;\s*/);
            const threadCookie = cookies.find((c) => c.trim().startsWith("thread_id="));
            if (threadCookie) {
                threadId = threadCookie.split("=")[1]?.trim();
            }
        }

        if (!threadId || isReset) {
            threadId = uuidv4();
        }
        
        const response = await fetch(
            `${chatApiUrl}/botChat/startChat`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bot_uuid: chatAssistantId,
                    thread_id: threadId,
                    channel_id: "web",
                    environment: "prod",
                }),
            }
        );

        const data = await response.json();

        const res = NextResponse.json(data, { status: response.status });
        // Safari-compatible cookie settings
        const isProduction = process.env.NODE_ENV === "production";
        res.cookies.set("thread_id", threadId, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: "lax",
            secure: isProduction,
            path: "/",
        });

        return res;
    } catch (err: any) {
        console.error("Error in start-chat:", err);
        return NextResponse.json(
            { message: "Proxy error", error: err.message },
            { status: 500 }
        );
    }
}
