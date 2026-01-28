"use client"

import { useEffect, useState, useRef } from "react"
import Image from "@/components/ui/image"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules"
import { getImageUrl } from "@/lib/image-utils"
import { Slide } from "@/lib/db"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-fade"

export default function SlideShow() {
    const [slides, setSlides] = useState<Slide[]>([])
    const [loading, setLoading] = useState(true)
    const [slideHeight, setSlideHeight] = useState<number>(0)
    const slideContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchSlides()
    }, [])

    useEffect(() => {
        const updateHeight = () => {
            if (slideContainerRef.current) {
                setSlideHeight(slideContainerRef.current.offsetHeight)
            }
        }

        updateHeight()
        window.addEventListener('resize', updateHeight)
        return () => window.removeEventListener('resize', updateHeight)
    }, [slides])

    const fetchSlides = async () => {
        try {
            const response = await fetch("/api/public/slides")
            if (response.ok) {
                const data = await response.json()
                setSlides(data)
            }
        } catch (error) {
            console.error("Error fetching slides:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="w-full h-[140px] sm:h-[180px] md:h-[240px] lg:h-[300px] xl:h-[320px] bg-gray-200 animate-pulse" />
        )
    }

    if (slides.length === 0) return null

    const SlideContent = ({ slide, children }: { slide: Slide; children: React.ReactNode }) => {
        if (slide.link) {
            return (
                <Link href={slide.link} className="relative w-full h-full block">
                    {children}
                </Link>
            )
        }
        return <div className="relative w-full h-full">{children}</div>
    }

    return (
        <div className="w-full pt-16 px-0">
            <div className="w-full container mx-auto px-0 sm:px-4">
                <div
                    ref={slideContainerRef}
                    className="relative rounded-none sm:rounded-[20px] md:mt-2 overflow-hidden bg-gray-900 w-full"
                >
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay, EffectFade]}
                        navigation
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        effect="fade"
                        fadeEffect={{
                            crossFade: true,
                        }}
                        loop={slides.length > 1}
                        speed={1000}
                        className="w-full"
                        style={{
                            "--swiper-navigation-color": "#fff",
                            "--swiper-pagination-color": "#fff",
                            "--swiper-navigation-size": "44px",
                        } as React.CSSProperties}
                    >
                        {slides.map((slide, index) => (
                            <SwiperSlide key={slide.id}>
                                <SlideContent slide={slide}>
                                    <div className="relative w-full">
                                        <div className="relative w-full">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={getImageUrl(slide.image)}
                                                alt={slide.title}
                                                className="w-full h-auto object-contain"
                                                loading={index === 0 ? "eager" : "lazy"}
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    display: 'block'
                                                }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12 z-10 pointer-events-none">
                                            <div className="container mx-auto">
                                                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white animate-fade-in leading-tight">
                                                    {slide.title}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                </SlideContent>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="pointer-events-none absolute inset-0 rounded-none sm:rounded-[20px]" />
                </div>
            </div>

            <style jsx global>{`
                .swiper-button-prev,
                .swiper-button-next {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1));
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    margin: 0 8px;
                }

                .swiper-button-prev {
                    left: 20px;
                }

                .swiper-button-next {
                    right: 20px;
                }

                .swiper-button-prev svg,
                .swiper-button-next svg {
                    width: auto;
                    height: auto;
                }
                
                .swiper-button-prev:hover,
                .swiper-button-next:hover {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2));
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    transform: scale(1.15);
                }

                .swiper-button-prev:active,
                .swiper-button-next:active {
                    transform: scale(0.95);
                }

                .swiper-button-prev::after,
                .swiper-button-next::after {
                    font-size: 22px;
                    font-weight: 900;
                    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }

                /* Tablet and Mobile */
                @media (max-width: 1024px) {
                    .swiper-button-prev,
                    .swiper-button-next {
                        width: 44px;
                        height: 44px;
                    }
                    
                    .swiper-button-prev::after,
                    .swiper-button-next::after {
                        font-size: 20px;
                    }
                }

                /* Mobile */
                @media (max-width: 640px) {
                    .swiper-button-prev,
                    .swiper-button-next {
                        width: 36px;
                        height: 36px;
                    }
                    
                    .swiper-button-prev::after,
                    .swiper-button-next::after {
                        font-size: 16px;
                    }
                }

                .swiper-pagination {
                    bottom: 16px !important;
                }

                @media (min-width: 768px) {
                    .swiper-pagination {
                        bottom: 24px !important;
                    }
                }

                .swiper-pagination-bullet {
                    width: 8px;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.4);
                    opacity: 1;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                }

                @media (min-width: 640px) {
                    .swiper-pagination-bullet {
                        width: 10px;
                        height: 10px;
                    }
                }

                .swiper-pagination-bullet:hover {
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(1.2);
                }

                .swiper-pagination-bullet-active {
                    width: 28px;
                    border-radius: 8px;
                    background: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
                    border: 2px solid rgba(255, 255, 255, 0.8);
                }

                @media (min-width: 640px) {
                    .swiper-pagination-bullet-active {
                        width: 36px;
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
            `}</style>
        </div>
    )
}
