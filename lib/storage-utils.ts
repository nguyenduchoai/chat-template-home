/**
 * Storage Utilities
 * Supports both local storage and Supabase storage (for backward compatibility)
 */

import { deleteFile, isSupabaseConfigured } from "@/lib/storage"

// Check if URL is from Supabase storage
export function isSupabaseStorageUrl(url: string): boolean {
    if (!url) return false
    return url.includes('supabase.co/storage') || url.includes('.supabase.co')
}

// Check if URL is from local storage
export function isLocalStorageUrl(url: string): boolean {
    if (!url) return false
    return url.startsWith('/uploads/')
}

export function extractStoragePath(url: string): string | null {
    // For local storage
    if (isLocalStorageUrl(url)) {
        return url.replace(/^\/uploads\//, '')
    }

    // For Supabase storage
    if (!isSupabaseStorageUrl(url)) {
        return null
    }

    try {
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split("/")
        const bucketIndex = pathParts.indexOf("public")
        
        if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
            return null
        }

        const filePath = pathParts.slice(bucketIndex + 2).join("/")
        return filePath || null
    } catch (error) {
        console.error("Error extracting storage path:", error)
        return null
    }
}

export function extractImageUrlsFromHtml(html: string): string[] {
    if (!html) return []

    const imageUrls: string[] = []
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    let match

    while ((match = imgRegex.exec(html)) !== null) {
        const url = match[1]
        if (isSupabaseStorageUrl(url) || isLocalStorageUrl(url)) {
            imageUrls.push(url)
        }
    }

    return imageUrls
}

export async function deleteImageFromStorage(url: string): Promise<boolean> {
    try {
        // Handle local storage
        if (isLocalStorageUrl(url)) {
            return await deleteFile(url)
        }

        // Handle Supabase storage (only if configured)
        if (isSupabaseStorageUrl(url) && isSupabaseConfigured()) {
            const { createSupabaseAdminClient } = await import('@/lib/supabase')
            const filePath = extractStoragePath(url)
            if (!filePath) {
                console.warn("Cannot extract storage path from URL:", url)
                return false
            }

            const supabase = createSupabaseAdminClient()
            if (!supabase) {
                console.warn("Supabase admin client not available")
                return false
            }

            const { error } = await supabase.storage
                .from("images")
                .remove([filePath])

            if (error) {
                console.error("Error deleting image from Supabase storage:", error)
                return false
            }

            return true
        }

        console.warn("Unknown storage URL type:", url)
        return false
    } catch (error) {
        console.error("Error deleting image from storage:", error)
        return false
    }
}

export async function deleteImagesFromStorage(urls: string[]): Promise<number> {
    if (!urls || urls.length === 0) return 0

    let deletedCount = 0
    for (const url of urls) {
        const success = await deleteImageFromStorage(url)
        if (success) {
            deletedCount++
        }
    }

    return deletedCount
}

export async function deletePostImages(coverImage: string | null, content: string | null): Promise<number> {
    const imageUrls: string[] = []

    if (coverImage && (isSupabaseStorageUrl(coverImage) || isLocalStorageUrl(coverImage))) {
        imageUrls.push(coverImage)
    }

    if (content) {
        const contentImages = extractImageUrlsFromHtml(content)
        imageUrls.push(...contentImages)
    }

    const uniqueUrls = [...new Set(imageUrls)]

    if (uniqueUrls.length === 0) {
        return 0
    }

    return await deleteImagesFromStorage(uniqueUrls)
}
