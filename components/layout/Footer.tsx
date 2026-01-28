"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { convertColorForCSS } from "@/lib/color-utils"
import { useSiteInfo } from "@/components/providers/SiteInfoProvider"

export default function ChatBar() {
    const [query, setQuery] = useState("")
    const pathname = usePathname()
    const siteInfo = useSiteInfo()

    // Ẩn ở trang tro-chuyen và các trang admin
    if (pathname?.startsWith("/tro-chuyen") || pathname?.startsWith("/admin")) {
        return null
    }

    const placeholder = siteInfo?.chatInputPlaceholder || "Hỏi bất cứ điều gì về AI..."

    return (

        <div>
            <div className="h-32" />
            <section className=" fixed bottom-0 left-0 right-0  w-full py-8 px-4"
                style={{
                    background: "linear-gradient(to top, var(--home-gradient-from), transparent)",
                }}>
                <div className="container mx-auto">
                    <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center p-3 sm:p-4 border rounded-xl sm:rounded-2xl bg-white">
                        <div className="flex items-center gap-2 flex-1 w-full min-w-0">
                            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                            <input
                                type="text"
                                placeholder={placeholder}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && query.trim()) {
                                        window.location.href = `/tro-chuyen?q=${encodeURIComponent(query)}`
                                    }
                                }}
                                className="flex-1 outline-none bg-transparent text-foreground placeholder:text-muted-foreground text-sm sm:text-base md:text-lg min-w-0"
                            />
                        </div>
                        <Link
                            href={`/tro-chuyen${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                            className="w-full md:w-auto flex-shrink-0"
                        >
                            <Button size="lg" className="w-full md:w-auto gap-2 text-sm sm:text-base">
                                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                                Trò chuyện
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div >
    )
}

