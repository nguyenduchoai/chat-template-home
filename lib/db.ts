import { createSupabaseServerClient, createSupabaseScriptClient } from './supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

async function getSupabaseClient(): Promise<SupabaseClient> {
    try {
        return await createSupabaseServerClient()
    } catch (error) {
        return createSupabaseScriptClient()
    }
}

export interface User {
    id: string
    email: string
    name?: string | null
    password?: string | null
    image?: string | null
    role: string
    emailVerified?: Date | null
    createdAt: Date
    updatedAt: Date
}

export interface Post {
    id: string
    title: string
    slug: string
    content: string
    excerpt?: string | null
    coverImage?: string | null
    published: boolean
    authorId: string
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date | null
    author?: {
        name: string | null
        image?: string | null
    }
}

export interface SiteInfo {
    id: string
    siteUrl: string
    title: string
    name?: string | null
    logo?: string | null
    description?: string | null
    keywords?: string | null
    bannerTitle?: string | null
    bannerDescription?: string | null
    author?: string | null
    email?: string | null
    phone?: string | null
    facebook?: string | null
    instagram?: string | null
    twitter?: string | null
    linkedin?: string | null
    youtube?: string | null
    tiktok?: string | null
    address?: string | null
    contact?: string | null
    ogImage?: string | null
    ogType?: string | null
    twitterCard?: string | null
    updatedAt: Date
    updatedBy?: string | null
}

export interface Slide {
    id: string
    title: string
    image: string
    link?: string | null
    order: number
    active: boolean
    createdAt: Date
    updatedAt: Date
}

// Users
export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('User')
            .select('*')
            .eq('email', email)
            .single()

        console.log('Get user by email data:', data, 'error:', error)
        if (error || !data) return null
        return data as User
    } catch (error) {
        console.error('Error fetching user:', error)
        return null
    }
}

export async function getUserById(id: string): Promise<User | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('User')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) return null
        return data as User
    } catch (error) {
        console.error('Error fetching user:', error)
        return null
    }
}

export async function createUser(userData: {
    email: string
    name?: string
    password?: string
    role?: string
    image?: string
}): Promise<User> {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
        .from('User')
        .insert({
            email: userData.email,
            name: userData.name || null,
            password: userData.password || null,
            role: userData.role || 'user',
            image: userData.image || null,
        })
        .select()
        .single()

    if (error) {
        if (error.code === '23505') {
            throw new Error('Email đã tồn tại trong hệ thống')
        }
        throw new Error('Lỗi tạo người dùng')
    }

    if (!data) {
        throw new Error('Không có dữ liệu trả về')
    }

    return data as User


}


export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('User')
            .update(userData)
            .eq('id', id)
            .select()
            .single()

        if (error || !data) return null
        return data as User
    } catch (error) {
        console.error('Error updating user:', error)
        return null
    }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('User')
            .select('id, name, email, role, createdAt')
            .order('createdAt', { ascending: false })

        if (error || !data) return []
        return data as User[]
    } catch (error) {
        console.error('Error fetching users:', error)
        return []
    }
}

// Posts
export async function getPublishedPosts(limit?: number): Promise<Post[]> {
    try {
        const supabase = await getSupabaseClient()
        let query = supabase
            .from('Post')
            .select(`
                *,
                User!Post_authorId_fkey(name, image)
            `)
            .eq('published', true)
            .order('publishedAt', { ascending: false, nullsFirst: false })

        if (limit) {
            query = query.limit(limit)
        }

        const { data, error } = await query

        if (error || !data) {
            console.error('Error fetching published posts:', error)
            return []
        }

        return data.map((post: any) => ({
            ...post,
            author: post.User ? { name: post.User.name, image: post.User.image } : null,
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt),
        })) as Post[]
    } catch (error) {
        console.error('Error fetching posts:', error)
        return []
    }
}

export async function getAllPosts(): Promise<Post[]> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Post')
            .select('id, title, slug, excerpt, coverImage, published, publishedAt, createdAt')
            .order('createdAt', { ascending: false })
        console.log('Get all posts data:', data, 'error:', error)
        if (error || !data) return []
        return data.map((post: any) => ({
            ...post,
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt),
        })) as Post[]
    } catch (error) {
        console.error('Error fetching posts:', error)
        return []
    }
}

export async function getPostById(id: string): Promise<Post | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Post')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) return null
        return {
            ...data,
            publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        } as Post
    } catch (error) {
        console.error('Error fetching post:', error)
        return null
    }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Post')
            .select(`
                *,
                User!Post_authorId_fkey(name, image)
            `)
            .eq('slug', slug)
            .eq('published', true)
            .single()

        if (error || !data) return null
        return {
            ...data,
            author: data.User ? { name: data.User.name, image: data.User.image } : null,
            publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        } as Post
    } catch (error) {
        console.error('Error fetching post:', error)
        return null
    }
}

export async function createPost(postData: {
    title: string
    slug: string
    content: string
    excerpt?: string
    coverImage?: string
    published?: boolean
    authorId: string
}): Promise<Post | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Post')
            .insert({
                title: postData.title,
                slug: postData.slug,
                content: postData.content,
                excerpt: postData.excerpt || null,
                coverImage: postData.coverImage || null,
                published: postData.published ?? false,
                authorId: postData.authorId,
                publishedAt: postData.published ? new Date().toISOString() : null,
            })
            .select()
            .single()

        if (error || !data) return null
        return {
            ...data,
            publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        } as Post
    } catch (error) {
        console.error('Error creating post:', error)
        return null
    }
}

export async function updatePost(id: string, postData: Partial<Post>): Promise<Post | null> {
    try {
        const supabase = await getSupabaseClient()
        const updateData: any = { ...postData }

        if (postData.published !== undefined) {
            updateData.publishedAt = postData.published ? new Date().toISOString() : null
        }

        const { data, error } = await supabase
            .from('Post')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error || !data) return null
        return {
            ...data,
            publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        } as Post
    } catch (error) {
        console.error('Error updating post:', error)
        return null
    }
}

export async function deletePost(id: string): Promise<boolean> {
    try {
        const supabase = await getSupabaseClient()
        const { error } = await supabase
            .from('Post')
            .delete()
            .eq('id', id)

        return !error
    } catch (error) {
        console.error('Error deleting post:', error)
        return false
    }
}

export async function deleteUser(id: string): Promise<boolean> {
    try {
        const supabase = await getSupabaseClient()
        const { error } = await supabase
            .from('User')
            .delete()
            .eq('id', id)

        if (error) {
            throw new Error('Không thể xóa người dùng')
        }

        return true
    } catch (error) {
        throw error instanceof Error ? error : new Error('Không thể xóa người dùng')
    }
}

export async function countPosts(): Promise<number> {
    try {
        const supabase = await getSupabaseClient()
        const { count, error } = await supabase
            .from('Post')
            .select('*', { count: 'exact', head: true })

        if (error) return 0
        return count || 0
    } catch (error) {
        console.error('Error counting posts:', error)
        return 0
    }
}

export async function countPublishedPosts(): Promise<number> {
    try {
        const supabase = await getSupabaseClient()
        const { count, error } = await supabase
            .from('Post')
            .select('*', { count: 'exact', head: true })
            .eq('published', true)

        if (error) return 0
        return count || 0
    } catch (error) {
        console.error('Error counting published posts:', error)
        return 0
    }
}

// SiteInfo
const SITE_INFO_COLUMNS = `
    id,
    siteUrl,
    title,
    name,
    logo,
    description,
    keywords,
    bannerTitle,
    bannerDescription,
    author,
    email,
    phone,
    facebook,
    instagram,
    twitter,
    linkedin,
    youtube,
    tiktok,
    address,
    contact,
    ogImage,
    ogType,
    twitterCard,
    updatedAt,
    updatedBy
`

function mapSiteInfo(data: any): SiteInfo {
    return {
        ...data,
        updatedAt: new Date(data.updatedAt),
    }
}

export async function getSiteInfoRecord(): Promise<SiteInfo | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('SiteInfo')
            .select(SITE_INFO_COLUMNS)
            .limit(1)
            .maybeSingle()

        if (error || !data) return null
        return mapSiteInfo(data)
    } catch (error) {
        console.error('Error fetching site info:', error)
        return null
    }
}

export async function updateSiteInfoRecord(
    payload: Partial<Omit<SiteInfo, 'id' | 'updatedAt'>>,
    updatedBy?: string
): Promise<SiteInfo | null> {
    try {
        const supabase = await getSupabaseClient()
        const existing = await getSiteInfoRecord()

        const dataToSave: Record<string, any> = { ...payload }
        if (updatedBy) {
            dataToSave.updatedBy = updatedBy
        }

        if (existing) {
            const { data, error } = await supabase
                .from('SiteInfo')
                .update(dataToSave)
                .eq('id', existing.id)
                .select(SITE_INFO_COLUMNS)
                .single()

            if (error || !data) return null
            return mapSiteInfo(data)
        } else {
            const { data, error } = await supabase
                .from('SiteInfo')
                .insert(dataToSave)
                .select(SITE_INFO_COLUMNS)
                .single()

            if (error || !data) return null
            return mapSiteInfo(data)
        }
    } catch (error) {
        console.error('Error updating site info:', error)
        return null
    }
}

// Slides
const SLIDE_COLUMNS = `
    id,
    title,
    image,
    link,
    "order",
    active,
    created_at,
    updated_at
`

function mapSlide(data: any): Slide {
    return {
        id: data.id,
        title: data.title,
        image: data.image,
        link: data.link,
        order: data.order,
        active: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
    }
}

export async function getAllSlides(): Promise<Slide[]> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Slides')
            .select(SLIDE_COLUMNS)
            .order('order', { ascending: true })

        if (error || !data) return []
        return data.map(mapSlide)
    } catch (error) {
        console.error('Error fetching slides:', error)
        return []
    }
}

export async function getActiveSlides(): Promise<Slide[]> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Slides')
            .select(SLIDE_COLUMNS)
            .eq('active', true)
            .order('order', { ascending: true })

        if (error || !data) return []
        return data.map(mapSlide)
    } catch (error) {
        console.error('Error fetching active slides:', error)
        return []
    }
}

export async function getSlideById(id: string): Promise<Slide | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Slides')
            .select(SLIDE_COLUMNS)
            .eq('id', id)
            .single()

        if (error || !data) return null
        return mapSlide(data)
    } catch (error) {
        console.error('Error fetching slide:', error)
        return null
    }
}

export async function createSlide(slide: {
    title: string
    image: string
    link?: string
    order?: number
    active?: boolean
}): Promise<Slide | null> {
    try {
        const supabase = await getSupabaseClient()

        let order = slide.order
        if (order === undefined) {
            const { data: maxData } = await supabase
                .from('Slides')
                .select('order')
                .order('order', { ascending: false })
                .limit(1)
                .single()

            order = maxData ? maxData.order + 1 : 0
        }

        const { data, error } = await supabase
            .from('Slides')
            .insert({
                title: slide.title,
                image: slide.image,
                link: slide.link || null,
                order: order,
                active: slide.active !== undefined ? slide.active : true,
            })
            .select(SLIDE_COLUMNS)
            .single()
        console.log('Create slide data:', data, 'error:', error)

        if (error || !data) return null
        return mapSlide(data)
    } catch (error) {
        console.error('Error creating slide:', error)
        return null
    }
}

export async function updateSlide(
    id: string,
    slide: Partial<Omit<Slide, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Slide | null> {
    try {
        console.log('Updating slide id:', id, 'with data:', slide)
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Slides')
            .update({
                title: slide.title,
                image: slide.image,
                link: slide.link,
                order: slide.order,
                active: slide.active,
            })
            .eq('id', id)
            .select(SLIDE_COLUMNS)
            .single()
        console.log('Update slide data:', data, 'error:', error)

        if (error || !data) return null
        return mapSlide(data)
    } catch (error) {
        console.error('Error updating slide:', error)
        return null
    }
}

export async function deleteSlide(id: string): Promise<boolean> {
    try {
        const supabase = await getSupabaseClient()
        const { error } = await supabase
            .from('Slides')
            .delete()
            .eq('id', id)

        return !error
    } catch (error) {
        console.error('Error deleting slide:', error)
        return false
    }
}

export async function reorderSlides(slideOrders: { id: string; order: number }[]): Promise<boolean> {
    try {
        const supabase = await getSupabaseClient()

        // Update all slides in transaction
        for (const item of slideOrders) {
            const { error } = await supabase
                .from('Slides')
                .update({ order: item.order })
                .eq('id', item.id)

            if (error) throw error
        }

        return true
    } catch (error) {
        console.error('Error reordering slides:', error)
        return false
    }
}

