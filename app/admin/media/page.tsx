"use client"

import { useEffect, useState } from "react"
import Image from "@/components/ui/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Spinner } from "@/components/ui/spinner"
import {
    Upload,
    Trash2,
    Search,
    FolderOpen,
    Image as ImageIcon,
    Copy,
    Check,
    X,
} from "lucide-react"
import { getImageUrl } from "@/lib/image-utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ImageFile {
    name: string
    path: string
    size: number
    url: string
    createdAt: string
    updatedAt: string
}

const FOLDERS = [
    { value: "posts", label: "Bài viết" },
    { value: "slides", label: "Slides" },
    { value: "ckeditor", label: "CKEditor" },
    { value: "avatars", label: "Avatar" },
    { value: "features", label: "Tính năng" },
    { value: "branding", label: "Branding" }, // Use "root" instead of "" to avoid Select validation error
]

export default function AdminMediaPage() {
    const [images, setImages] = useState<ImageFile[]>([])
    const [filteredImages, setFilteredImages] = useState<ImageFile[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [selectedFolder, setSelectedFolder] = useState("posts")
    const [searchQuery, setSearchQuery] = useState("")
    const [showUploadDialog, setShowUploadDialog] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [deletingPath, setDeletingPath] = useState<string | null>(null)
    const [confirmDeletePath, setConfirmDeletePath] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null)
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
    const { showToast } = useToast()

    useEffect(() => {
        fetchImages()
    }, [selectedFolder])

    useEffect(() => {
        filterImages()
    }, [images, searchQuery])

    const fetchImages = async () => {
        setLoading(true)
        try {
            // Convert "root" to empty string for API call
            const apiFolder = selectedFolder === "root" ? "" : selectedFolder
            const response = await fetch(
                `/api/admin/images?bucket=images&prefix=${apiFolder}&limit=100`
            )
            if (response.ok) {
                const data = await response.json()
                setImages(data.files || [])
            }
        } catch (error) {
            console.error("Error fetching images:", error)
            showToast("error", "Không thể tải danh sách ảnh")
        } finally {
            setLoading(false)
        }
    }

    const filterImages = () => {
        if (!searchQuery.trim()) {
            setFilteredImages(images)
            return
        }

        const query = searchQuery.toLowerCase()
        const filtered = images.filter((img) =>
            img.name.toLowerCase().includes(query)
        )
        setFilteredImages(filtered)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        setSelectedFiles(files)
    }

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            showToast("error", "Vui lòng chọn ảnh")
            return
        }

        setUploading(true)
        try {
            let successCount = 0
            let errorCount = 0

            for (const file of selectedFiles) {
                const formData = new FormData()
                formData.append("file", file)
                formData.append("bucket", "images")
                // Convert "root" to "posts" for upload (root is only for viewing all folders)
                const uploadFolder = selectedFolder === "root" ? "posts" : selectedFolder
                formData.append("folder", uploadFolder)

                const response = await fetch("/api/admin/upload", {
                    method: "POST",
                    body: formData,
                })

                if (response.ok) {
                    successCount++
                } else {
                    errorCount++
                }
            }

            if (successCount > 0) {
                showToast("success", `Đã upload ${successCount} ảnh`)
                fetchImages()
            }

            if (errorCount > 0) {
                showToast("error", `Thất bại ${errorCount} ảnh`)
            }

            setShowUploadDialog(false)
            setSelectedFiles([])
        } catch (error) {
            showToast("error", "Không thể upload ảnh")
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (path: string) => {
        // Close modal immediately
        setConfirmDeletePath(null)
        setDeletingPath(path)
        
        try {
            const response = await fetch(
                `/api/admin/images/delete?bucket=images&path=${encodeURIComponent(path)}`,
                { method: "DELETE" }
            )

            if (response.ok) {
                showToast("success", "Đã xóa ảnh")
                // Remove from local state immediately
                setImages(prev => prev.filter(img => img.path !== path))
                setFilteredImages(prev => prev.filter(img => img.path !== path))
            } else {
                throw new Error("Failed to delete")
            }
        } catch (error) {
            showToast("error", "Không thể xóa ảnh")
        } finally {
            setDeletingPath(null)
        }
    }

    const copyToClipboard = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url)
            setCopiedUrl(url)
            showToast("success", "Đã copy URL")
            setTimeout(() => setCopiedUrl(null), 2000)
        } catch (error) {
            showToast("error", "Không thể copy")
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner className="w-8 h-8" />
            </div>
        )
    }

    return (
        <div className="container py-4 sm:py-6 px-3 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Quản lý ảnh</h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Quản lý thư viện ảnh trên Supabase Storage
                    </p>
                </div>
                <Button
                    onClick={() => setShowUploadDialog(true)}
                    className="w-full sm:w-auto"
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload ảnh
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm ảnh..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {FOLDERS.map((folder) => (
                            <SelectItem key={folder.value} value={folder.value}>
                                {folder.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Images Grid */}
            {filteredImages.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            {searchQuery
                                ? "Không tìm thấy ảnh nào"
                                : "Chưa có ảnh nào trong thư mục này"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {filteredImages.map((image) => (
                        <Card
                            key={image.path}
                            className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                            onClick={() => setSelectedImage(image)}
                        >
                            <CardContent className="p-0">
                                <div className="relative aspect-square">
                                    <Image
                                        src={getImageUrl(image.url)}
                                        alt={image.name}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Deleting Overlay */}
                                    {deletingPath === image.path && (
                                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                                            <div className="text-center text-white">
                                                <Spinner className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-xs">Đang xóa...</p>
                                            </div>
                                        </div>
                                    )}
                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                copyToClipboard(image.url)
                                            }}
                                        >
                                            {copiedUrl === image.url ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setConfirmDeletePath(image.path)
                                            }}
                                            disabled={deletingPath === image.path}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <p className="text-xs font-medium truncate">
                                        {image.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(image.size)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload ảnh</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Thư mục</label>
                            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FOLDERS.map((folder) => (
                                        <SelectItem key={folder.value} value={folder.value}>
                                            {folder.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Chọn ảnh</label>
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                            />
                            {selectedFiles.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Đã chọn {selectedFiles.length} ảnh
                                </p>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-blue-900 mb-1">
                                📋 Lưu ý:
                            </p>
                            <ul className="text-xs text-blue-800 space-y-0.5 ml-4">
                                <li>• Kích thước tối đa: 5MB/ảnh</li>
                                <li>• Format: JPG, PNG, WebP, GIF</li>
                                <li>• Có thể upload nhiều ảnh cùng lúc</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowUploadDialog(false)
                                setSelectedFiles([])
                            }}
                            className="flex-1"
                            disabled={uploading}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleUpload}
                            className="flex-1"
                            disabled={uploading || selectedFiles.length === 0}
                        >
                            {uploading ? (
                                <>
                                    <Spinner className="w-4 h-4 mr-2" />
                                    Đang upload...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Detail Dialog */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span className="truncate">{selectedImage?.name}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedImage(null)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedImage && (
                        <div className="space-y-4">
                            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                                <Image
                                    src={getImageUrl(selectedImage.url)}
                                    alt={selectedImage.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Kích thước</p>
                                    <p className="font-medium">
                                        {formatFileSize(selectedImage.size)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Ngày tạo</p>
                                    <p className="font-medium">
                                        {formatDate(selectedImage.createdAt)}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-muted-foreground mb-1">URL</p>
                                    <div className="flex gap-2">
                                        <Input
                                            value={selectedImage.url}
                                            readOnly
                                            className="text-xs"
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => copyToClipboard(selectedImage.url)}
                                        >
                                            {copiedUrl === selectedImage.url ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        setConfirmDeletePath(selectedImage.path)
                                        setSelectedImage(null)
                                    }}
                                    className="flex-1"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Xóa ảnh
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!confirmDeletePath}
                onOpenChange={(open) => !open && setConfirmDeletePath(null)}
                onConfirm={() => confirmDeletePath && handleDelete(confirmDeletePath)}
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa ảnh này? Hành động này không thể hoàn tác."
            />
        </div>
    )
}
