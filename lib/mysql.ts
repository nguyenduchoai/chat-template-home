/**
 * MySQL Database Connection Pool
 * Uses mysql2 with connection pooling for optimal performance
 */

import mysql from 'mysql2/promise'

// Connection pool configuration
const poolConfig: mysql.PoolOptions = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chat_template',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Timezone and encoding
    timezone: '+00:00',
    charset: 'utf8mb4',
    // Date handling
    dateStrings: false,
}

// Create connection pool (singleton)
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
    if (!pool) {
        // Validate required environment variables
        if (!process.env.DB_HOST && !process.env.DB_USER) {
            console.warn('MySQL: Using default connection settings. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME for production.')
        }
        pool = mysql.createPool(poolConfig)
    }
    return pool
}

/**
 * Execute a query with prepared statement
 * @param sql SQL query with ? placeholders
 * @param params Array of parameters
 * @returns Query results
 */
export async function query<T = any>(
    sql: string,
    params: any[] = []
): Promise<T[]> {
    const connection = getPool()
    try {
        const [rows] = await connection.execute(sql, params)
        return rows as T[]
    } catch (error) {
        console.error('MySQL Query Error:', error)
        throw error
    }
}

/**
 * Execute a query and return the first row
 */
export async function queryOne<T = any>(
    sql: string,
    params: any[] = []
): Promise<T | null> {
    const rows = await query<T>(sql, params)
    return rows[0] || null
}

/**
 * Execute an INSERT and return the inserted ID
 */
export async function insert(
    sql: string,
    params: any[] = []
): Promise<number | string> {
    const connection = getPool()
    const [result] = await connection.execute(sql, params) as any
    return result.insertId
}

/**
 * Execute an UPDATE/DELETE and return affected rows
 */
export async function execute(
    sql: string,
    params: any[] = []
): Promise<number> {
    const connection = getPool()
    const [result] = await connection.execute(sql, params) as any
    return result.affectedRows
}

/**
 * Run a transaction with multiple queries
 */
export async function transaction<T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
    const connection = await getPool().getConnection()
    try {
        await connection.beginTransaction()
        const result = await callback(connection)
        await connection.commit()
        return result
    } catch (error) {
        await connection.rollback()
        throw error
    } finally {
        connection.release()
    }
}

/**
 * Close the connection pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
    if (pool) {
        await pool.end()
        pool = null
    }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
    try {
        await query('SELECT 1')
        return true
    } catch (error) {
        console.error('MySQL Connection Test Failed:', error)
        return false
    }
}

// Generate UUID v4
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

export default {
    getPool,
    query,
    queryOne,
    insert,
    execute,
    transaction,
    closePool,
    testConnection,
    generateUUID,
}
