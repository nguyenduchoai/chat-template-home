/**
 * Image URL utilities for local storage
 */

/**
 * Get the public URL for an image
 */
export function getImageUrl(url: string | null | undefined): string {
    if (!url) return '/placeholder.svg'
    
    // Already a full URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }
    
    // Already a local path
    if (url.startsWith('/')) {
        return url
    }
    
    // Relative path, make absolute
    return `/uploads/${url}`
}

/**
 * Check if URL is a local storage URL
 */
export function isLocalStorageUrl(url: string): boolean {
    if (!url) return false
    return url.startsWith('/uploads/')
}

/**
 * Transform image URLs in HTML content (no-op for local storage)
 */
export function transformHtmlImageUrls(html: string): string {
    // No transformation needed for local storage
    return html
}
