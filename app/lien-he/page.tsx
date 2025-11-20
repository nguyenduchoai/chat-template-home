"use client"

import { useSiteInfo } from "@/components/providers/SiteInfoProvider"
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Music2, Mail, Phone, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { ElementType } from "react"

type SocialKey = "facebook" | "instagram" | "twitter" | "linkedin" | "youtube" | "tiktok"

const socialConfigs: Array<{ key: SocialKey; label: string; icon: ElementType }> = [
    { key: "facebook", label: "Facebook", icon: Facebook },
    { key: "instagram", label: "Instagram", icon: Instagram },
    { key: "twitter", label: "Twitter", icon: Twitter },
    { key: "linkedin", label: "LinkedIn", icon: Linkedin },
    { key: "youtube", label: "YouTube", icon: Youtube },
    { key: "tiktok", label: "TikTok", icon: Music2 },
]

export default function ContactPage() {
    const siteInfo = useSiteInfo()
    const socials = socialConfigs.filter(({ key }) => siteInfo[key])

    return (
        <div className="pt-16 pb-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 pt-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Liên hệ với chúng tôi
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                        {siteInfo.description || "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các phương thức dưới đây."}
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-6">Thông tin liên hệ</h2>
                                <div className="space-y-4">
                                    {siteInfo.address && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 mb-1">Địa chỉ</p>
                                                <p className="text-sm text-slate-600">{siteInfo.address}</p>
                                            </div>
                                        </div>
                                    )}

                                    {siteInfo.phone && (
                                        <div className="flex items-start gap-3">
                                            <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 mb-1">Số điện thoại</p>
                                                <a
                                                    href={`tel:${siteInfo.phone}`}
                                                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                                >
                                                    {siteInfo.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {siteInfo.email && (
                                        <div className="flex items-start gap-3">
                                            <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 mb-1">Email</p>
                                                <a
                                                    href={`mailto:${siteInfo.email}`}
                                                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                                >
                                                    {siteInfo.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {siteInfo.contact && (
                                        <div className="flex items-start gap-3">
                                            <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 mb-1">Liên hệ</p>
                                                <p className="text-sm text-slate-600">{siteInfo.contact}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {socials.length > 0 && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm font-medium text-slate-900 mb-3">Theo dõi chúng tôi</p>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {socials.map(({ key, label, icon: Icon }) => (
                                            <a
                                                key={key}
                                                href={siteInfo[key as SocialKey] as string}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={label}
                                                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-600 transition-colors bg-white"
                                            >
                                                <Icon className="h-4 w-4" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
