import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Get the database URL from environment variables with fallback options
const getDatabaseUrl = () => {
  // Try multiple environment variable options
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL

  if (!dbUrl) {
    console.error("No database URL found in environment variables")
    console.error("Please ensure one of these is set: DATABASE_URL, POSTGRES_URL, or NEON_DATABASE_URL")

    // In development, provide more helpful error
    if (process.env.NODE_ENV === "development") {
      throw new Error(
        "Database connection failed: No database URL found in environment variables. " +
          "Please check your .env file and ensure DATABASE_URL is properly set.",
      )
    } else {
      // In production, use a more generic error
      throw new Error("Database connection failed: Configuration error")
    }
  }

  return dbUrl
}

// Initialize Neon SQL instance with proper error handling and connection timeout
const createSqlClient = () => {
  try {
    const dbUrl = getDatabaseUrl()
    // Add connection timeout parameter if not already present
    const urlWithTimeout = dbUrl.includes("connect_timeout=")
      ? dbUrl
      : `${dbUrl}${dbUrl.includes("?") ? "&" : "?"}connect_timeout=15`

    return neon(urlWithTimeout)
  } catch (error) {
    console.error("Failed to initialize database connection:", error)
    // Rethrow to prevent app from starting with broken DB connection
    throw error
  }
}

// Initialize the SQL client
export const sql = createSqlClient()

// Initialize drizzle with the Neon client
export const db = drizzle(sql)

// Export a function to test the database connection
export const testConnection = async () => {
  try {
    // Simple query to test connection
    const result = await sql`SELECT 1 as connected`
    return { success: true, message: "Database connection successful" }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Helper function to check if a table exists
export const tableExists = async (tableName: string) => {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    `
    return result[0]?.exists || false
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

// Helper function to get table row count
export const getTableRowCount = async (tableName: string) => {
  try {
    if (!(await tableExists(tableName))) {
      return 0
    }

    const result = await sql.unsafe(`SELECT COUNT(*) FROM ${tableName}`)
    return Number.parseInt(result[0]?.count || "0", 10)
  } catch (error) {
    console.error(`Error getting row count for table ${tableName}:`, error)
    return 0
  }
}
