"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "@/hooks/useSession"
import { Button } from "@/components/ui/button"
import { MessageSquare, User, LogOut, BookOpen, Phone, Menu } from "lucide-react"
import { useSiteInfo } from "@/components/providers/SiteInfoProvider"
import Image from "@/components/ui/image"
import { useState, useEffect } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export default function Header() {
    const { user, loading } = useSession()
    const pathname = usePathname()
    const router = useRouter()
    const siteInfo = useSiteInfo()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleSignOut = async () => {
        await fetch("/api/auth/signout", { method: "POST" })
        router.push("/login")
        router.refresh()
        setMobileMenuOpen(false)
    }

    if (pathname?.startsWith("/admin")) {
        return null
    }

    const isHome = pathname === "/"

    return (
        <header
            className={`fixed top-0 z-50 w-full flex justify-center transition-all duration-300 ${
                scrolled
                    ? "dental-header-scrolled"
                    : isHome
                    ? "dental-header-transparent"
                    : "dental-header-scrolled"
            }`}
        >
            <div className="container flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2">
                    {siteInfo.logo ? (
                        <span className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-[#c5a664]/50">
                            <Image src={siteInfo.logo} alt={siteInfo.title} fill className="object-cover" priority />
                        </span>
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#c5a664] to-[#e8d5a3] flex items-center justify-center text-[#1a1a2e] font-bold text-sm">
                            SD
                        </div>
                    )}
                    <span className="hidden sm:block text-lg font-semibold text-white">
                        {siteInfo.name || "Saigon Dental"}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    <Link href="/bai-viet">
                        <Button variant="ghost" size="sm" className="gap-2 text-gray-300 hover:text-white hover:bg-white/10">
                            <BookOpen className="h-4 w-4" />
                            Bài viết
                        </Button>
                    </Link>
                    <Link href="/tro-chuyen">
                        <Button variant="ghost" size="sm" className="gap-2 text-gray-300 hover:text-white hover:bg-white/10">
                            <MessageSquare className="h-4 w-4" />
                            Trò chuyện
                        </Button>
                    </Link>
                    <Link href="/lien-he">
                        <Button variant="ghost" size="sm" className="gap-2 text-gray-300 hover:text-white hover:bg-white/10">
                            <Phone className="h-4 w-4" />
                            Liên hệ
                        </Button>
                    </Link>

                    {!loading && user ? (
                        <>
                            {(user.role === "admin" || user.role === "superadmin") && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                                        Quản lý
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSignOut}
                                className="gap-2 text-gray-300 hover:text-white hover:bg-white/10"
                            >
                                <LogOut className="h-4 w-4" />
                                Đăng xuất
                            </Button>
                        </>
                    ) : (
                        <Link href="/login">
                            <button className="dental-login-button">
                                <User className="h-4 w-4" />
                                Đăng nhập
                            </button>
                        </Link>
                    )}
                </nav>

                {/* Mobile Menu */}
                <div className="md:hidden">
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Mở menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-3/4 sm:max-w-sm p-2 bg-[#1a1a2e] border-[#c5a664]/20">
                            <SheetHeader>
                                <SheetTitle className="text-left text-white">{siteInfo.name || "Saigon Dental"}</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-2 mt-6">
                                <Link href="/bai-viet" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-white/10">
                                        <BookOpen className="h-4 w-4" />
                                        Bài viết
                                    </Button>
                                </Link>
                                <Link href="/tro-chuyen" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-white/10">
                                        <MessageSquare className="h-4 w-4" />
                                        Trò chuyện
                                    </Button>
                                </Link>
                                <Link href="/lien-he" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-white/10">
                                        <Phone className="h-4 w-4" />
                                        Liên hệ
                                    </Button>
                                </Link>

                                {!loading && user ? (
                                    <>
                                        {(user.role === "admin" || user.role === "superadmin") && (
                                            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                                                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                                                    Quản lý
                                                </Button>
                                            </Link>
                                        )}
                                        <Button
                                            variant="ghost"
                                            onClick={handleSignOut}
                                            className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-white/10"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Đăng xuất
                                        </Button>
                                    </>
                                ) : (
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="default" className="w-full justify-start gap-2 bg-[#c5a664] text-[#1a1a2e] hover:bg-[#d4b876]">
                                            <User className="h-4 w-4" />
                                            Đăng nhập
                                        </Button>
                                    </Link>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
