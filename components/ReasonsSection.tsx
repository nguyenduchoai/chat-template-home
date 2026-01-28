"use client"

import { cn } from '@/lib/utils'
import { convertColorForCSS } from '@/lib/color-utils'
import { useEffect, useState } from 'react'

const FALLBACK_TITLE = 'Số liệu ấn tượng'
const FALLBACK_DESCRIPTION = 'Những con số chứng minh chất lượng dịch vụ của chúng tôi'

interface Reason {
    id: string
    icon: string
    title: string
    description: string
    order: number
    active: boolean
}

export default function ReasonsSection() {
    const [reasons, setReasons] = useState<Reason[]>([])
    const [siteInfo, setSiteInfo] = useState<any>(null)

    useEffect(() => {
        // Fetch reasons and site info via API
        Promise.all([
            fetch('/api/public/reasons').then(res => res.json()),
            fetch('/api/public/site-info').then(res => res.json())
        ]).then(([reasonsData, info]) => {
            setReasons(reasonsData || [])
            setSiteInfo(info)
        }).catch(err => {
            console.error('Error fetching reasons:', err)
        })
    }, [])

    if (!reasons.length) return null

    const title = siteInfo?.reasonsTitle || FALLBACK_TITLE
    const description = siteInfo?.reasonsDescription || FALLBACK_DESCRIPTION
    const colClass = reasons.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'

    return (
        <section 
            className="w-full py-8 px-4"
            style={{
                background: `linear-gradient(to top, ${convertColorForCSS("var(--home-gradient-from)")}, ${convertColorForCSS("var(--home-gradient-to)")})`,
            }}
        >
            <div className="container mx-auto">
                <div className="text-center mb-12 space-y-3">
                    <h2 className="text-4xl font-bold" style={{ color: "var(--home-text)" }}>
                        {title}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto" style={{ color: "var(--home-text)" }}>
                        {description}
                    </p>
                </div>

                <div className={cn('grid gap-5 sm:grid-cols-2', colClass)}>
                    {reasons.map((reason) => (
                        <article
                            key={reason.id}
                            className="rounded-2xl bg-white p-6 text-center border border-slate-100 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-wide text-blue-600">{reason.icon}</div>
                            <h3 className="text-xl font-semibold mb-2 text-slate-900">{reason.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{reason.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
