"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import { getImageUrl } from "@/lib/image-utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  bucket?: string
  /**
   * Thư mục lưu ảnh trong Local Storage
   * Mặc định: "posts" - dùng cho ảnh bìa bài viết
   */
  folder?: string
  enableLibrary?: boolean
  previewHeight?: number
}

const FOLDER_OPTIONS = [
  { value: "posts", label: "Bài viết" },
  { value: "slides", label: "Slides" },
  { value: "ckeditor", label: "CKEditor" },
  { value: "avatars", label: "Avatar" },
  { value: "features", label: "Tính năng" },
  { value: "branding", label: "Branding" },
]


type LibraryImage = {
  name: string
  path: string
  url: string
  createdAt?: string | null
}

export function ImageUpload({
  value = "",
  onChange,
  label = "Ảnh bìa",
  bucket = "images",
  folder = "posts", // Folder mặc định cho ảnh bìa bài viết
  enableLibrary = false,
  previewHeight = 256,
}: ImageUploadProps) {
  const [selectedFolder, setSelectedFolder] = useState<string>(folder || "posts")
  const [selectedLibraryFolder, setSelectedLibraryFolder] = useState<string>(selectedFolder)
  
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value ? getImageUrl(value) : null)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([])
  const [libraryError, setLibraryError] = useState<string | null>(null)
  const [libraryFetched, setLibraryFetched] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  // Sync selectedFolder với folder prop và cập nhật library folder
  useEffect(() => {
    if (folder) {
      setSelectedFolder(folder)
      setSelectedLibraryFolder(folder)
    }
  }, [folder])

  // Cập nhật library folder khi selectedFolder thay đổi
  useEffect(() => {
    setSelectedLibraryFolder(selectedFolder)
  }, [selectedFolder])

  useEffect(() => {
    setPreview(value ? getImageUrl(value) : null)
  }, [value])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      showToast("error", "Vui lòng chọn file ảnh")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Kích thước file không được vượt quá 5MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", bucket)
      formData.append("folder", selectedFolder)

      const response = await fetch("/api/admin/upload/image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Không thể tải ảnh lên")
      }

      const { url } = await response.json()
      onChange(url)
      setPreview(getImageUrl(url))
      showToast("success", "Đã tải ảnh lên thành công")
    } catch (error: any) {
      console.error("Error uploading image:", error)
      const errorMessage = error.message || "Có lỗi xảy ra khi tải ảnh lên"
      
      if (errorMessage.includes("not found")) {
        showToast("error", `Thư mục '${selectedFolder}' chưa được tạo. Vui lòng kiểm tra cấu hình`)
      } else {
        showToast("error", errorMessage)
      }
      
      setPreview(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const loadLibrary = async (folderToLoad?: string) => {
    const folder = folderToLoad ?? selectedLibraryFolder
    // Convert "root" to empty string for API call
    const apiFolder = folder === "root" ? "" : folder
    setLibraryLoading(true)
    setLibraryError(null)
    setLibraryFetched(false)
    try {
      const params = new URLSearchParams({
        bucket,
        prefix: apiFolder,
      })
      const response = await fetch(`/api/admin/images?${params.toString()}`)
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Không thể tải thư viện ảnh" }))
        throw new Error(error.error || "Không thể tải thư viện ảnh")
      }
      const data = await response.json()
      setLibraryImages(data.files ?? [])
      setLibraryFetched(true)
    } catch (error: any) {
      console.error("Error loading image library:", error)
      setLibraryError(error.message || "Không thể tải thư viện ảnh")
    } finally {
      setLibraryLoading(false)
    }
  }

  const handleFolderChange = (newFolder: string) => {
    setSelectedLibraryFolder(newFolder)
    setLibraryFetched(false) // Reset để load lại khi folder thay đổi
    loadLibrary(newFolder)
  }

  const handleLibraryToggle = (open: boolean) => {
    setLibraryOpen(open)
    if (open && !libraryFetched && !libraryLoading) {
      loadLibrary(selectedLibraryFolder)
    }
  }

  const handleSelectFromLibrary = (image: LibraryImage) => {
    onChange(image.url)
    setPreview(getImageUrl(image.url))
    setLibraryOpen(false)
    showToast("success", "Đã chọn ảnh từ thư viện")
  }

  const handleRemove = () => {
    onChange("")
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Select value={selectedFolder} onValueChange={setSelectedFolder} disabled={uploading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FOLDER_OPTIONS.map((folderOption) => (
              <SelectItem key={folderOption.value} value={folderOption.value}>
                {folderOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        {preview ? (
          <div className="relative group">
            <div
              className="relative w-full rounded-lg overflow-hidden border"
              style={{ height: previewHeight }}
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={uploading}
                  className="text-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  Xóa ảnh
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors flex items-center justify-center",
              uploading ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            )}
            style={{ minHeight: previewHeight }}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 animate-pulse text-primary" />
                <p className="text-sm text-muted-foreground">Đang tải ảnh lên...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click để chọn ảnh hoặc kéo thả ảnh vào đây
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF tối đa 5MB</p>
              </div>
            )}
          </div>
        )}
        {enableLibrary && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-dashed"
              onClick={() => handleLibraryToggle(true)}
              disabled={libraryLoading}
            >
              Thư viện Ảnh
            </Button>
            <Dialog open={libraryOpen} onOpenChange={handleLibraryToggle}>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Chọn ảnh từ thư viện</DialogTitle>
                  <DialogDescription>
                    Chọn folder để xem ảnh từ bucket {bucket}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">Folder:</label>
                    <Select value={selectedLibraryFolder} onValueChange={handleFolderChange} disabled={libraryLoading}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Chọn folder" />
                      </SelectTrigger>
                      <SelectContent>
                        {FOLDER_OPTIONS.map((folderOption) => (
                          <SelectItem key={folderOption.value} value={folderOption.value}>
                            {folderOption.label}
                            {folderOption.value && ` (${folderOption.value})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => loadLibrary(selectedLibraryFolder)} 
                      disabled={libraryLoading}
                      className="shrink-0"
                    >
                      {libraryLoading ? (
                        <>
                          <Spinner className="h-4 w-4 mr-2" />
                          Đang tải...
                        </>
                      ) : (
                        "Làm mới"
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Tổng số ảnh: {libraryImages.length}
                      {selectedLibraryFolder && selectedLibraryFolder !== "root" && (
                        <span className="ml-2 text-xs">
                          (folder: {selectedLibraryFolder})
                        </span>
                      )}
                      {selectedLibraryFolder === "root" && (
                        <span className="ml-2 text-xs">
                          (tất cả folders)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {libraryError ? (
                  <p className="text-sm text-destructive">{libraryError}</p>
                ) : libraryLoading && !libraryFetched ? (
                  <div className="flex items-center justify-center py-10">
                    <Spinner className="h-6 w-6 text-primary" />
                  </div>
                ) : libraryImages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có ảnh nào trong thư viện.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto pr-1">
                    {libraryImages.map((image) => (
                      <button
                        type="button"
                        key={image.path}
                        onClick={() => handleSelectFromLibrary(image)}
                        className="group relative overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <img src={getImageUrl(image.url)} alt={image.name} className="h-40 w-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-sm font-medium text-white">Chọn ảnh</span>
                        </div>
                        <div className="p-2 border-t text-left">
                          <p className="text-xs font-medium truncate">{image.name}</p>
                          {image.createdAt && (
                            <p className="text-[11px] text-muted-foreground">
                              {new Date(image.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  )
}

