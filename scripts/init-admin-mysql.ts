/**
 * Initialize Admin User Script
 * 
 * Usage: npx ts-node scripts/init-admin-mysql.ts
 * 
 * Creates the initial superadmin user in MySQL database.
 * Reads credentials from environment variables:
 * - ADMIN_EMAIL (default: admin@example.com)
 * - ADMIN_PASSWORD (default: admin123)
 */

import { config } from 'dotenv'
import bcrypt from 'bcryptjs'

// Load environment variables
config({ path: '.env.local' })
config({ path: '.env' })

import { query, queryOne, execute, generateUUID, closePool } from '../lib/mysql'

async function initAdmin() {
    console.log('🔧 Initializing MySQL database...\n')

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    console.log(`📧 Admin Email: ${adminEmail}`)
    console.log(`🔑 Admin Password: ${adminPassword.substring(0, 3)}***\n`)

    try {
        // Check if admin already exists
        const existingUser = await queryOne<any>(
            'SELECT id, email, role FROM `User` WHERE email = ?',
            [adminEmail]
        )

        if (existingUser) {
            console.log(`⚠️  User already exists: ${existingUser.email} (${existingUser.role})`)
            
            // Update to superadmin if not already
            if (existingUser.role !== 'superadmin') {
                await execute(
                    'UPDATE `User` SET role = ?, password = ? WHERE id = ?',
                    ['superadmin', await bcrypt.hash(adminPassword, 10), existingUser.id]
                )
                console.log(`✅ Updated ${existingUser.email} to superadmin role`)
            } else {
                // Update password
                await execute(
                    'UPDATE `User` SET password = ? WHERE id = ?',
                    [await bcrypt.hash(adminPassword, 10), existingUser.id]
                )
                console.log(`✅ Password updated for ${existingUser.email}`)
            }
        } else {
            // Create new admin user
            const userId = generateUUID()
            const hashedPassword = await bcrypt.hash(adminPassword, 10)

            await execute(
                `INSERT INTO \`User\` (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)`,
                [userId, adminEmail, 'Administrator', hashedPassword, 'superadmin']
            )

            console.log(`✅ Created superadmin user: ${adminEmail}`)
            console.log(`   ID: ${userId}`)
        }

        // Also initialize default SiteInfo if not exists
        const siteInfo = await queryOne('SELECT id FROM SiteInfo LIMIT 1')
        if (!siteInfo) {
            const siteId = generateUUID()
            await execute(
                `INSERT INTO SiteInfo (id, siteUrl, title, name, description) VALUES (?, ?, ?, ?, ?)`,
                [siteId, 'http://localhost:3000', 'AI Platform', 'Chat Template', 'AI-powered chat and blog platform']
            )
            console.log(`✅ Created default SiteInfo`)
        }

        console.log('\n🎉 Initialization complete!')
        console.log('\nYou can now login with:')
        console.log(`   Email: ${adminEmail}`)
        console.log(`   Password: ${adminPassword}`)

    } catch (error: any) {
        console.error('\n❌ Error:', error.message)
        console.error('\nTroubleshooting:')
        console.error('1. Make sure MySQL is running')
        console.error('2. Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env')
        console.error('3. Run the schema first: mysql -u user -p database < mysql/schema.sql')
        process.exit(1)
    } finally {
        await closePool()
    }
}

initAdmin()
