"use client"

import * as React from "react"
import {
  IconCamera,
  IconDashboard,
  IconFile,
  IconUsers,
  IconFileAi,
  IconFileDescription,
  IconSettings,
  IconPhoto,
  IconPhotoUp,
  IconUserCircle,
  IconPalette,
  IconMail,
} from "@tabler/icons-react"

import { NavMain } from "@/components/admin/nav-main"
import { NavSecondary } from "@/components/admin/nav-secondary"
import { NavUser } from "@/components/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSiteInfo } from "@/components/providers/SiteInfoProvider"
import Image from "@/components/ui/image"
import Link from "next/link"
import { NavDocuments } from "./nav-documents"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Người dùng",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Bài viết",
      url: "/admin/posts",
      icon: IconFile,
    },
    {
      title: "Liên hệ",
      url: "/admin/contacts",
      icon: IconMail,
    },
  ],
  navSecondary: [
    {
      title: "Hồ sơ cá nhân",
      url: "/admin/profile",
      icon: IconUserCircle,
    },
    {
      title: "Cài đặt",
      url: "/admin/settings",
      icon: IconSettings,
    },
    {
      title: "Màu sắc",
      url: "/admin/colors",
      icon: IconPalette,
    },
    {
      title: "Thư viện ảnh",
      url: "/admin/media",
      icon: IconPhotoUp,
    },
  ],
  documents: [
    {
      name: "Slides",
      url: "/admin/slides",
      icon: IconPhoto,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const siteInfo = useSiteInfo()
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" className="flex items-center gap-2">
                {siteInfo.logo ? (
                  <Image src={siteInfo.logo} alt={siteInfo.title} width={32} height={32} />
                ) : null}
                <span className="text-base font-semibold">{siteInfo.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
