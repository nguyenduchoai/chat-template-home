"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "@/hooks/useSession"
import { Button } from "@/components/ui/button"
import { MessageSquare, User, LogOut, BookOpen, Phone, Menu, X } from "lucide-react"
import { useSiteInfo } from "@/components/providers/SiteInfoProvider"
import Image from "next/image"
import { useState } from "react"
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

    const handleSignOut = async () => {
        await fetch("/api/auth/signout", { method: "POST" })
        router.push("/login")
        router.refresh()
        setMobileMenuOpen(false)
    }
    if (pathname?.startsWith("/admin")) {
        return null
    }

    return (
        <header
            className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center"
            style={{ backgroundColor: "var(--header-bg)" }}
        >
            <div className="container flex h-16 items-center justify-between px-4" style={{ color: "var(--header-text)" }}>
                <Link href="/" className="flex items-center space-x-2">
                    {siteInfo.logo ? (
                        <span className="relative h-8 w-8 overflow-hidden rounded-full border border-border">
                            <Image src={siteInfo.logo} alt={siteInfo.title} fill className="object-cover" priority />
                        </span>
                    ) : null}
                    <span className="hidden sm:block text-lg font-semibold sm:text-xl">{siteInfo.name}</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                    <Link href="/bai-viet">
                        <Button variant="ghost" size="sm" className="gap-2 px-3 sm:px-4">
                            <BookOpen className="h-4 w-4" />
                            <span>Bài viết</span>
                        </Button>
                    </Link>
                    <Link href="/tro-chuyen">
                        <Button variant="ghost" size="sm" className="gap-2 px-3 sm:px-4">
                            <MessageSquare className="h-4 w-4" />
                            <span>Trò chuyện</span>
                        </Button>
                    </Link>
                    <Link href="/lien-he">
                        <Button variant="ghost" size="sm" className="gap-2 px-3 sm:px-4">
                            <Phone className="h-4 w-4" />
                            <span>Liên hệ</span>
                        </Button>
                    </Link>

                    {!loading && user ? (
                        <>
                            {(user.role === "admin" || user.role === "superadmin") && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm">Quản lý</Button>
                                </Link>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSignOut}
                                className="gap-2 px-3 sm:px-4"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Đăng xuất</span>
                            </Button>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="sm" className="gap-2 px-3 sm:px-4">
                                <User className="h-4 w-4" />
                                <span>Đăng nhập</span>
                            </Button>
                        </Link>
                    )}
                </nav>

                {/* Mobile Menu */}
                <div className="md:hidden">
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Mở menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-3/4 sm:max-w-sm p-2">
                            <SheetHeader>
                                <SheetTitle className="text-left">{siteInfo.name || siteInfo.title}</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-2 mt-6">
                                <Link href="/bai-viet" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        Bài viết
                                    </Button>
                                </Link>
                                <Link href="/tro-chuyen" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Trò chuyện
                                    </Button>
                                </Link>
                                <Link href="/lien-he" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <Phone className="h-4 w-4" />
                                        Liên hệ
                                    </Button>
                                </Link>

                                {!loading && user ? (
                                    <>
                                        {(user.role === "admin" || user.role === "superadmin") && (
                                            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                                                <Button variant="ghost" className="w-full justify-start">
                                                    Quản lý
                                                </Button>
                                            </Link>
                                        )}
                                        <Button
                                            variant="ghost"
                                            onClick={handleSignOut}
                                            className="w-full justify-start gap-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Đăng xuất
                                        </Button>
                                    </>
                                ) : (
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="default" className="w-full justify-start gap-2">
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

