"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageUpload } from "@/components/editor/image-upload"
import Image from "next/image"

type ProfileResponse = {
    id: string
    name: string | null
    email: string
    role: string
    image?: string | null
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileResponse | null>(null)
    const [profileName, setProfileName] = useState("")
    const [profileImage, setProfileImage] = useState<string>("")
    const [profileLoading, setProfileLoading] = useState(true)
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const { showToast } = useToast()

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setProfileLoading(true)
            const res = await fetch("/api/admin/profile")
            if (!res.ok) {
                const { error } = await res.json()
                throw new Error(error || "Không thể tải thông tin")
            }
            const data = await res.json()
            setProfile(data)
            setProfileName(data.name ?? "")
            setProfileImage(data.image ?? "")
        } catch (error: any) {
            showToast("error", error.message || "Có lỗi xảy ra")
        } finally {
            setProfileLoading(false)
        }
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profileName.trim()) {
            showToast("error", "Tên không được để trống")
            return
        }
        try {
            setIsSavingProfile(true)
            const res = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: profileName.trim(), image: profileImage }),
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Không thể cập nhật thông tin")
            }
            setProfile(data)
            showToast("success", "Đã cập nhật thông tin cá nhân")
        } catch (error: any) {
            showToast("error", error.message || "Có lỗi xảy ra khi cập nhật")
        } finally {
            setIsSavingProfile(false)
        }
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        const { currentPassword, newPassword, confirmPassword } = passwordForm

        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast("error", "Vui lòng nhập đầy đủ thông tin")
            return
        }

        if (newPassword !== confirmPassword) {
            showToast("error", "Mật khẩu mới không khớp")
            return
        }

        try {
            setIsSavingPassword(true)
            const res = await fetch("/api/admin/profile/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                throw new Error(data.error || "Không thể đổi mật khẩu")
            }
            showToast("success", "Đã cập nhật mật khẩu")
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
        } catch (error: any) {
            showToast("error", error.message || "Có lỗi xảy ra khi đổi mật khẩu")
        } finally {
            setIsSavingPassword(false)
        }
    }

    const renderProfileCard = () => {
        if (profileLoading) {
            return (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-40" />
                    </CardContent>
                </Card>
            )
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <Label className="text-sm font-medium">Ảnh đại diện</Label>
                            <div className="mt-2">
                                <ImageUpload
                                    value={profileImage}
                                    onChange={(url) => setProfileImage(url)}
                                    label=""
                                    folder="avatars"
                                    enableLibrary
                                    previewHeight={180}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Họ và tên</Label>
                            <Input
                                id="name"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                placeholder="Nhập họ và tên"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={profile?.email ?? ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Vai trò</Label>
                            <Input value={profile?.role === "superadmin" ? "Super Admin" : profile?.role === "admin" ? "Quản trị viên" : "Người dùng"} disabled />
                        </div>
                        <Button type="submit" className="w-full sm:w-auto" disabled={isSavingProfile}>
                            {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="container space-y-6 px-4">
            <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Tài khoản</p>
                <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
                <p className="text-muted-foreground">Cập nhật thông tin và bảo mật tài khoản của bạn.</p>
            </div>
            <div className="grid gap-6">
                {renderProfileCard()}
                <Card>
                    <CardHeader>
                        <CardTitle>Đổi mật khẩu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    placeholder="Nhập mật khẩu hiện tại"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    placeholder="Tối thiểu 8 ký tự"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Nhập lại mật khẩu mới</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </div>
                            <Button type="submit" className="w-full sm:w-auto" disabled={isSavingPassword}>
                                {isSavingPassword ? "Đang cập nhật..." : "Đổi mật khẩu"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

