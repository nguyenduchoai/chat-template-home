"use client"

import type { ElementType } from "react"
import Link from "next/link"
import { useSiteInfo } from "@/components/providers/SiteInfoProvider"
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Music2 } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"

const navLinks = [
    { href: "/bai-viet", label: "Bài viết" },
    { href: "/tro-chuyen", label: "Trò chuyện" },
    { href: "/admin", label: "Quản trị" },
]

type SocialKey = "facebook" | "instagram" | "twitter" | "linkedin" | "youtube" | "tiktok"

const socialConfigs: Array<{ key: SocialKey; label: string; icon: ElementType }> = [
    { key: "facebook", label: "Facebook", icon: Facebook },
    { key: "instagram", label: "Instagram", icon: Instagram },
    { key: "twitter", label: "Twitter", icon: Twitter },
    { key: "linkedin", label: "LinkedIn", icon: Linkedin },
    { key: "youtube", label: "YouTube", icon: Youtube },
    { key: "tiktok", label: "TikTok", icon: Music2 },
]

export default function Footer() {
    const siteInfo = useSiteInfo()
    const pathname = usePathname()

    const socials = socialConfigs.filter(({ key }) => siteInfo[key])

    if (pathname?.startsWith("/admin") || pathname?.startsWith("/tro-chuyen")) {
        return null
    }

    return (
        <footer className="bg-gradient-to-b from-white via-blue-50/40 to-blue-50 border-t border-slate-100 mt-12 text-slate-900">
            <div className="container px-4 py-10 grid gap-10 md:grid-cols-3 mx-auto">
                <div className="space-y-4">
                    <Link href="/" className="flex items-center space-x-3">
                        {siteInfo.logo ? (
                            <span className="relative h-10 w-10 overflow-hidden rounded-full border border-border">
                                <img src={siteInfo.logo} alt={siteInfo.title} className="object-cover" />
                            </span>
                        ) : null}
                        <div className="flex-1">
                            <p className="text-lg font-semibold text-slate-900">{siteInfo.name ?? siteInfo.title}</p>
                            <p className="text-sm text-slate-500">{siteInfo.description}</p>
                        </div>
                    </Link>
                    {socials.length > 0 && (
                        <div className="flex items-center gap-3 flex-wrap">
                            {socials.map(({ key, label, icon: Icon }) => (
                                <Link
                                    key={key}
                                    href={siteInfo[key as SocialKey] as string}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={label}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-blue-600 transition-colors bg-white"
                                >
                                    <Icon className="h-4 w-4" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 mb-4">Điều hướng</p>
                    <ul className="space-y-2">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Liên hệ</p>
                    {siteInfo.address && <p className="text-sm text-slate-700">{siteInfo.address}</p>}
                    {siteInfo.contact && <p className="text-sm text-slate-700">{siteInfo.contact}</p>}
                    {siteInfo.email && (
                        <p className="text-sm text-slate-700">
                            <span className="font-semibold text-slate-900">Email: </span>
                            {siteInfo.email}
                        </p>
                    )}
                    {siteInfo.phone && (
                        <p className="text-sm text-slate-700">
                            <span className="font-semibold text-slate-900">SĐT: </span>
                            {siteInfo.phone}
                        </p>
                    )}
                </div>
            </div>
            <div className="border-t">
                <div className="p-4 text-center text-xs text-slate-500">
                    {`© ${new Date().getFullYear()} ${siteInfo.author}`}
                </div>
            </div>
        </footer>
    )
}

