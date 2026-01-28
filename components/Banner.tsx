"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, ArrowRight } from "lucide-react"
import { useSiteInfo } from "./providers/SiteInfoProvider"
import { convertColorForCSS } from "@/lib/color-utils"

export default function Banner() {
    const siteInfo = useSiteInfo()
    
    if (!siteInfo) {
        return null
    }

    // Map size values to Tailwind classes
    const titleSizeClasses: Record<string, string> = {
        '4xl': 'text-3xl sm:text-4xl md:text-4xl lg:text-4xl',
        '5xl': 'text-4xl sm:text-4xl md:text-5xl lg:text-5xl',
        '6xl': 'text-4xl sm:text-5xl md:text-6xl lg:text-6xl',
        '7xl': 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
        '8xl': 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl',
        '9xl': 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl',
    }
    
    const descriptionSizeClasses: Record<string, string> = {
        'base': 'text-sm md:text-base',
        'lg': 'text-base md:text-lg',
        'xl': 'text-lg md:text-xl',
        '2xl': 'text-xl md:text-2xl',
        '3xl': 'text-2xl md:text-3xl',
    }

    const titleSize = siteInfo.homeTitleSize || '6xl'
    const descriptionSize = siteInfo.homeDescriptionSize || 'xl'

    return (
        <section
            className="relative w-full py-16 md:py-24 flex justify-center"
            style={{
                background: `linear-gradient(to top, ${convertColorForCSS("var(--home-gradient-from)")}, ${convertColorForCSS("var(--home-gradient-to)")})`,
            }}
        >
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h1
                            className={`${titleSizeClasses[titleSize] || titleSizeClasses['6xl']} font-bold tracking-tighter`}
                            style={{ color: "var(--home-text)" }}
                        >
                            {siteInfo.bannerTitle || siteInfo.title}
                        </h1>
                        <p 
                            className={`mx-auto max-w-[700px] text-muted-foreground ${descriptionSizeClasses[descriptionSize] || descriptionSizeClasses['xl']}`}
                            style={{ color: "var(--home-text)" }}
                        >
                            {siteInfo.bannerDescription || siteInfo.description}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/tro-chuyen">
                            <Button 
                                size="lg" 
                                className="gap-2"
                                style={{
                                    backgroundColor: convertColorForCSS("var(--button)"),
                                    color: convertColorForCSS("var(--button-text)"),
                                }}
                            >
                                <MessageSquare className="h-5 w-5" />
                                Bắt đầu chat ngay
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/bai-viet">
                            <Button size="lg" variant="outline" style={{ color: "var(--home-text)" }}>
                                Xem bài viết
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

