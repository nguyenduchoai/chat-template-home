import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const { isReset } = await req.json();
        let threadId = req.headers.get("cookie")
            ?.split("; ")
            .find((c) => c.startsWith("thread_id="))
            ?.split("=")[1];

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
        res.cookies.set("thread_id", threadId, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            sameSite: "lax", // Safari-compatible
            secure: process.env.NODE_ENV === "production", // HTTPS in production
            path: "/", // Ensure cookie is available across the site
        });

        return res;
    } catch (err: any) {
        console.log("Error:", err);
        return NextResponse.json(
            { message: "Proxy error", error: err.message },
            { status: 500 }
        );
    }
}
