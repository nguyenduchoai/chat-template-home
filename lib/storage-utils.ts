/**
 * Storage Utilities for Local File Storage
 */

import { deleteFile } from "@/lib/storage"

// Check if URL is from local storage
export function isLocalStorageUrl(url: string): boolean {
    if (!url) return false
    return url.startsWith('/uploads/')
}

export function extractStoragePath(url: string): string | null {
    if (!isLocalStorageUrl(url)) {
        return null
    }
    return url.replace(/^\/uploads\//, '')
}

export function extractImageUrlsFromHtml(html: string): string[] {
    if (!html) return []

    const imageUrls: string[] = []
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    let match

    while ((match = imgRegex.exec(html)) !== null) {
        const url = match[1]
        if (isLocalStorageUrl(url)) {
            imageUrls.push(url)
        }
    }

    return imageUrls
}

export async function deleteImageFromStorage(url: string): Promise<boolean> {
    try {
        if (isLocalStorageUrl(url)) {
            return await deleteFile(url)
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

    if (coverImage && isLocalStorageUrl(coverImage)) {
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
