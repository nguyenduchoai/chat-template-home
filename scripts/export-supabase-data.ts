/**
 * Export Data from Supabase Script
 * 
 * Usage: npx ts-node scripts/export-supabase-data.ts
 * 
 * Exports all data from Supabase to JSON files for migration to MySQL.
 * 
 * IMPORTANT: Run this BEFORE switching to MySQL to preserve your data.
 */

import { config } from 'dotenv'

// Load environment variables FIRST
config({ path: '.env.local' })
config({ path: '.env' })

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const EXPORT_DIR = './supabase/csv'

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!')
    console.error('   Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Tables to export
const TABLES = [
    'User',
    'Post',
    'SiteInfo',
    'Slides',
    'Features',
    'Reasons',
    'ColorConfig',
    'Contact',
]

async function exportTable(tableName: string): Promise<any[]> {
    console.log(`📦 Exporting ${tableName}...`)

    const { data, error } = await supabase
        .from(tableName)
        .select('*')

    if (error) {
        console.error(`   ❌ Error exporting ${tableName}:`, error.message)
        return []
    }

    console.log(`   ✅ Exported ${data?.length || 0} rows`)
    return data || []
}

async function main() {
    console.log('🚀 Starting Supabase Data Export\n')
    console.log(`📁 Export directory: ${EXPORT_DIR}\n`)

    // Create export directory
    if (!fs.existsSync(EXPORT_DIR)) {
        fs.mkdirSync(EXPORT_DIR, { recursive: true })
    }

    const allData: Record<string, any[]> = {}
    let totalRows = 0

    // Export each table
    for (const table of TABLES) {
        try {
            const data = await exportTable(table)
            allData[table] = data
            totalRows += data.length

            // Save individual table JSON
            const filePath = path.join(EXPORT_DIR, `${table}.json`)
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
        } catch (error: any) {
            console.error(`   ⚠️ Skipping ${table}: ${error.message}`)
            allData[table] = []
        }
    }

    // Save combined export
    const combinedPath = path.join(EXPORT_DIR, 'all_data.json')
    fs.writeFileSync(combinedPath, JSON.stringify(allData, null, 2))

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Export Complete!`)
    console.log(`   Total tables: ${TABLES.length}`)
    console.log(`   Total rows: ${totalRows}`)
    console.log(`   Files saved to: ${EXPORT_DIR}/`)
    console.log('='.repeat(50))

    console.log('\n📋 Next Steps:')
    console.log('1. Setup MySQL database: mysql -u root -p')
    console.log('2. Run schema: mysql -u user -p database < mysql/schema.sql')
    console.log('3. Import data: npx ts-node scripts/import-to-mysql.ts')
}

main().catch(console.error)
