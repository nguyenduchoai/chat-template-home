"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "@/hooks/useSession"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    LogOut,
    Home
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    {
        name: "Tổng quan",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        name: "Bài viết",
        href: "/admin/posts",
        icon: FileText,
    },
    {
        name: "Người dùng",
        href: "/admin/users",
        icon: Users,
    },
    {
        name: "Cài đặt",
        href: "/admin/settings",
        icon: Settings,
    },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { user } = useSession()

    const handleSignOut = async () => {
        await fetch("/api/auth/signout", { method: "POST" })
        router.push("/login")
        router.refresh()
    }

    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold">Admin Panel</h2>
                {user && (
                    <p className="text-sm text-muted-foreground mt-1">
                        {user.email}
                    </p>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-border space-y-2">
                <Link href="/">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                    >
                        <Home className="h-5 w-5" />
                        Về trang chủ
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <LogOut className="h-5 w-5" />
                    Đăng xuất
                </Button>
            </div>
        </aside>
    )
}

