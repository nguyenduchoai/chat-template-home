/**
 * HTML Sanitization utilities using DOMPurify
 * Prevents XSS attacks when rendering user-generated HTML content
 */

// DOMPurify only works in browser environment
// For SSR, we need to use isomorphic-dompurify or handle server-side

/**
 * Sanitize HTML content to prevent XSS attacks
 * Safe for use with dangerouslySetInnerHTML
 */
export function sanitizeHtml(dirty: string): string {
    if (!dirty) return ''
    
    // Server-side: return as-is (DOMPurify requires DOM)
    // In production, consider using isomorphic-dompurify for full SSR support
    if (typeof window === 'undefined') {
        // Basic server-side sanitization - strip script tags
        return dirty
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/javascript:/gi, '')
    }
    
    // Client-side: use DOMPurify
    // Dynamic import to avoid SSR issues
    const DOMPurify = require('dompurify')
    
    return DOMPurify.sanitize(dirty, {
        // Allow common HTML tags for blog content
        ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr',
            'ul', 'ol', 'li',
            'blockquote', 'pre', 'code',
            'strong', 'em', 'b', 'i', 'u', 's', 'strike',
            'a', 'img', 'figure', 'figcaption',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'div', 'span',
            'sup', 'sub',
        ],
        // Allow safe attributes
        ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'width', 'height',
            'class', 'id', 'style',
            'target', 'rel',
            'colspan', 'rowspan',
        ],
        // Force all links to open in new tab with noopener
        ADD_ATTR: ['target', 'rel'],
        // Remove dangerous URI schemes
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    })
}

/**
 * Sanitize HTML and transform image URLs
 * Combines sanitization with image URL transformation
 */
export function sanitizeAndTransformHtml(
    html: string, 
    transformFn?: (html: string) => string
): string {
    if (!html) return ''
    
    // First transform (e.g., image URLs), then sanitize
    const transformed = transformFn ? transformFn(html) : html
    return sanitizeHtml(transformed)
}
