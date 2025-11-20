"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, ArrowRight } from "lucide-react"
import { useSiteInfo } from "./providers/SiteInfoProvider"

export default function Banner() {
    const siteInfo = useSiteInfo()
    if (!siteInfo) {
        return null
    }
    return (
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-b from-white to-blue-50 flex justify-center">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                            {siteInfo.bannerTitle || siteInfo.title}
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                            {siteInfo.bannerDescription || siteInfo.description}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/tro-chuyen">
                            <Button size="lg" className="gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Bắt đầu chat ngay
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/bai-viet">
                            <Button size="lg" variant="outline">
                                Xem bài viết
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

