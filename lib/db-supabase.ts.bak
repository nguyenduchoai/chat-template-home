import { createSupabaseServerClient, createSupabaseScriptClient } from './supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

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
    featuresTitle?: string | null
    featuresDescription?: string | null
    reasonsTitle?: string | null
    reasonsDescription?: string | null
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

export interface Feature {
    id: string
    icon: string
    title: string
    description: string
    order: number
    active: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Reason {
    id: string
    icon: string
    title: string
    description: string
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

    // Hash password if provided
    let hashedPassword = userData.password
    if (hashedPassword && !hashedPassword.startsWith('$2a$')) {
        hashedPassword = await bcrypt.hash(hashedPassword, 10)
    }

    const { data, error } = await supabase
        .from('User')
        .insert({
            email: userData.email,
            name: userData.name || null,
            password: hashedPassword || null,
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

export async function getUsersPaginated(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number, totalPages: number }> {
    try {
        const supabase = await getSupabaseClient()
        const from = (page - 1) * limit
        const to = from + limit - 1

        // Get total count
        const { count, error: countError } = await supabase
            .from('User')
            .select('*', { count: 'exact', head: true })

        if (countError) {
            console.error('Error counting users:', countError)
            return { users: [], total: 0, totalPages: 0 }
        }

        // Get paginated data
        const { data, error } = await supabase
            .from('User')
            .select('id, name, email, role, createdAt')
            .order('createdAt', { ascending: false })
            .range(from, to)

        if (error || !data) {
            console.error('Error fetching users:', error)
            return { users: [], total: count || 0, totalPages: 0 }
        }

        const totalPages = Math.ceil((count || 0) / limit)

        return {
            users: data as User[],
            total: count || 0,
            totalPages
        }
    } catch (error) {
        console.error('Error fetching users:', error)
        return { users: [], total: 0, totalPages: 0 }
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

export async function getPostsPaginated(page: number = 1, limit: number = 10): Promise<{ posts: Post[], total: number, totalPages: number }> {
    try {
        const supabase = await getSupabaseClient()
        const from = (page - 1) * limit
        const to = from + limit - 1

        // Get total count
        const { count, error: countError } = await supabase
            .from('Post')
            .select('*', { count: 'exact', head: true })

        if (countError) {
            console.error('Error counting posts:', countError)
            return { posts: [], total: 0, totalPages: 0 }
        }

        // Get paginated data
        const { data, error } = await supabase
            .from('Post')
            .select('id, title, slug, excerpt, coverImage, published, publishedAt, createdAt')
            .order('createdAt', { ascending: false })
            .range(from, to)

        if (error || !data) {
            console.error('Error fetching posts:', error)
            return { posts: [], total: count || 0, totalPages: 0 }
        }

        const totalPages = Math.ceil((count || 0) / limit)

        return {
            posts: data.map((post: any) => ({
                ...post,
                publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
                createdAt: new Date(post.createdAt),
                updatedAt: new Date(post.updatedAt),
            })) as Post[],
            total: count || 0,
            totalPages
        }
    } catch (error) {
        console.error('Error fetching posts:', error)
        return { posts: [], total: 0, totalPages: 0 }
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

// Check if slug exists (for any post, not just published)
export async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    try {
        const supabase = await getSupabaseClient()
        let query = supabase
            .from('Post')
            .select('id')
            .eq('slug', slug)
            .limit(1)

        // Exclude current post when updating
        if (excludeId) {
            query = query.neq('id', excludeId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error checking slug:', error)
            return false
        }

        return data && data.length > 0
    } catch (error) {
        console.error('Error checking slug:', error)
        return false
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
        // Check if slug already exists
        const slugExists = await checkSlugExists(postData.slug)
        if (slugExists) {
            throw new Error(`Slug "${postData.slug}" đã tồn tại. Vui lòng chọn slug khác.`)
        }

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

        if (error) {
            // Handle duplicate key error specifically
            if (error.code === '23505' && error.message?.includes('slug')) {
                throw new Error(`Slug "${postData.slug}" đã tồn tại. Vui lòng chọn slug khác.`)
            }
            throw error
        }

        if (!data) return null

        return {
            ...data,
            publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        } as Post
    } catch (error: any) {
        console.error('Error creating post:', error)
        // Re-throw with proper message
        throw error
    }
}

export async function updatePost(id: string, postData: Partial<Post>): Promise<Post | null> {
    try {
        // Check if slug is being updated and if it already exists
        if (postData.slug) {
            const slugExists = await checkSlugExists(postData.slug, id)
            if (slugExists) {
                throw new Error(`Slug "${postData.slug}" đã tồn tại. Vui lòng chọn slug khác.`)
            }
        }

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

        if (error) {
            // Handle duplicate key error specifically
            if (error.code === '23505' && error.message?.includes('slug')) {
                throw new Error(`Slug "${postData.slug}" đã tồn tại. Vui lòng chọn slug khác.`)
            }
            throw error
        }

        if (!data) return null

        return {
            ...data,
            publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        } as Post
    } catch (error: any) {
        console.error('Error updating post:', error)
        // Re-throw with proper message
        throw error
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
    featuresTitle,
    featuresDescription,
    reasonsTitle,
    reasonsDescription,
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

// ============ FEATURES ============

const FEATURE_COLUMNS = 'id, icon, title, description, "order", active, created_at, updated_at'

function mapFeature(data: any): Feature {
    return {
        id: data.id,
        icon: data.icon,
        title: data.title,
        description: data.description,
        order: data.order,
        active: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
    }
}

export async function getAllFeatures(): Promise<Feature[]> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Features')
            .select(FEATURE_COLUMNS)
            .order('order', { ascending: true })

        if (error || !data) return []
        return data.map(mapFeature)
    } catch (error) {
        console.error('Error fetching features:', error)
        return []
    }
}

export async function getActiveFeatures(): Promise<Feature[]> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Features')
            .select(FEATURE_COLUMNS)
            .eq('active', true)
            .order('order', { ascending: true })

        if (error || !data) return []
        return data.map(mapFeature)
    } catch (error) {
        console.error('Error fetching active features:', error)
        return []
    }
}

export async function getFeatureById(id: string): Promise<Feature | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Features')
            .select(FEATURE_COLUMNS)
            .eq('id', id)
            .single()

        if (error || !data) return null
        return mapFeature(data)
    } catch (error) {
        console.error('Error fetching feature:', error)
        return null
    }
}

export async function createFeature(
    feature: Omit<Feature, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Feature | null> {
    try {
        const supabase = await getSupabaseClient()

        // Get max order
        const { data: maxData } = await supabase
            .from('Features')
            .select('"order"')
            .order('order', { ascending: false })
            .limit(1)
            .single()

        const order = maxData ? maxData.order + 1 : 1

        const { data, error } = await supabase
            .from('Features')
            .insert({
                icon: feature.icon,
                title: feature.title,
                description: feature.description,
                order: order,
                active: feature.active !== undefined ? feature.active : true,
            })
            .select(FEATURE_COLUMNS)
            .single()

        if (error || !data) return null
        return mapFeature(data)
    } catch (error) {
        console.error('Error creating feature:', error)
        return null
    }
}

export async function updateFeature(
    id: string,
    feature: Partial<Omit<Feature, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Feature | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Features')
            .update({
                icon: feature.icon,
                title: feature.title,
                description: feature.description,
                order: feature.order,
                active: feature.active,
            })
            .eq('id', id)
            .select(FEATURE_COLUMNS)
            .single()

        if (error || !data) return null
        return mapFeature(data)
    } catch (error) {
        console.error('Error updating feature:', error)
        return null
    }
}

export async function deleteFeature(id: string): Promise<boolean> {
    try {
        const supabase = await getSupabaseClient()
        const { error } = await supabase
            .from('Features')
            .delete()
            .eq('id', id)

        return !error
    } catch (error) {
        console.error('Error deleting feature:', error)
        return false
    }
}

export async function reorderFeatures(featureOrders: { id: string; order: number }[]): Promise<boolean> {
    try {
        const supabase = await getSupabaseClient()

        for (const item of featureOrders) {
            const { error } = await supabase
                .from('Features')
                .update({ order: item.order })
                .eq('id', item.id)

            if (error) throw error
        }

        return true
    } catch (error) {
        console.error('Error reordering features:', error)
        return false
    }
}

// ============ REASONS ============

const REASON_COLUMNS = 'id, icon, title, description, "order", active, created_at, updated_at'

function mapReason(data: any): Reason {
    return {
        id: data.id,
        icon: data.icon,
        title: data.title,
        description: data.description,
        order: data.order,
        active: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
    }
}

export async function getAllReasons(): Promise<Reason[]> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Reasons')
            .select(REASON_COLUMNS)
            .order('order', { ascending: true })

        if (error || !data) return []
        return data.map(mapReason)
    } catch (error) {
        console.error('Error fetching reasons:', error)
        return []
    }
}

export async function getActiveReasons(): Promise<Reason[]> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Reasons')
            .select(REASON_COLUMNS)
            .eq('active', true)
            .order('order', { ascending: true })

        if (error || !data) return []
        return data.map(mapReason)
    } catch (error) {
        console.error('Error fetching active reasons:', error)
        return []
    }
}

export async function getReasonById(id: string): Promise<Reason | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Reasons')
            .select(REASON_COLUMNS)
            .eq('id', id)
            .single()

        if (error || !data) return null
        return mapReason(data)
    } catch (error) {
        console.error('Error fetching reason:', error)
        return null
    }
}

export async function createReason(
    reason: Omit<Reason, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Reason | null> {
    try {
        const supabase = await getSupabaseClient()

        // Get max order
        const { data: maxData } = await supabase
            .from('Reasons')
            .select('"order"')
            .order('order', { ascending: false })
            .limit(1)
            .single()

        const order = maxData ? maxData.order + 1 : 1

        const { data, error } = await supabase
            .from('Reasons')
            .insert({
                icon: reason.icon,
                title: reason.title,
                description: reason.description,
                order: order,
                active: reason.active !== undefined ? reason.active : true,
            })
            .select(REASON_COLUMNS)
            .single()

        if (error || !data) return null
        return mapReason(data)
    } catch (error) {
        console.error('Error creating reason:', error)
        return null
    }
}

export async function updateReason(
    id: string,
    reason: Partial<Omit<Reason, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Reason | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Reasons')
            .update({
                icon: reason.icon,
                title: reason.title,
                description: reason.description,
                order: reason.order,
                active: reason.active,
            })
            .eq('id', id)
            .select(REASON_COLUMNS)
            .single()

        if (error || !data) return null
        return mapReason(data)
    } catch (error) {
        console.error('Error updating reason:', error)
        return null
    }
}

export async function deleteReason(id: string): Promise<boolean> {
    try {
        const supabase = await getSupabaseClient()
        const { error } = await supabase
            .from('Reasons')
            .delete()
            .eq('id', id)

        return !error
    } catch (error) {
        console.error('Error deleting reason:', error)
        return false
    }
}

export async function reorderReasons(reasonOrders: { id: string; order: number }[]): Promise<boolean> {
    try {
        const supabase = await getSupabaseClient()

        for (const item of reasonOrders) {
            const { error } = await supabase
                .from('Reasons')
                .update({ order: item.order })
                .eq('id', item.id)

            if (error) throw error
        }

        return true
    } catch (error) {
        console.error('Error reordering reasons:', error)
        return false
    }
}

// ============ COLOR CONFIG ============

export interface ColorConfig {
    id: string
    key: string
    value: string
    rgbValue?: string | null
    description?: string | null
    createdAt: Date
    updatedAt: Date
}

const COLOR_CONFIG_COLUMNS = 'id, "key", value, "rgbValue", description, "createdAt", "updatedAt"'

function mapColorConfig(data: any): ColorConfig {
    return {
        id: data.id,
        key: data.key,
        value: data.value,
        rgbValue: data.rgbValue,
        description: data.description,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
    }
}

export async function getAllColorConfigs(): Promise<ColorConfig[]> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('ColorConfig')
            .select(COLOR_CONFIG_COLUMNS)
            .order('key', { ascending: true })

        if (error || !data) return []
        return data.map(mapColorConfig)
    } catch (error) {
        console.error('Error fetching color configs:', error)
        return []
    }
}

export async function getColorConfigByKey(key: string): Promise<ColorConfig | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('ColorConfig')
            .select(COLOR_CONFIG_COLUMNS)
            .eq('key', key)
            .single()

        if (error || !data) return null
        return mapColorConfig(data)
    } catch (error) {
        console.error('Error fetching color config:', error)
        return null
    }
}

export async function getColorConfigsByKeys(keys: string[]): Promise<Record<string, string>> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('ColorConfig')
            .select('"key", value')
            .in('key', keys)

        if (error || !data) return {}

        const result: Record<string, string> = {}
        data.forEach((item) => {
            result[item.key] = item.value
        })
        return result
    } catch (error) {
        console.error('Error fetching color configs by keys:', error)
        return {}
    }
}

export async function createColorConfig(config: {
    key: string
    value: string
    rgbValue?: string
    description?: string
}): Promise<ColorConfig | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('ColorConfig')
            .insert({
                key: config.key,
                value: config.value,
                rgbValue: config.rgbValue || null,
                description: config.description || null,
            })
            .select(COLOR_CONFIG_COLUMNS)
            .single()

        if (error || !data) return null
        return mapColorConfig(data)
    } catch (error) {
        console.error('Error creating color config:', error)
        return null
    }
}

export async function updateColorConfig(
    key: string,
    config: Partial<Pick<ColorConfig, 'value' | 'rgbValue' | 'description'>>
): Promise<ColorConfig | null> {
    try {
        const supabase = await getSupabaseClient()
        const updateData: any = {}
        if (config.value !== undefined) updateData.value = config.value
        if (config.rgbValue !== undefined) updateData.rgbValue = config.rgbValue
        if (config.description !== undefined) updateData.description = config.description

        const { data, error } = await supabase
            .from('ColorConfig')
            .update(updateData)
            .eq('key', key)
            .select(COLOR_CONFIG_COLUMNS)
            .single()

        if (error || !data) return null
        return mapColorConfig(data)
    } catch (error) {
        console.error('Error updating color config:', error)
        return null
    }
}

export async function upsertColorConfig(config: {
    key: string
    value: string
    rgbValue?: string
    description?: string
}): Promise<ColorConfig | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('ColorConfig')
            .upsert(
                {
                    key: config.key,
                    value: config.value,
                    rgbValue: config.rgbValue || null,
                    description: config.description || null,
                },
                {
                    onConflict: 'key',
                }
            )
            .select(COLOR_CONFIG_COLUMNS)
            .single()

        if (error) {
            console.error('Error upserting color config:', error)
            console.error('Config:', config)
            return null
        }

        if (!data) {
            console.error('No data returned from upsert')
            return null
        }

        return mapColorConfig(data)
    } catch (error) {
        console.error('Error upserting color config:', error)
        console.error('Config:', config)
        return null
    }
}

export async function deleteColorConfig(key: string): Promise<boolean> {
    try {
        const supabase = await getSupabaseClient()
        const { error } = await supabase.from('ColorConfig').delete().eq('key', key)

        return !error
    } catch (error) {
        console.error('Error deleting color config:', error)
        return false
    }
}

// ============ CONTACT ============

export interface Contact {
    id: string
    name: string
    email: string
    phone?: string | null
    subject: string
    message: string
    read: boolean
    createdAt: Date
    updatedAt: Date
}

const CONTACT_COLUMNS = 'id, name, email, phone, subject, message, read, "createdAt", "updatedAt"'

function mapContact(data: any): Contact {
    return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        read: data.read,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
    }
}

export async function createContact(contact: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
}): Promise<Contact | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Contact')
            .insert({
                name: contact.name,
                email: contact.email,
                phone: contact.phone || null,
                subject: contact.subject,
                message: contact.message,
            })
            .select(CONTACT_COLUMNS)
            .single()

        if (error || !data) return null
        return mapContact(data)
    } catch (error) {
        console.error('Error creating contact:', error)
        return null
    }
}

export async function getAllContacts(): Promise<Contact[]> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Contact')
            .select(CONTACT_COLUMNS)
            .order('createdAt', { ascending: false })

        if (error || !data) return []
        return data.map(mapContact)
    } catch (error) {
        console.error('Error fetching contacts:', error)
        return []
    }
}

export async function getContactById(id: string): Promise<Contact | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Contact')
            .select(CONTACT_COLUMNS)
            .eq('id', id)
            .single()

        if (error || !data) return null
        return mapContact(data)
    } catch (error) {
        console.error('Error fetching contact:', error)
        return null
    }
}

export async function updateContact(
    id: string,
    updates: Partial<Pick<Contact, 'read'>>
): Promise<Contact | null> {
    try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
            .from('Contact')
            .update(updates)
            .eq('id', id)
            .select(CONTACT_COLUMNS)
            .single()

        if (error || !data) return null
        return mapContact(data)
    } catch (error) {
        console.error('Error updating contact:', error)
        return null
    }
}

export async function deleteContact(id: string): Promise<boolean> {
    try {
        const supabase = await getSupabaseClient()
        const { error } = await supabase.from('Contact').delete().eq('id', id)

        return !error
    } catch (error) {
        console.error('Error deleting contact:', error)
        return false
    }
}

export async function getUnreadContactsCount(): Promise<number> {
    try {
        const supabase = await getSupabaseClient()
        const { count, error } = await supabase
            .from('Contact')
            .select('*', { count: 'exact', head: true })
            .eq('read', false)

        if (error) return 0
        return count || 0
    } catch (error) {
        console.error('Error counting unread contacts:', error)
        return 0
    }
}

