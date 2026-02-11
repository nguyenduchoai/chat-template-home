"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, Send, Phone } from "lucide-react"
import { useState } from "react"
import { useSiteInfo } from "@/components/providers/SiteInfoProvider"

export default function Footer() {
    const [query, setQuery] = useState("")
    const pathname = usePathname()
    const siteInfo = useSiteInfo()

    // Ẩn ở trang tro-chuyen và các trang admin
    if (pathname?.startsWith("/tro-chuyen") || pathname?.startsWith("/admin")) {
        return null
    }

    const placeholder = siteInfo?.chatInputPlaceholder || "Bạn nhập câu hỏi"
    const phone = siteInfo?.phone
    const hotlineText = siteInfo?.footerHotlineText || "Liên hệ Bác sỹ để được tư vấn tốt hơn"
    const chatHint = siteInfo?.footerChatHint || "Vui lòng nhập câu hỏi để được tư vấn"

    const handleSubmit = () => {
        if (query.trim()) {
            window.location.href = `/tro-chuyen?q=${encodeURIComponent(query)}`
        }
    }

    return (
        <div>
            {/* Spacer to prevent content from being hidden behind fixed footer */}
            <div className="h-28" />

            {/* Fixed footer */}
            <footer className="fixed bottom-0 left-0 right-0 z-50 dental-fixed-footer">
                {/* Hotline bar */}
                {phone && (
                    <div className="dental-hotline-bar">
                        <span className="text-gray-400 text-sm">{hotlineText} –</span>
                        <a href={`tel:${phone}`} className="dental-footer-hotline font-bold text-sm flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            Hotline: {phone}
                        </a>
                    </div>
                )}

                {/* Chat input bar */}
                <div className="dental-chat-bar">
                    <div className="container mx-auto px-4">
                        <p className="text-gray-500 text-xs text-center mb-2">{chatHint}</p>
                        <div className="dental-chat-input-bar">
                            <MessageSquare className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder={placeholder}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSubmit()
                                }}
                                className="dental-footer-input"
                            />
                            <Link
                                href={`/tro-chuyen${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                                className="flex-shrink-0"
                            >
                                <button className="dental-footer-send-btn">
                                    <Send className="h-4 w-4" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
