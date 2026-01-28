/**
 * Local File Storage Utilities
 * Replaces Supabase Storage with local file system
 */

import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

// Configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Ensure upload directory exists
async function ensureUploadDir(subDir: string = ''): Promise<string> {
    const fullPath = path.join(UPLOAD_DIR, subDir)
    await fs.mkdir(fullPath, { recursive: true })
    return fullPath
}

/**
 * Upload a file to local storage
 * @param file File object or Base64 string
 * @param options Upload options
 * @returns Public URL path
 */
export async function uploadFile(
    file: File | Buffer | string,
    options: {
        folder?: string
        filename?: string
        contentType?: string
    } = {}
): Promise<string> {
    const { folder = 'general', filename } = options

    // Ensure directory exists
    const uploadPath = await ensureUploadDir(folder)

    // Generate unique filename if not provided
    const ext = options.contentType?.split('/')[1] || 'png'
    const finalFilename = filename || `${randomUUID()}.${ext}`
    const filePath = path.join(uploadPath, finalFilename)

    // Convert to buffer if needed
    let buffer: Buffer
    if (typeof file === 'string') {
        // Handle Base64
        const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
        buffer = Buffer.from(base64Data, 'base64')
    } else if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
    } else {
        buffer = file
    }

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum allowed (${MAX_FILE_SIZE / 1024 / 1024}MB)`)
    }

    // Write file
    await fs.writeFile(filePath, buffer)

    // Return public URL path (relative to /public)
    return `/uploads/${folder}/${finalFilename}`
}

/**
 * Upload an image with validation
 */
export async function uploadImage(
    file: File | Buffer | string,
    folder: string = 'images'
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        let contentType = 'image/png'
        let ext = 'png'

        if (file instanceof File) {
            contentType = file.type
            ext = file.name.split('.').pop() || 'png'
        }

        // Validate image type
        if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
            return {
                success: false,
                error: `Invalid image type: ${contentType}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`
            }
        }

        const url = await uploadFile(file, {
            folder,
            contentType,
        })

        return { success: true, url }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * List images in a folder
 */
export async function listImages(
    folder: string = 'posts',
    limit: number = 60
): Promise<Array<{
    name: string
    path: string
    size: number
    updatedAt: Date | null
    createdAt: Date | null
    url: string
}>> {
    try {
        const folderPath = path.join(UPLOAD_DIR, folder)
        
        // Check if folder exists
        try {
            await fs.access(folderPath)
        } catch {
            return []
        }

        const files = await fs.readdir(folderPath)
        const results = []

        for (const fileName of files.slice(0, limit)) {
            const filePath = path.join(folderPath, fileName)
            try {
                const stats = await fs.stat(filePath)
                if (stats.isFile()) {
                    results.push({
                        name: fileName,
                        path: `${folder}/${fileName}`,
                        size: stats.size,
                        updatedAt: stats.mtime,
                        createdAt: stats.birthtime,
                        url: `/uploads/${folder}/${fileName}`,
                    })
                }
            } catch {
                // Skip files we can't stat
            }
        }

        // Sort by creation date descending
        results.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))

        return results
    } catch (error) {
        console.error('Error listing images:', error)
        return []
    }
}

/**
 * Delete an image
 */
export async function deleteImage(urlPath: string): Promise<boolean> {
    return deleteFile(urlPath)
}

/**
 * Check if Supabase is configured (for backward compat)
 */
export function isSupabaseConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

/**
 * Delete a file from storage
 * @param urlPath Public URL path (e.g., /uploads/images/abc.png)
 */
export async function deleteFile(urlPath: string): Promise<boolean> {
    try {
        // Convert URL path to file system path
        const relativePath = urlPath.replace(/^\/uploads\//, '')
        const filePath = path.join(UPLOAD_DIR, relativePath)

        // Check if file exists
        await fs.access(filePath)
        await fs.unlink(filePath)
        return true
    } catch (error) {
        console.error('Error deleting file:', error)
        return false
    }
}

/**
 * Check if a file exists
 */
export async function fileExists(urlPath: string): Promise<boolean> {
    try {
        const relativePath = urlPath.replace(/^\/uploads\//, '')
        const filePath = path.join(UPLOAD_DIR, relativePath)
        await fs.access(filePath)
        return true
    } catch {
        return false
    }
}

/**
 * Get file info
 */
export async function getFileInfo(urlPath: string): Promise<{
    size: number
    createdAt: Date
    modifiedAt: Date
} | null> {
    try {
        const relativePath = urlPath.replace(/^\/uploads\//, '')
        const filePath = path.join(UPLOAD_DIR, relativePath)
        const stats = await fs.stat(filePath)
        return {
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
        }
    } catch {
        return null
    }
}

/**
 * Extract image URLs from HTML content
 */
export function extractImageUrlsFromHtml(html: string): string[] {
    if (!html) return []
    
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi
    const urls: string[] = []
    let match

    while ((match = imgRegex.exec(html)) !== null) {
        urls.push(match[1])
    }

    return urls
}

/**
 * Delete all images from a post
 */
export async function deletePostImages(
    coverImage: string | null,
    content: string | null
): Promise<number> {
    let deletedCount = 0

    // Delete cover image
    if (coverImage && coverImage.startsWith('/uploads/')) {
        const deleted = await deleteFile(coverImage)
        if (deleted) deletedCount++
    }

    // Delete content images
    if (content) {
        const contentImages = extractImageUrlsFromHtml(content)
        for (const imageUrl of contentImages) {
            if (imageUrl.startsWith('/uploads/')) {
                const deleted = await deleteFile(imageUrl)
                if (deleted) deletedCount++
            }
        }
    }

    return deletedCount
}

/**
 * Transform image URLs in HTML (for migration)
 */
export function transformImageUrls(
    html: string,
    transformer: (url: string) => string
): string {
    if (!html) return html

    return html.replace(
        /(<img[^>]+src=["'])([^"']+)(["'])/gi,
        (match, prefix, url, suffix) => {
            return prefix + transformer(url) + suffix
        }
    )
}

/**
 * Get public URL for local uploads
 */
export function getImageUrl(path: string | null | undefined): string {
    if (!path) return '/placeholder.svg'
    
    // Already a full URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
    }
    
    // Already a local path
    if (path.startsWith('/uploads/') || path.startsWith('/')) {
        return path
    }
    
    // Relative path, make absolute
    return `/uploads/${path}`
}

export default {
    uploadFile,
    uploadImage,
    deleteFile,
    fileExists,
    getFileInfo,
    extractImageUrlsFromHtml,
    deletePostImages,
    transformImageUrls,
    getImageUrl,
}
