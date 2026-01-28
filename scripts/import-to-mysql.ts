/**
 * Import Data to MySQL Script
 * 
 * Usage: npx ts-node scripts/import-to-mysql.ts
 * 
 * Imports data from Supabase export (JSON files) to MySQL.
 * Run AFTER: scripts/export-supabase-data.ts
 */

import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
config({ path: '.env.local' })
config({ path: '.env' })

import { execute, closePool } from '../lib/mysql'

const EXPORT_DIR = './supabase/csv'

interface ImportConfig {
    table: string
    columns: string[]
    mapRow: (row: any) => any[]
}

const IMPORT_CONFIGS: ImportConfig[] = [
    {
        table: 'User',
        columns: ['id', 'email', 'name', 'password', 'image', 'role', 'emailVerified', 'createdAt', 'updatedAt'],
        mapRow: (row) => [
            row.id, row.email, row.name, row.password, row.image, row.role,
            row.emailVerified ? new Date(row.emailVerified) : null,
            new Date(row.createdAt), new Date(row.updatedAt)
        ]
    },
    {
        table: 'Post',
        columns: ['id', 'title', 'slug', 'content', 'excerpt', 'coverImage', 'published', 'authorId', 'createdAt', 'updatedAt', 'publishedAt'],
        mapRow: (row) => [
            row.id, row.title, row.slug, row.content, row.excerpt, row.coverImage,
            row.published ? 1 : 0, row.authorId,
            new Date(row.createdAt), new Date(row.updatedAt),
            row.publishedAt ? new Date(row.publishedAt) : null
        ]
    },
    {
        table: 'SiteInfo',
        columns: ['id', 'siteUrl', 'title', 'name', 'logo', 'description', 'keywords', 'bannerTitle', 'bannerDescription', 
                  'featuresTitle', 'featuresDescription', 'reasonsTitle', 'reasonsDescription', 'author', 'email', 'phone',
                  'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'address', 'contact', 
                  'ogImage', 'ogType', 'twitterCard', 'updatedAt', 'updatedBy'],
        mapRow: (row) => [
            row.id, row.siteUrl, row.title, row.name, row.logo, row.description, row.keywords,
            row.bannerTitle, row.bannerDescription, row.featuresTitle, row.featuresDescription,
            row.reasonsTitle, row.reasonsDescription, row.author, row.email, row.phone,
            row.facebook, row.instagram, row.twitter, row.linkedin, row.youtube, row.tiktok,
            row.address, row.contact, row.ogImage, row.ogType, row.twitterCard,
            new Date(row.updatedAt), row.updatedBy
        ]
    },
    {
        table: 'Slides',
        columns: ['id', 'title', 'image', 'link', '`order`', 'active', 'created_at', 'updated_at'],
        mapRow: (row) => [
            row.id, row.title, row.image, row.link, row.order,
            row.active ? 1 : 0,
            row.created_at ? new Date(row.created_at) : new Date(),
            row.updated_at ? new Date(row.updated_at) : new Date()
        ]
    },
    {
        table: 'Features',
        columns: ['id', 'icon', 'title', 'description', '`order`', 'active', 'created_at', 'updated_at'],
        mapRow: (row) => [
            row.id, row.icon, row.title, row.description, row.order,
            row.active ? 1 : 0,
            row.created_at ? new Date(row.created_at) : new Date(),
            row.updated_at ? new Date(row.updated_at) : new Date()
        ]
    },
    {
        table: 'Reasons',
        columns: ['id', 'icon', 'title', 'description', '`order`', 'active', 'created_at', 'updated_at'],
        mapRow: (row) => [
            row.id, row.icon, row.title, row.description, row.order,
            row.active ? 1 : 0,
            row.created_at ? new Date(row.created_at) : new Date(),
            row.updated_at ? new Date(row.updated_at) : new Date()
        ]
    },
    {
        table: 'ColorConfig',
        columns: ['id', '`key`', 'value', 'rgbValue', 'description', 'createdAt', 'updatedAt'],
        mapRow: (row) => [
            row.id, row.key, row.value, row.rgbValue, row.description,
            row.createdAt ? new Date(row.createdAt) : new Date(),
            row.updatedAt ? new Date(row.updatedAt) : new Date()
        ]
    },
    {
        table: 'Contact',
        columns: ['id', 'name', 'email', 'phone', 'subject', 'message', '`read`', 'createdAt', 'updatedAt'],
        mapRow: (row) => [
            row.id, row.name, row.email, row.phone, row.subject, row.message,
            row.read ? 1 : 0,
            row.createdAt ? new Date(row.createdAt) : new Date(),
            row.updatedAt ? new Date(row.updatedAt) : new Date()
        ]
    },
]

async function importTable(config: ImportConfig): Promise<number> {
    const filePath = path.join(EXPORT_DIR, `${config.table}.json`)
    
    if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️ File not found: ${filePath}`)
        return 0
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as any[]
    
    if (data.length === 0) {
        console.log(`   📭 No data to import`)
        return 0
    }

    console.log(`   📦 Importing ${data.length} rows...`)

    let imported = 0
    for (const row of data) {
        try {
            const values = config.mapRow(row)
            const placeholders = values.map(() => '?').join(', ')
            const sql = `INSERT INTO ${config.table} (${config.columns.join(', ')}) VALUES (${placeholders})`
            
            await execute(sql, values)
            imported++
        } catch (error: any) {
            // Skip duplicates
            if (!error.message.includes('Duplicate')) {
                console.error(`   ❌ Error importing row:`, error.message)
            }
        }
    }

    console.log(`   ✅ Imported ${imported}/${data.length} rows`)
    return imported
}

async function main() {
    console.log('🚀 Starting MySQL Data Import\n')
    console.log(`📁 Reading from: ${EXPORT_DIR}\n`)

    let totalImported = 0

    // Import tables in order (Users first for foreign keys)
    for (const config of IMPORT_CONFIGS) {
        console.log(`\n📊 ${config.table}:`)
        try {
            const count = await importTable(config)
            totalImported += count
        } catch (error: any) {
            console.error(`   ❌ Failed: ${error.message}`)
        }
    }

    await closePool()

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Import Complete!`)
    console.log(`   Total rows imported: ${totalImported}`)
    console.log('='.repeat(50))

    console.log('\n📋 Next Steps:')
    console.log('1. Verify data: mysql -u user -p -e "SELECT COUNT(*) FROM User" database')
    console.log('2. Test the application: npm run dev')
    console.log('3. Login with your admin credentials')
}

main().catch(console.error)
