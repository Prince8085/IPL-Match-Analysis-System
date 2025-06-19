import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { tableExists, getTableRowCount } from "@/lib/db"

export async function GET() {
  try {
    console.log("Checking database status...")

    // Check if required tables exist
    const tables = ["teams", "players", "venues", "matches", "predictions"]
    const tableStatus = {}

    for (const table of tables) {
      const exists = await tableExists(table)
      const count = exists ? await getTableRowCount(table) : 0

      tableStatus[table] = {
        exists,
        count,
      }
    }

    // Check database connection
    const connectionTest = await sql`SELECT 1 as connected`
    const isConnected = connectionTest && connectionTest.length > 0 && connectionTest[0].connected === 1

    return NextResponse.json({
      success: true,
      connected: isConnected,
      tables: tableStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking database status:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error checking database status: ${error.message}`,
        error: String(error),
      },
      { status: 500 },
    )
  }
}
