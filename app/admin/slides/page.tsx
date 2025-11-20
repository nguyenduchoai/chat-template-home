"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ImageUpload } from "@/components/editor/image-upload"
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from "lucide-react"
import { getImageUrl } from "@/lib/image-utils"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Slide } from "@/lib/db"

interface SlideFormData {
    title: string
    image: string
    link: string
}

const SlideSkeletonCard = () => (
    <Card className="overflow-hidden border animate-pulse">
        <div className="w-full h-32 bg-muted" />
        <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-10" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </CardContent>
    </Card>
)

export default function AdminSlidesPage() {
    const [slides, setSlides] = useState<Slide[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
    const [deletingSlideId, setDeletingSlideId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [draggedItem, setDraggedItem] = useState<Slide | null>(null)
    const [formData, setFormData] = useState<SlideFormData>({
        title: "",
        image: "",
        link: "",
    })
    const { showToast } = useToast()

    useEffect(() => {
        fetchSlides()
    }, [])

    const fetchSlides = async () => {
        try {
            const response = await fetch("/api/admin/slides")
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

    const handleOpenForm = (slide?: Slide) => {
        if (slide) {
            setEditingSlide(slide)
            setFormData({
                title: slide.title,
                image: slide.image,
                link: slide.link || "",
            })
        } else {
            setEditingSlide(null)
            setFormData({
                title: "",
                image: "",
                link: "",
            })
        }
        setShowForm(true)
    }

    const handleCloseForm = () => {
        setShowForm(false)
        setEditingSlide(null)
        setFormData({
            title: "",
            image: "",
            link: "",
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || !formData.image) {
            showToast("error", "Vui lòng điền đầy đủ tiêu đề và ảnh")
            return
        }

        try {
            const url = editingSlide
                ? `/api/admin/slides/${editingSlide.id}`
                : "/api/admin/slides"

            const method = editingSlide ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                showToast("success", editingSlide
                    ? "Đã cập nhật slide"
                    : "Đã tạo slide mới")
                handleCloseForm()
                fetchSlides()
            } else {
                throw new Error("Failed to save slide")
            }
        } catch (error) {
            showToast("error", "Không thể lưu slide")
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingSlideId(id)
        try {
            const response = await fetch(`/api/admin/slides/${id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                showToast("success", "Đã xóa slide")
                fetchSlides()
            } else {
                throw new Error("Failed to delete slide")
            }
        } catch (error) {
            showToast("error", "Không thể xóa slide")
        } finally {
            setDeletingSlideId(null)
            setConfirmDeleteId(null)
        }
    }

    const handleToggleActive = async (slide: Slide) => {
        try {
            const response = await fetch(`/api/admin/slides/${slide.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: slide.title,
                    image: slide.image,
                    link: slide.link,
                    order: slide.order,
                    active: !slide.active,
                }),
            })

            if (response.ok) {
                showToast("success", slide.active
                    ? "Đã ẩn slide"
                    : "Đã hiển thị slide")
                fetchSlides()
            }
        } catch (error) {
            showToast("error", "Không thể cập nhật trạng thái")
        }
    }

    const handleDragStart = (slide: Slide) => {
        setDraggedItem(slide)
    }

    const handleDragOver = (e: React.DragEvent, targetSlide: Slide) => {
        e.preventDefault()

        if (!draggedItem || draggedItem.id === targetSlide.id) return

        const draggedIndex = slides.findIndex(s => s.id === draggedItem.id)
        const targetIndex = slides.findIndex(s => s.id === targetSlide.id)

        const newSlides = [...slides]
        newSlides.splice(draggedIndex, 1)
        newSlides.splice(targetIndex, 0, draggedItem)

        setSlides(newSlides)
    }

    const handleDragEnd = async () => {
        if (!draggedItem) return

        try {
            const response = await fetch("/api/admin/slides/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slides }),
            })

            if (response.ok) {
                showToast("success", "Đã cập nhật thứ tự slides")
                fetchSlides()
            }
        } catch (error) {
            showToast("error", "Không thể cập nhật thứ tự")
            fetchSlides()
        } finally {
            setDraggedItem(null)
        }
    }

    return (
        <div className="container py-4 sm:py-6 px-3 sm:px-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Quản lý Slides</h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Quản lý slides hiển thị trên trang chủ
                    </p>
                </div>
                <Button onClick={() => handleOpenForm()} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm slide
                </Button>
            </div>

            {loading ? (
                <div className="grid gap-3 sm:gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <SlideSkeletonCard key={`slide-skeleton-${index}`} />
                    ))}
                </div>
            ) : slides.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            Chưa có slide nào. Hãy tạo slide đầu tiên!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 sm:gap-4">
                    {slides.map((slide) => (
                        <Card
                            key={slide.id}
                            draggable
                            onDragStart={() => handleDragStart(slide)}
                            onDragOver={(e) => handleDragOver(e, slide)}
                            onDragEnd={handleDragEnd}
                            className="cursor-move hover:shadow-md transition-shadow"
                        >
                            <CardContent className="p-0">
                                {/* Mobile Layout */}
                                <div className="sm:hidden">
                                    {/* Image Header */}
                                    <div className="relative w-full h-32 bg-muted">
                                        <Image
                                            src={getImageUrl(slide.image)}
                                            alt={slide.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <span className="px-2 py-1 text-xs font-medium bg-black/60 text-white rounded backdrop-blur-sm">
                                                #{slide.order}
                                            </span>
                                            {slide.active ? (
                                                <span className="px-2 py-1 text-xs font-medium bg-green-500/90 text-white rounded backdrop-blur-sm flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    Hiện
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-medium bg-gray-500/90 text-white rounded backdrop-blur-sm flex items-center gap-1">
                                                    <EyeOff className="w-3 h-3" />
                                                    Ẩn
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute top-2 left-2">
                                            <GripVertical className="w-5 h-5 text-white drop-shadow-lg" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-3 space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                                                {slide.title}
                                            </h3>
                                            {slide.link && (
                                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                    <span>🔗</span>
                                                    <span className="truncate">{slide.link}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button
                                                variant={slide.active ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleToggleActive(slide)}
                                                className="h-9 text-xs px-2"
                                            >
                                                {slide.active ? (
                                                    <>
                                                        <EyeOff className="w-3.5 h-3.5 mr-1" />
                                                        Ẩn
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-3.5 h-3.5 mr-1" />
                                                        Hiện
                                                    </>
                                                )}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenForm(slide)}
                                                className="h-9 text-xs px-2"
                                            >
                                                <Edit className="w-3.5 h-3.5 mr-1" />
                                                Sửa
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setConfirmDeleteId(slide.id)}
                                                disabled={deletingSlideId === slide.id}
                                                className="h-9 text-xs px-2"
                                            >
                                                {deletingSlideId === slide.id ? (
                                                    <Spinner className="w-3.5 h-3.5" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                                                        Xóa
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden sm:flex items-center gap-4 p-4">
                                    <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                                    <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden">
                                        <Image
                                            src={getImageUrl(slide.image)}
                                            alt={slide.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-base truncate">
                                                {slide.title}
                                            </h3>
                                            <span className="px-2 py-0.5 text-xs bg-muted rounded flex-shrink-0">
                                                #{slide.order}
                                            </span>
                                            {slide.active ? (
                                                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded flex items-center gap-1 flex-shrink-0">
                                                    <Eye className="w-3 h-3" />
                                                    Đang hiện
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded flex items-center gap-1 flex-shrink-0">
                                                    <EyeOff className="w-3 h-3" />
                                                    Đã ẩn
                                                </span>
                                            )}
                                        </div>
                                        {slide.link && (
                                            <p className="text-sm text-muted-foreground truncate">
                                                🔗 {slide.link}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button
                                            variant={slide.active ? "outline" : "default"}
                                            size="sm"
                                            onClick={() => handleToggleActive(slide)}
                                            title={slide.active ? "Ẩn slide" : "Hiện slide"}
                                        >
                                            {slide.active ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenForm(slide)}
                                            title="Chỉnh sửa"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setConfirmDeleteId(slide.id)}
                                            disabled={deletingSlideId === slide.id}
                                            title="Xóa slide"
                                        >
                                            {deletingSlideId === slide.id ? (
                                                <Spinner className="w-4 h-4" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Form Dialog */}
            <Dialog open={showForm} onOpenChange={handleCloseForm}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">
                            {editingSlide ? "Chỉnh sửa slide" : "Thêm slide mới"}
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            Điền thông tin cho slide hiển thị trên trang chủ
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Tiêu đề *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    placeholder="Nhập tiêu đề slide"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <ImageUpload
                                    value={formData.image}
                                    onChange={(url) =>
                                        setFormData({ ...formData, image: url })
                                    }
                                    label="Ảnh slide *"
                                    bucket="images"
                                    folder="slides"
                                    enableLibrary
                                />
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                                    <p className="text-xs font-semibold text-blue-900">📐 Tỉ lệ ảnh khuyên dùng:</p>
                                    <ul className="text-xs text-blue-800 space-y-0.5 ml-4">
                                        <li>• <strong>Desktop:</strong> 16:9 (1920×1080px hoặc 1600×900px)</li>
                                        <li>• <strong>Mobile:</strong> 4:3 hoặc 3:2</li>
                                        <li>• <strong>Kích thước tối đa:</strong> 2MB</li>
                                        <li>• <strong>Format:</strong> JPG, PNG, WebP</li>
                                    </ul>
                                    <p className="text-xs text-blue-700 italic mt-2">
                                        💡 Tip: Sử dụng ảnh ngang (landscape) để hiển thị tốt nhất
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="link">Đường dẫn (URL)</Label>
                                <Input
                                    id="link"
                                    type="url"
                                    value={formData.link}
                                    onChange={(e) =>
                                        setFormData({ ...formData, link: e.target.value })
                                    }
                                    placeholder="https://example.com"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Để trống nếu không muốn thêm link
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseForm}
                                className="w-full sm:w-auto"
                            >
                                Hủy
                            </Button>
                            <Button type="submit" className="w-full sm:w-auto">
                                {editingSlide ? "Cập nhật" : "Tạo mới"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!confirmDeleteId}
                onOpenChange={(open) => !open && setConfirmDeleteId(null)}
                onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa slide này? Hành động này không thể hoàn tác."
            />
        </div>
    )
}
