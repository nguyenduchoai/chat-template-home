"use client"

import { useState, useCallback, useRef } from "react"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import { Upload } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface CKEditorComponentProps {
  value: string
  onChange: (data: string) => void
  placeholder?: string
  bucket?: string
  folder?: string
}

// Custom Upload Adapter using API endpoint
class ApiUploadAdapter {
  loader: any
  onUploadStart?: () => void
  onUploadEnd?: () => void
  onError?: (error: string) => void
  bucket: string
  folder: string

  constructor(
    loader: any,
    options?: {
      onUploadStart?: () => void
      onUploadEnd?: () => void
      onError?: (error: string) => void
      bucket?: string
      folder?: string
    }
  ) {
    this.loader = loader
    this.onUploadStart = options?.onUploadStart
    this.onUploadEnd = options?.onUploadEnd
    this.onError = options?.onError
    this.bucket = options?.bucket || "images"
    this.folder = options?.folder || "ckeditor"
  }

  async upload() {
    const file = await this.loader.file

    // Validate file type
    if (!file.type.startsWith("image/")) {
      const error = "File phải là ảnh"
      this.onError?.(error)
      throw new Error(error)
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      const error = "Kích thước file không được vượt quá 5MB"
      this.onError?.(error)
      throw new Error(error)
    }

    this.onUploadStart?.()

    const formData = new FormData()
    formData.append("file", file)
    formData.append("bucket", this.bucket)
    formData.append("folder", this.folder)

    try {
      const response = await fetch("/api/admin/upload/image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Không thể tải ảnh lên"
        
        // Handle specific error cases
        if (errorMessage.includes("not found")) {
          const error = `Thư mục '${this.folder}' chưa được tạo. Vui lòng kiểm tra cấu hình`
          this.onError?.(error)
          throw new Error(error)
        }
        
        this.onError?.(errorMessage)
        throw new Error(errorMessage)
      }

      const { url } = await response.json()
      this.onUploadEnd?.()
      
      return {
        default: url,
      }
    } catch (error: any) {
      console.error("Error uploading image:", error)
      this.onUploadEnd?.()
      throw error
    }
  }

  abort() {
    // Handle abort if needed
    this.onUploadEnd?.()
  }
}

export function CKEditorComponent({ 
  value, 
  onChange, 
  placeholder,
  bucket = "images",
  folder = "ckeditor",
}: CKEditorComponentProps) {
  const [uploading, setUploading] = useState(false)
  const { showToast } = useToast()
  const uploadStartRef = useRef<(() => void) | null>(null)
  const uploadEndRef = useRef<(() => void) | null>(null)
  const uploadErrorRef = useRef<((error: string) => void) | null>(null)

  const handleReady = useCallback((editor: any) => {
    // Configure upload adapter
    editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
      return new ApiUploadAdapter(loader, {
        onUploadStart: () => {
          setUploading(true)
        },
        onUploadEnd: () => {
          setUploading(false)
        },
        onError: (error: string) => {
          showToast("error", error)
        },
        bucket,
        folder,
      })
    }
  }, [bucket, folder, showToast])

  return (
    <div className="space-y-2">
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Upload className="h-4 w-4 animate-pulse" />
          <span>Đang tải ảnh lên...</span>
        </div>
      )}
      <div className="border rounded-md [&_.ck-editor__editable]:min-h-[300px]">
        <CKEditor
          editor={ClassicEditor as any}
          data={value}
          onReady={handleReady}
          onChange={(event, editor) => {
            const data = editor.getData()
            onChange(data)
          }}
          config={{
            placeholder,
            toolbar: [
              "heading",
              "|",
              "bold",
              "italic",
              "link",
              "bulletedList",
              "numberedList",
              "|",
              "outdent",
              "indent",
              "|",
              "imageUpload",
              "blockQuote",
              "insertTable",
              "mediaEmbed",
              "|",
              "undo",
              "redo",
            ],
            image: {
              toolbar: [
                "imageTextAlternative",
                "toggleImageCaption",
                "imageStyle:inline",
                "imageStyle:block",
                "imageStyle:side",
              ],
            },
          }}
        />
      </div>
    </div>
  )
}
