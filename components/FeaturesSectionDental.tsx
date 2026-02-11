"use client"

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Feature {
    id: string
    icon: string
    title: string
    description: string
    order: number
    active: boolean
}

export default function FeaturesSectionDental() {
    const [features, setFeatures] = useState<Feature[]>([])
    const [siteInfo, setSiteInfo] = useState<any>(null)

    useEffect(() => {
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

    const title = siteInfo?.featuresTitle || 'Tại sao chọn Saigon Dental AI?'
    const description = siteInfo?.featuresDescription || 'Nền tảng AI cá nhân hoá, tư vấn chăm sóc răng miệng từ đội ngũ bác sĩ chuyên môn'

    const bgImage = siteInfo?.featuresBgImage
    const bgColor = siteInfo?.featuresBgColor
    const customBgStyle: React.CSSProperties = bgImage
        ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : bgColor
        ? { background: bgColor }
        : {}

    return (
        <section className="dental-features-section relative w-full py-10 md:py-14 px-4" style={customBgStyle}>
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c5a664]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#c5a664]/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto relative z-10">
                {/* Feature cards */}
                <div className="flex flex-wrap justify-center items-stretch gap-5 md:gap-6">
                    {features.map((feature, index) => (
                        <motion.article
                            key={feature.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            className="dental-feature-card w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.833rem)] max-w-sm"
                        >
                            <div className="dental-feature-card-inner p-6 md:p-8 h-full flex flex-col">
                                {/* Icon */}
                                <div className="dental-feature-icon-wrapper mb-5">
                                    {feature.icon?.startsWith('http') || feature.icon?.startsWith('/') ? (
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                                            <Image
                                                src={feature.icon}
                                                alt={feature.title}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="dental-feature-icon text-3xl">
                                            {feature.icon || '🦷'}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <h3 className="text-lg md:text-xl font-bold text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    )
}
