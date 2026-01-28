import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const { isReset } = await req.json();
        
        // Safari-compatible cookie parsing
        // Safari may format cookies differently (with or without spaces)
        let threadId: string | undefined;
        const cookieHeader = req.headers.get("cookie");
        
        if (cookieHeader) {
            // Handle both "; " and ";" separators (Safari compatibility)
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
            `${process.env.NEXT_PUBLIC_BIZINO_API}/botChat/startChat`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bot_uuid: process.env.NEXT_PUBLIC_BIZINO_BOT_UUID,
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
            sameSite: "lax", // Safari-compatible - allows cookie in same-site requests
            secure: isProduction, // Only secure in production (HTTPS)
            path: "/", // Ensure cookie is available across the site
            // Don't set domain to allow subdomain access if needed
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
