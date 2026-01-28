/**
 * MySQL Database Layer
 * Replaces Supabase with MySQL using mysql2
 * 
 * All functions maintain the same interface as the original Supabase version
 */

import { query, queryOne, execute, generateUUID } from './mysql'
import bcrypt from 'bcryptjs'

// ============================================
// TYPE DEFINITIONS
// ============================================

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
    // Section visibility toggles
    showSlides?: boolean
    showBanner?: boolean
    showFeatures?: boolean
    showReasons?: boolean
    showPosts?: boolean
    // Bizino AI Chat Configuration
    chatEnabled?: boolean
    chatAssistantId?: string | null
    chatApiUrl?: string | null
    chatApiKey?: string | null
    chatInputPlaceholder?: string | null
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

export interface ColorConfig {
    id: string
    key: string
    value: string
    rgbValue?: string | null
    description?: string | null
    createdAt: Date
    updatedAt: Date
}

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

// ============================================
// USER OPERATIONS
// ============================================

export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        return await queryOne<User>('SELECT * FROM `User` WHERE email = ?', [email])
    } catch (error) {
        console.error('Error fetching user:', error)
        return null
    }
}

export async function getUserById(id: string): Promise<User | null> {
    try {
        return await queryOne<User>('SELECT * FROM `User` WHERE id = ?', [id])
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
    const id = generateUUID()
    const password = userData.password ? await bcrypt.hash(userData.password, 10) : null

    await execute(
        `INSERT INTO \`User\` (id, email, name, password, role, image) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, userData.email, userData.name || null, password, userData.role || 'user', userData.image || null]
    )

    const user = await getUserById(id)
    if (!user) throw new Error('Failed to create user')
    return user
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
        const updates: string[] = []
        const values: any[] = []

        if (userData.name !== undefined) { updates.push('name = ?'); values.push(userData.name) }
        if (userData.image !== undefined) { updates.push('image = ?'); values.push(userData.image) }
        if (userData.role !== undefined) { updates.push('role = ?'); values.push(userData.role) }
        if (userData.password !== undefined && userData.password !== null) {
            const hashedPassword = userData.password.startsWith('$2a$') 
                ? userData.password 
                : await bcrypt.hash(userData.password, 10)
            updates.push('password = ?')
            values.push(hashedPassword)
        }

        if (updates.length === 0) return await getUserById(id)

        values.push(id)
        await execute(`UPDATE \`User\` SET ${updates.join(', ')} WHERE id = ?`, values)
        return await getUserById(id)
    } catch (error) {
        console.error('Error updating user:', error)
        return null
    }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        return await query<User>('SELECT * FROM `User` ORDER BY createdAt DESC')
    } catch (error) {
        console.error('Error fetching users:', error)
        return []
    }
}

export async function getUsersPaginated(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number, totalPages: number }> {
    try {
        const offset = (page - 1) * limit
        const users = await query<User>('SELECT * FROM `User` ORDER BY createdAt DESC LIMIT ? OFFSET ?', [limit, offset])
        const countResult = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM `User`')
        const total = countResult?.count || 0
        return { users, total, totalPages: Math.ceil(total / limit) }
    } catch (error) {
        console.error('Error fetching users:', error)
        return { users: [], total: 0, totalPages: 0 }
    }
}

export async function deleteUser(id: string): Promise<boolean> {
    try {
        const affected = await execute('DELETE FROM `User` WHERE id = ?', [id])
        return affected > 0
    } catch (error) {
        console.error('Error deleting user:', error)
        return false
    }
}

// ============================================
// POST OPERATIONS
// ============================================

export async function getPublishedPosts(limit?: number): Promise<Post[]> {
    try {
        let sql = `
            SELECT p.*, u.name as authorName, u.image as authorImage 
            FROM Post p 
            LEFT JOIN \`User\` u ON p.authorId = u.id 
            WHERE p.published = 1 
            ORDER BY p.publishedAt DESC
        `
        const params: any[] = []
        if (limit) {
            sql += ' LIMIT ?'
            params.push(limit)
        }

        const rows = await query<any>(sql, params)
        return rows.map(row => ({
            ...row,
            published: Boolean(row.published),
            author: { name: row.authorName, image: row.authorImage }
        }))
    } catch (error) {
        console.error('Error fetching posts:', error)
        return []
    }
}

export async function getAllPosts(): Promise<Post[]> {
    try {
        const rows = await query<any>(`
            SELECT p.*, u.name as authorName, u.image as authorImage 
            FROM Post p 
            LEFT JOIN \`User\` u ON p.authorId = u.id 
            ORDER BY p.createdAt DESC
        `)
        return rows.map(row => ({
            ...row,
            published: Boolean(row.published),
            author: { name: row.authorName, image: row.authorImage }
        }))
    } catch (error) {
        console.error('Error fetching posts:', error)
        return []
    }
}

export async function getPostsPaginated(page: number = 1, limit: number = 10): Promise<{ posts: Post[], total: number, totalPages: number }> {
    try {
        const offset = (page - 1) * limit
        const rows = await query<any>(`
            SELECT p.*, u.name as authorName, u.image as authorImage 
            FROM Post p 
            LEFT JOIN \`User\` u ON p.authorId = u.id 
            ORDER BY p.createdAt DESC 
            LIMIT ? OFFSET ?
        `, [limit, offset])

        const posts = rows.map(row => ({
            ...row,
            published: Boolean(row.published),
            author: { name: row.authorName, image: row.authorImage }
        }))

        const countResult = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Post')
        const total = countResult?.count || 0
        return { posts, total, totalPages: Math.ceil(total / limit) }
    } catch (error) {
        console.error('Error fetching posts:', error)
        return { posts: [], total: 0, totalPages: 0 }
    }
}

export async function getPostById(id: string): Promise<Post | null> {
    try {
        const row = await queryOne<any>(`
            SELECT p.*, u.name as authorName, u.image as authorImage 
            FROM Post p 
            LEFT JOIN \`User\` u ON p.authorId = u.id 
            WHERE p.id = ?
        `, [id])

        if (!row) return null
        return {
            ...row,
            published: Boolean(row.published),
            author: { name: row.authorName, image: row.authorImage }
        }
    } catch (error) {
        console.error('Error fetching post:', error)
        return null
    }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
    try {
        const row = await queryOne<any>(`
            SELECT p.*, u.name as authorName, u.image as authorImage 
            FROM Post p 
            LEFT JOIN \`User\` u ON p.authorId = u.id 
            WHERE p.slug = ? AND p.published = 1
        `, [slug])

        if (!row) return null
        return {
            ...row,
            published: Boolean(row.published),
            author: { name: row.authorName, image: row.authorImage }
        }
    } catch (error) {
        console.error('Error fetching post:', error)
        return null
    }
}

export async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    try {
        let sql = 'SELECT id FROM Post WHERE slug = ?'
        const params: any[] = [slug]
        if (excludeId) {
            sql += ' AND id != ?'
            params.push(excludeId)
        }
        const result = await queryOne<any>(sql, params)
        return result !== null
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
        const id = generateUUID()
        const published = postData.published ? 1 : 0
        const publishedAt = published ? new Date() : null

        await execute(
            `INSERT INTO Post (id, title, slug, content, excerpt, coverImage, published, authorId, publishedAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, postData.title, postData.slug, postData.content, postData.excerpt || null, 
             postData.coverImage || null, published, postData.authorId, publishedAt]
        )

        return await getPostById(id)
    } catch (error) {
        console.error('Error creating post:', error)
        return null
    }
}

export async function updatePost(id: string, postData: Partial<Post>): Promise<Post | null> {
    try {
        const updates: string[] = []
        const values: any[] = []

        if (postData.title !== undefined) { updates.push('title = ?'); values.push(postData.title) }
        if (postData.slug !== undefined) { updates.push('slug = ?'); values.push(postData.slug) }
        if (postData.content !== undefined) { updates.push('content = ?'); values.push(postData.content) }
        if (postData.excerpt !== undefined) { updates.push('excerpt = ?'); values.push(postData.excerpt) }
        if (postData.coverImage !== undefined) { updates.push('coverImage = ?'); values.push(postData.coverImage) }
        if (postData.published !== undefined) {
            updates.push('published = ?')
            values.push(postData.published ? 1 : 0)
            if (postData.published) {
                updates.push('publishedAt = COALESCE(publishedAt, NOW())')
            }
        }

        if (updates.length === 0) return await getPostById(id)

        values.push(id)
        await execute(`UPDATE Post SET ${updates.join(', ')} WHERE id = ?`, values)
        return await getPostById(id)
    } catch (error) {
        console.error('Error updating post:', error)
        return null
    }
}

export async function deletePost(id: string): Promise<boolean> {
    try {
        const affected = await execute('DELETE FROM Post WHERE id = ?', [id])
        return affected > 0
    } catch (error) {
        console.error('Error deleting post:', error)
        return false
    }
}

export async function countPosts(): Promise<number> {
    try {
        const result = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Post')
        return result?.count || 0
    } catch (error) {
        console.error('Error counting posts:', error)
        return 0
    }
}

export async function countPublishedPosts(): Promise<number> {
    try {
        const result = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Post WHERE published = 1')
        return result?.count || 0
    } catch (error) {
        console.error('Error counting posts:', error)
        return 0
    }
}

// ============================================
// SITE INFO OPERATIONS
// ============================================

export async function getSiteInfoRecord(): Promise<SiteInfo | null> {
    try {
        return await queryOne<SiteInfo>('SELECT * FROM SiteInfo LIMIT 1')
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
        // Check if exists
        const existing = await getSiteInfoRecord()
        
        if (!existing) {
            // Create new
            const id = generateUUID()
            const columns = ['id', ...Object.keys(payload)]
            if (updatedBy) columns.push('updatedBy')
            
            const placeholders = columns.map(() => '?').join(', ')
            const values = [id, ...Object.values(payload)]
            if (updatedBy) values.push(updatedBy)

            await execute(`INSERT INTO SiteInfo (${columns.join(', ')}) VALUES (${placeholders})`, values)
            return await getSiteInfoRecord()
        }

        // Update existing
        const updates: string[] = []
        const values: any[] = []

        Object.entries(payload).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'updatedAt') {
                updates.push(`${key} = ?`)
                values.push(value)
            }
        })

        if (updatedBy) {
            updates.push('updatedBy = ?')
            values.push(updatedBy)
        }

        if (updates.length === 0) return existing

        values.push(existing.id)
        await execute(`UPDATE SiteInfo SET ${updates.join(', ')} WHERE id = ?`, values)
        return await getSiteInfoRecord()
    } catch (error) {
        console.error('Error updating site info:', error)
        return null
    }
}

// ============================================
// SLIDES OPERATIONS
// ============================================

function mapSlide(row: any): Slide {
    return {
        ...row,
        active: Boolean(row.active),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export async function getAllSlides(): Promise<Slide[]> {
    try {
        const rows = await query<any>('SELECT * FROM Slides ORDER BY `order` ASC')
        return rows.map(mapSlide)
    } catch (error) {
        console.error('Error fetching slides:', error)
        return []
    }
}

export async function getActiveSlides(): Promise<Slide[]> {
    try {
        const rows = await query<any>('SELECT * FROM Slides WHERE active = 1 ORDER BY `order` ASC')
        return rows.map(mapSlide)
    } catch (error) {
        console.error('Error fetching slides:', error)
        return []
    }
}

export async function getSlideById(id: string): Promise<Slide | null> {
    try {
        const row = await queryOne<any>('SELECT * FROM Slides WHERE id = ?', [id])
        return row ? mapSlide(row) : null
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
        const id = generateUUID()
        await execute(
            'INSERT INTO Slides (id, title, image, link, `order`, active) VALUES (?, ?, ?, ?, ?, ?)',
            [id, slide.title, slide.image, slide.link || null, slide.order || 0, slide.active !== false ? 1 : 0]
        )
        return await getSlideById(id)
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
        const updates: string[] = []
        const values: any[] = []

        if (slide.title !== undefined) { updates.push('title = ?'); values.push(slide.title) }
        if (slide.image !== undefined) { updates.push('image = ?'); values.push(slide.image) }
        if (slide.link !== undefined) { updates.push('link = ?'); values.push(slide.link) }
        if (slide.order !== undefined) { updates.push('`order` = ?'); values.push(slide.order) }
        if (slide.active !== undefined) { updates.push('active = ?'); values.push(slide.active ? 1 : 0) }

        if (updates.length === 0) return await getSlideById(id)

        values.push(id)
        await execute(`UPDATE Slides SET ${updates.join(', ')} WHERE id = ?`, values)
        return await getSlideById(id)
    } catch (error) {
        console.error('Error updating slide:', error)
        return null
    }
}

export async function deleteSlide(id: string): Promise<boolean> {
    try {
        const affected = await execute('DELETE FROM Slides WHERE id = ?', [id])
        return affected > 0
    } catch (error) {
        console.error('Error deleting slide:', error)
        return false
    }
}

export async function reorderSlides(slideOrders: { id: string; order: number }[]): Promise<boolean> {
    try {
        for (const { id, order } of slideOrders) {
            await execute('UPDATE Slides SET `order` = ? WHERE id = ?', [order, id])
        }
        return true
    } catch (error) {
        console.error('Error reordering slides:', error)
        return false
    }
}

// ============================================
// FEATURES OPERATIONS
// ============================================

function mapFeature(row: any): Feature {
    return {
        ...row,
        active: Boolean(row.active),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export async function getAllFeatures(): Promise<Feature[]> {
    try {
        const rows = await query<any>('SELECT * FROM Features ORDER BY `order` ASC')
        return rows.map(mapFeature)
    } catch (error) {
        console.error('Error fetching features:', error)
        return []
    }
}

export async function getActiveFeatures(): Promise<Feature[]> {
    try {
        const rows = await query<any>('SELECT * FROM Features WHERE active = 1 ORDER BY `order` ASC')
        return rows.map(mapFeature)
    } catch (error) {
        console.error('Error fetching features:', error)
        return []
    }
}

export async function getFeatureById(id: string): Promise<Feature | null> {
    try {
        const row = await queryOne<any>('SELECT * FROM Features WHERE id = ?', [id])
        return row ? mapFeature(row) : null
    } catch (error) {
        console.error('Error fetching feature:', error)
        return null
    }
}

export async function createFeature(
    feature: Omit<Feature, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Feature | null> {
    try {
        const id = generateUUID()
        await execute(
            'INSERT INTO Features (id, icon, title, description, `order`, active) VALUES (?, ?, ?, ?, ?, ?)',
            [id, feature.icon, feature.title, feature.description, feature.order || 0, feature.active ? 1 : 0]
        )
        return await getFeatureById(id)
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
        const updates: string[] = []
        const values: any[] = []

        if (feature.icon !== undefined) { updates.push('icon = ?'); values.push(feature.icon) }
        if (feature.title !== undefined) { updates.push('title = ?'); values.push(feature.title) }
        if (feature.description !== undefined) { updates.push('description = ?'); values.push(feature.description) }
        if (feature.order !== undefined) { updates.push('`order` = ?'); values.push(feature.order) }
        if (feature.active !== undefined) { updates.push('active = ?'); values.push(feature.active ? 1 : 0) }

        if (updates.length === 0) return await getFeatureById(id)

        values.push(id)
        await execute(`UPDATE Features SET ${updates.join(', ')} WHERE id = ?`, values)
        return await getFeatureById(id)
    } catch (error) {
        console.error('Error updating feature:', error)
        return null
    }
}

export async function deleteFeature(id: string): Promise<boolean> {
    try {
        const affected = await execute('DELETE FROM Features WHERE id = ?', [id])
        return affected > 0
    } catch (error) {
        console.error('Error deleting feature:', error)
        return false
    }
}

export async function reorderFeatures(featureOrders: { id: string; order: number }[]): Promise<boolean> {
    try {
        for (const { id, order } of featureOrders) {
            await execute('UPDATE Features SET `order` = ? WHERE id = ?', [order, id])
        }
        return true
    } catch (error) {
        console.error('Error reordering features:', error)
        return false
    }
}

// ============================================
// REASONS OPERATIONS
// ============================================

function mapReason(row: any): Reason {
    return {
        ...row,
        active: Boolean(row.active),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export async function getAllReasons(): Promise<Reason[]> {
    try {
        const rows = await query<any>('SELECT * FROM Reasons ORDER BY `order` ASC')
        return rows.map(mapReason)
    } catch (error) {
        console.error('Error fetching reasons:', error)
        return []
    }
}

export async function getActiveReasons(): Promise<Reason[]> {
    try {
        const rows = await query<any>('SELECT * FROM Reasons WHERE active = 1 ORDER BY `order` ASC')
        return rows.map(mapReason)
    } catch (error) {
        console.error('Error fetching reasons:', error)
        return []
    }
}

export async function getReasonById(id: string): Promise<Reason | null> {
    try {
        const row = await queryOne<any>('SELECT * FROM Reasons WHERE id = ?', [id])
        return row ? mapReason(row) : null
    } catch (error) {
        console.error('Error fetching reason:', error)
        return null
    }
}

export async function createReason(
    reason: Omit<Reason, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Reason | null> {
    try {
        const id = generateUUID()
        await execute(
            'INSERT INTO Reasons (id, icon, title, description, `order`, active) VALUES (?, ?, ?, ?, ?, ?)',
            [id, reason.icon, reason.title, reason.description, reason.order || 0, reason.active ? 1 : 0]
        )
        return await getReasonById(id)
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
        const updates: string[] = []
        const values: any[] = []

        if (reason.icon !== undefined) { updates.push('icon = ?'); values.push(reason.icon) }
        if (reason.title !== undefined) { updates.push('title = ?'); values.push(reason.title) }
        if (reason.description !== undefined) { updates.push('description = ?'); values.push(reason.description) }
        if (reason.order !== undefined) { updates.push('`order` = ?'); values.push(reason.order) }
        if (reason.active !== undefined) { updates.push('active = ?'); values.push(reason.active ? 1 : 0) }

        if (updates.length === 0) return await getReasonById(id)

        values.push(id)
        await execute(`UPDATE Reasons SET ${updates.join(', ')} WHERE id = ?`, values)
        return await getReasonById(id)
    } catch (error) {
        console.error('Error updating reason:', error)
        return null
    }
}

export async function deleteReason(id: string): Promise<boolean> {
    try {
        const affected = await execute('DELETE FROM Reasons WHERE id = ?', [id])
        return affected > 0
    } catch (error) {
        console.error('Error deleting reason:', error)
        return false
    }
}

export async function reorderReasons(reasonOrders: { id: string; order: number }[]): Promise<boolean> {
    try {
        for (const { id, order } of reasonOrders) {
            await execute('UPDATE Reasons SET `order` = ? WHERE id = ?', [order, id])
        }
        return true
    } catch (error) {
        console.error('Error reordering reasons:', error)
        return false
    }
}

// ============================================
// COLOR CONFIG OPERATIONS
// ============================================

export async function getAllColorConfigs(): Promise<ColorConfig[]> {
    try {
        return await query<ColorConfig>('SELECT * FROM ColorConfig ORDER BY `key` ASC')
    } catch (error) {
        console.error('Error fetching color configs:', error)
        return []
    }
}

export async function getColorConfigByKey(key: string): Promise<ColorConfig | null> {
    try {
        return await queryOne<ColorConfig>('SELECT * FROM ColorConfig WHERE `key` = ?', [key])
    } catch (error) {
        console.error('Error fetching color config:', error)
        return null
    }
}

export async function getColorConfigsByKeys(keys: string[]): Promise<Record<string, string>> {
    try {
        if (keys.length === 0) return {}
        const placeholders = keys.map(() => '?').join(', ')
        const rows = await query<ColorConfig>(`SELECT * FROM ColorConfig WHERE \`key\` IN (${placeholders})`, keys)
        return rows.reduce((acc, config) => {
            acc[config.key] = config.value
            return acc
        }, {} as Record<string, string>)
    } catch (error) {
        console.error('Error fetching color configs:', error)
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
        const id = generateUUID()
        await execute(
            'INSERT INTO ColorConfig (id, `key`, value, rgbValue, description) VALUES (?, ?, ?, ?, ?)',
            [id, config.key, config.value, config.rgbValue || null, config.description || null]
        )
        return await getColorConfigByKey(config.key)
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
        const updates: string[] = []
        const values: any[] = []

        if (config.value !== undefined) { updates.push('value = ?'); values.push(config.value) }
        if (config.rgbValue !== undefined) { updates.push('rgbValue = ?'); values.push(config.rgbValue) }
        if (config.description !== undefined) { updates.push('description = ?'); values.push(config.description) }

        if (updates.length === 0) return await getColorConfigByKey(key)

        values.push(key)
        await execute(`UPDATE ColorConfig SET ${updates.join(', ')} WHERE \`key\` = ?`, values)
        return await getColorConfigByKey(key)
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
        const existing = await getColorConfigByKey(config.key)
        if (existing) {
            return await updateColorConfig(config.key, {
                value: config.value,
                rgbValue: config.rgbValue,
                description: config.description,
            })
        }
        return await createColorConfig(config)
    } catch (error) {
        console.error('Error upserting color config:', error)
        return null
    }
}

export async function deleteColorConfig(key: string): Promise<boolean> {
    try {
        const affected = await execute('DELETE FROM ColorConfig WHERE `key` = ?', [key])
        return affected > 0
    } catch (error) {
        console.error('Error deleting color config:', error)
        return false
    }
}

// ============================================
// CONTACT OPERATIONS
// ============================================

export async function createContact(contact: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
}): Promise<Contact | null> {
    try {
        const id = generateUUID()
        await execute(
            'INSERT INTO Contact (id, name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
            [id, contact.name, contact.email, contact.phone || null, contact.subject, contact.message]
        )
        return await getContactById(id)
    } catch (error) {
        console.error('Error creating contact:', error)
        return null
    }
}

export async function getAllContacts(): Promise<Contact[]> {
    try {
        const rows = await query<any>('SELECT * FROM Contact ORDER BY createdAt DESC')
        return rows.map(row => ({ ...row, read: Boolean(row.read) }))
    } catch (error) {
        console.error('Error fetching contacts:', error)
        return []
    }
}

export async function getContactById(id: string): Promise<Contact | null> {
    try {
        const row = await queryOne<any>('SELECT * FROM Contact WHERE id = ?', [id])
        return row ? { ...row, read: Boolean(row.read) } : null
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
        if (updates.read !== undefined) {
            await execute('UPDATE Contact SET `read` = ? WHERE id = ?', [updates.read ? 1 : 0, id])
        }
        return await getContactById(id)
    } catch (error) {
        console.error('Error updating contact:', error)
        return null
    }
}

export async function deleteContact(id: string): Promise<boolean> {
    try {
        const affected = await execute('DELETE FROM Contact WHERE id = ?', [id])
        return affected > 0
    } catch (error) {
        console.error('Error deleting contact:', error)
        return false
    }
}

export async function getUnreadContactsCount(): Promise<number> {
    try {
        const result = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Contact WHERE `read` = 0')
        return result?.count || 0
    } catch (error) {
        console.error('Error counting unread contacts:', error)
        return 0
    }
}
