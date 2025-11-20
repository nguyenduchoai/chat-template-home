"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send } from "lucide-react"
import { useState } from "react"

export default function ChatBar() {
    const [query, setQuery] = useState("")

    return (
        <div className="w-full bg-gradient-to-t from-white to-blue-50 py-8 px-4">
            <div className="container max-w-5xl mx-auto">
                <div className="flex flex-col gap-3 md:flex-row md:items-center p-4 border rounded-2xl bg-white">
                    <div className="flex items-center gap-2 flex-1 w-full">
                        <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Hỏi bất cứ điều gì về AI..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && query.trim()) {
                                    window.location.href = `/tro-chuyen?q=${encodeURIComponent(query)}`
                                }
                            }}
                            className="flex-1 outline-none bg-transparent text-foreground placeholder:text-muted-foreground text-base md:text-lg"
                        />
                    </div>
                    <Link
                        href={`/tro-chuyen${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                        className="w-full md:w-auto"
                    >
                        <Button size="lg" className="w-full md:w-auto gap-2">
                            <Send className="h-4 w-4" />
                            Trò chuyện
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

