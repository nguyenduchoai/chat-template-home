import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/admin/app-sidebar"
import { SiteHeader } from "@/components/admin/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { requireAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const runtime = "nodejs"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    // Kiểm tra authentication và admin role
    await requireAdmin()
  } catch (error) {
    // Nếu chưa đăng nhập hoặc không phải admin, redirect về trang đăng nhập
    redirect("/login")
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
