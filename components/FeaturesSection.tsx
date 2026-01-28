"use client"

import Image from 'next/image'
import { convertColorForCSS } from '@/lib/color-utils'
import { useEffect, useState } from 'react'

const FALLBACK_TITLE = 'Tại sao chọn AI nha khoa?'
const FALLBACK_DESCRIPTION = 'Nền tảng AI cơ mối phần khoa, tư vấn chăm sóc răng miệng từ đội ngũ bác sĩ chuyên môn'

interface Feature {
    id: string
    icon: string
    title: string
    description: string
    order: number
    active: boolean
}

export default function FeaturesSection() {
    const [features, setFeatures] = useState<Feature[]>([])
    const [siteInfo, setSiteInfo] = useState<any>(null)

    useEffect(() => {
        // Fetch features and site info via API
        Promise.all([
            fetch('/api/public/features').then(res => res.json()),
            fetch('/api/public/site-info').then(res => res.json())
        ]).then(([feats, info]) => {
            setFeatures(feats || [])
            setSiteInfo(info)
        }).catch(err => {
            console.error('Error fetching features:', err)
        })
    }, [])

    if (!features.length) return null

    return (
        <section 
            className="w-full py-8 px-4"
            style={{
                background: `linear-gradient(to bottom, ${convertColorForCSS("var(--home-gradient-from)")}, ${convertColorForCSS("var(--home-gradient-to)")})`,
            }}
        >
            <div className="container mx-auto">
                <div className="flex flex-wrap justify-center items-stretch gap-6">
                    {features.map((feature) => (
                        <article
                            key={feature.id}
                            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)] max-w-sm"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                {feature.icon?.startsWith('http') ? (
                                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-blue-50 flex-shrink-0">
                                        <Image
                                            src={feature.icon}
                                            alt={feature.title}
                                            fill
                                            sizes="56px"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                                        {feature.icon || '✨'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed flex-1">{feature.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
