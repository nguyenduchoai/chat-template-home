/**
 * DEPRECATED: Supabase Storage has been replaced with local file storage
 * 
 * This file is kept for backward compatibility during migration.
 * For new code, use lib/storage.ts instead.
 */

import { uploadImage, deleteFile, getImageUrl } from './storage'

// Re-export local storage functions with Supabase-like interface
export async function uploadToSupabase(
    bucket: string,
    path: string,
    file: File | Blob | ArrayBuffer,
    options?: {
        contentType?: string
        upsert?: boolean
    }
) {
    console.warn('[DEPRECATED] uploadToSupabase - Use uploadImage from lib/storage.ts instead')
    
    // Extract folder from path
    const folder = path.split('/').slice(0, -1).join('/') || bucket
    
    // Convert to File if needed
    let fileToUpload: File | Buffer
    if (file instanceof ArrayBuffer) {
        fileToUpload = Buffer.from(file)
    } else if (file instanceof Blob) {
        const buffer = await file.arrayBuffer()
        fileToUpload = Buffer.from(buffer)
    } else {
        fileToUpload = file
    }
    
    const result = await uploadImage(fileToUpload, folder)
    
    if (!result.success) {
        throw new Error(result.error || 'Upload failed')
    }
    
    return {
        path: result.url,
        url: result.url,
    }
}

export async function deleteFromSupabase(bucket: string, path: string) {
    console.warn('[DEPRECATED] deleteFromSupabase - Use deleteFile from lib/storage.ts instead')
    
    const success = await deleteFile(path)
    
    if (!success) {
        throw new Error('Delete failed')
    }
    
    return { success: true }
}

export async function getSupabasePublicUrl(bucket: string, path: string) {
    console.warn('[DEPRECATED] getSupabasePublicUrl - Use getImageUrl from lib/storage.ts instead')
    return getImageUrl(path)
}
