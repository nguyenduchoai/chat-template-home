"use client"

import Link from "next/link"
import { MessageSquare, ArrowRight } from "lucide-react"
import { useSiteInfo } from "./providers/SiteInfoProvider"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export default function HeroSection() {
    const siteInfo = useSiteInfo()
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const heroRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect()
                setMousePosition({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                })
            }
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    const title = siteInfo?.bannerTitle || "AI Nha Khoa Saigon Dental"
    const description = siteInfo?.bannerDescription || "Tư vấn nha khoa thông minh với trí tuệ nhân tạo."

    // Custom background
    const bgImage = siteInfo?.heroBgImage
    const bgColor = siteInfo?.heroBgColor
    const customBgStyle: React.CSSProperties = bgImage
        ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : bgColor
        ? { background: bgColor }
        : {}

    return (
        <section
            ref={heroRef}
            className="hero-section relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden"
            style={customBgStyle}
        >
            {/* Animated background - only show if no custom bg */}
            {!bgImage && !bgColor && <div className="absolute inset-0 hero-bg" />}
            
            {/* Radial glow following mouse */}
            <div
                className="absolute inset-0 pointer-events-none opacity-30 transition-all duration-700"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(197,166,100,0.15), transparent 50%)`,
                }}
            />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${15 + i * 14}%`,
                            animationDelay: `${i * 1.5}s`,
                            animationDuration: `${8 + i * 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 container px-4 md:px-6 pt-20 pb-12">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    
                    {/* Logo/Icon */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-8"
                    >
                        <div className="hero-icon-glow relative">
                            <svg width="100" height="100" viewBox="0 0 100 100" className="hero-tooth-icon">
                                <defs>
                                    <linearGradient id="toothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#c5a664" />
                                        <stop offset="50%" stopColor="#e8d5a3" />
                                        <stop offset="100%" stopColor="#c5a664" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M50 8c-12 0-20 8-22 16-2 8 0 16 2 24 2 8 4 16 6 24 1 4 3 8 6 12 2 3 5 4 8 4s6-1 8-4c3-4 5-8 6-12 2-8 4-16 6-24 2-8 4-16 2-24C70 16 62 8 50 8z"
                                    fill="url(#toothGrad)"
                                    stroke="#c5a664"
                                    strokeWidth="1"
                                />
                                <text x="50" y="55" textAnchor="middle" fill="#1a1a2e" fontSize="22" fontWeight="bold" fontFamily="sans-serif">AI</text>
                            </svg>
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight hero-title mb-4"
                    >
                        {title}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed hero-description"
                    >
                        {description}
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="mb-10"
                    >
                        <Link href="/tro-chuyen">
                            <button className="hero-cta-button group">
                                <MessageSquare className="h-5 w-5" />
                                <span>{siteInfo?.heroCta || 'Bắt đầu tư vấn nha khoa ngay'}</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d0d1a] to-transparent" />
        </section>
    )
}
