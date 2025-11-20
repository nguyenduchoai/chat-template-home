"use client"

import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { ImageUpload } from "@/components/editor/image-upload"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const DEFAULT_SETTINGS = {
    siteUrl: "",
    title: "",
    name: "",
    logo: "",
    description: "",
    keywords: "",
    bannerTitle: "",
    bannerDescription: "",
    featuresTitle: "",
    featuresDescription: "",
    reasonsTitle: "",
    reasonsDescription: "",
    author: "",
    email: "",
    phone: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
    address: "",
    contact: "",
    ogImage: "",
    ogType: "",
    twitterCard: "",
}

type SettingsState = typeof DEFAULT_SETTINGS
type SettingsKey = keyof SettingsState

const SOCIAL_FIELDS: SettingsKey[] = ["facebook", "instagram", "twitter", "linkedin", "youtube", "tiktok"]
const InputDiv = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {children}
        </div>
    )
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<SettingsState>({ ...DEFAULT_SETTINGS })
    const { showToast } = useToast()

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const response = await fetch("/api/admin/site-info")
            if (response.ok) {
                const data: Partial<Record<SettingsKey, string | null>> = await response.json()
                const next = { ...DEFAULT_SETTINGS }
                    ; (Object.keys(DEFAULT_SETTINGS) as SettingsKey[]).forEach((key) => {
                        const value = data?.[key]
                        next[key] = typeof value === "string" ? value : value ?? DEFAULT_SETTINGS[key]
                    })
                setSettings(next)
            }
        } catch (error) {
            console.error("Error fetching settings:", error)
            showToast("error", "Không thể tải thông tin site")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: keyof SettingsState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value
        setSettings((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSaving(true)
        try {
            const response = await fetch("/api/admin/site-info", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })

            if (response.ok) {
                showToast("success", "Đã cập nhật thông tin trang web")
                fetchSettings()
            } else {
                const { error } = await response.json().catch(() => ({ error: "Không thể cập nhật" }))
                showToast("error", error || "Không thể cập nhật thông tin")
            }
        } catch (error) {
            console.error("Error saving setting:", error)
            showToast("error", "Có lỗi xảy ra khi lưu cài đặt")
        } finally {
            setSaving(false)
        }
    }


    return (
        <main className="py-12 px-4">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Cài đặt trang web</h1>
                <p className="text-muted-foreground mt-2">
                    Cập nhật nội dung hiển thị, thông tin liên hệ và metadata cho toàn bộ website
                </p>
            </div>

            {
                loading ?
                    <div className="flex justify-center items-center h-full">
                        <Spinner />
                    </div>
                    :
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin chung</CardTitle>
                                <CardDescription>Hiển thị ở phần tiêu đề và metadata</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <InputDiv>
                                    <label className="text-sm font-medium">Tiêu đề trang *</label>
                                    <Input value={settings.title} onChange={handleChange("title")} placeholder="AI Platform" required />
                                </InputDiv>
                                <InputDiv>
                                    <label className="text-sm font-medium">Tên hiển thị</label>
                                    <Input value={settings.name} onChange={handleChange("name")} placeholder="AI Platform" />
                                </InputDiv>
                                <InputDiv className="md:col-span-2">
                                    <label className="text-sm font-medium">URL trang *</label>
                                    <Input type="url" value={settings.siteUrl} onChange={handleChange("siteUrl")} placeholder="https://example.com" required />
                                </InputDiv>
                                <InputDiv className="md:col-span-2">
                                    <ImageUpload
                                        label="Logo"
                                        value={settings.logo}
                                        onChange={(url) => setSettings((prev) => ({ ...prev, logo: url }))}
                                        enableLibrary
                                        folder="branding"
                                    />
                                </InputDiv>
                                <InputDiv className="md:col-span-2">
                                    <label className="text-sm font-medium">Mô tả</label>
                                    <Textarea value={settings.description} onChange={handleChange("description")} rows={3} placeholder="Mô tả ngắn gọn..." />
                                </InputDiv>
                                <InputDiv className="md:col-span-2">
                                    <label className="text-sm font-medium">Từ khóa (SEO)</label>
                                    <Input value={settings.keywords} onChange={handleChange("keywords")} placeholder="AI, chatbot, ..." />
                                </InputDiv>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Nội dung Banner</CardTitle>
                                <CardDescription>Hiển thị ở trang chủ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InputDiv>
                                    <label className="text-sm font-medium">Tiêu đề Banner</label>
                                    <Input value={settings.bannerTitle} onChange={handleChange("bannerTitle")} placeholder="Trải nghiệm AI thông minh" />
                                </InputDiv>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mô tả Banner</label>
                                    <Textarea value={settings.bannerDescription} onChange={handleChange("bannerDescription")} rows={3} placeholder="Khám phá sức mạnh..." />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Section Tính năng</CardTitle>
                                <CardDescription>Tiêu đề và mô tả section các tính năng</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InputDiv>
                                    <label className="text-sm font-medium">Tiêu đề</label>
                                    <Input value={settings.featuresTitle} onChange={handleChange("featuresTitle")} placeholder="Tại sao chọn AI nha khoa?" />
                                </InputDiv>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mô tả</label>
                                    <Textarea value={settings.featuresDescription} onChange={handleChange("featuresDescription")} rows={2} placeholder="Nền tảng AI..." />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Section Lý do chọn</CardTitle>
                                <CardDescription>Tiêu đề và mô tả section số liệu</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InputDiv>
                                    <label className="text-sm font-medium">Tiêu đề</label>
                                    <Input value={settings.reasonsTitle} onChange={handleChange("reasonsTitle")} placeholder="Số liệu ấn tượng" />
                                </InputDiv>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mô tả</label>
                                    <Textarea value={settings.reasonsDescription} onChange={handleChange("reasonsDescription")} rows={2} placeholder="Những con số chứng minh..." />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Liên hệ</CardTitle>
                                <CardDescription>Thông tin xuất hiện ở footer</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <InputDiv>
                                    <label className="text-sm font-medium">Tác giả/Tổ chức</label>
                                    <Input value={settings.author} onChange={handleChange("author")} />
                                </InputDiv>
                                <InputDiv>
                                    <label className="text-sm font-medium">Email</label>
                                    <Input type="email" value={settings.email} onChange={handleChange("email")} placeholder="contact@example.com" />
                                </InputDiv>
                                <InputDiv>
                                    <label className="text-sm font-medium">Số điện thoại</label>
                                    <Input value={settings.phone} onChange={handleChange("phone")} />
                                </InputDiv>
                                <InputDiv>
                                    <label className="text-sm font-medium">Địa chỉ</label>
                                    <Input value={settings.address} onChange={handleChange("address")} />
                                </InputDiv>
                                <InputDiv className="md:col-span-2">
                                    <label className="text-sm font-medium">Thông tin liên hệ</label>
                                    <Textarea value={settings.contact} onChange={handleChange("contact")} rows={2} placeholder="Liên hệ qua..." />
                                </InputDiv>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Mạng xã hội</CardTitle>
                                <CardDescription>Hiển thị icon trong footer</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                {SOCIAL_FIELDS.map((field) => (
                                    <InputDiv key={field}>
                                        <label className="text-sm font-medium capitalize">{field}</label>
                                        <Input
                                            value={settings[field]}
                                            onChange={handleChange(field)}
                                            placeholder={`https://${field}.com/...`}
                                        />
                                    </InputDiv>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Metadata & Sharing</CardTitle>
                                <CardDescription>Phục vụ Open Graph, Twitter Card</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <InputDiv className="md:col-span-2">
                                    <ImageUpload
                                        label="Ảnh chia sẻ (OG Image)"
                                        value={settings.ogImage}
                                        onChange={(url) => setSettings((prev) => ({ ...prev, ogImage: url }))}
                                        enableLibrary
                                        folder="seo"
                                    />
                                </InputDiv>
                                <InputDiv className="md:col-span-2">
                                    <label className="text-sm font-medium">OG Type</label>
                                    <Input value={settings.ogType} onChange={handleChange("ogType")} placeholder="website" />
                                </InputDiv>
                                <InputDiv className="md:col-span-2">
                                    <label className="text-sm font-medium">Twitter Card</label>
                                    <Input value={settings.twitterCard} onChange={handleChange("twitterCard")} placeholder="summary_large_image" />
                                </InputDiv>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu tất cả"}
                            </Button>
                        </div>
                    </form>
            }
        </main>
    )
}

