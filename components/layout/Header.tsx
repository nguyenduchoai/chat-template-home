"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSupabaseSession } from "@/hooks/useSupabaseSession"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { MessageSquare, User, LogOut, BookOpen } from "lucide-react"
import { useSiteInfo } from "@/components/providers/SiteInfoProvider"
import Image from "next/image"

export default function Header() {
    const { user, loading } = useSupabaseSession()
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createSupabaseClient()
    const siteInfo = useSiteInfo()



    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }
    if (pathname?.startsWith("/admin")) {
        return null
    }
    return (
        <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
            <div className="container flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2">
                    {siteInfo.logo ? (
                        <span className="relative h-8 w-8 overflow-hidden rounded-full border border-border">
                            <Image src={siteInfo.logo} alt={siteInfo.title} fill className="object-cover" priority />
                        </span>
                    ) : null}
                    <span className="hidden sm:block text-lg font-semibold sm:text-xl">{siteInfo.name}</span>
                </Link>

                <nav className="flex items-center gap-2">
                    <Link href="/bai-viet">
                        <Button variant="ghost" size="sm" className="gap-2 px-3 sm:px-4">
                            <BookOpen className="h-4 w-4" />
                            <span className="hidden sm:inline">Bài viết</span>
                        </Button>
                    </Link>
                    <Link href="/tro-chuyen">
                        <Button variant="ghost" size="sm" className="gap-2 px-3 sm:px-4">
                            <MessageSquare className="h-4 w-4" />
                            <span className="hidden sm:inline">Trò chuyện</span>
                        </Button>
                    </Link>

                    {!loading && user ? (
                        <>
                            {user.role === "admin" && (
                                <Link href="/admin" className="hidden sm:block">
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
                                <span className="hidden sm:inline">Đăng xuất</span>
                            </Button>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="sm" className="gap-2 px-3 sm:px-4">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">Đăng nhập</span>
                            </Button>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}

