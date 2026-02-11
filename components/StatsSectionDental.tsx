"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Reason {
    id: string
    icon: string
    title: string
    description: string
    order: number
    active: boolean
}

export default function StatsSectionDental() {
    const [reasons, setReasons] = useState<Reason[]>([])
    const [siteInfo, setSiteInfo] = useState<any>(null)

    useEffect(() => {
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

    const title = siteInfo?.reasonsTitle || 'Số liệu nổi bật'
    const description = siteInfo?.reasonsDescription || 'Những con số chứng minh chất lượng dịch vụ'

    const bgImage = siteInfo?.statsBgImage
    const bgColor = siteInfo?.statsBgColor
    const customBgStyle: React.CSSProperties = bgImage
        ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : bgColor
        ? { background: bgColor }
        : {}

    return (
        <section className="dental-stats-section relative w-full py-10 md:py-14 px-4" style={customBgStyle}>
            <div className="container mx-auto relative z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-center mb-10"
                >
                    <span className="dental-badge">
                        {title}
                    </span>
                </motion.div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
                    {reasons.map((reason, index) => (
                        <motion.div
                            key={reason.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="dental-stat-card"
                        >
                            <div className="dental-stat-card-inner p-5 md:p-6 text-center">
                                <div className="dental-stat-value text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2">
                                    {reason.icon}
                                </div>
                                <div className="text-sm md:text-base text-gray-400">
                                    {reason.title}
                                </div>
                                {reason.description && (
                                    <p className="text-xs text-gray-500 mt-1 hidden md:block">
                                        {reason.description}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
