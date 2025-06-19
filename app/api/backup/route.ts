import { type NextRequest, NextResponse } from "next/server"
import { backupDatabase, restoreDatabase } from "@/lib/data-service"

export async function GET() {
  try {
    const backup = await backupDatabase()
    return NextResponse.json({ success: true, data: backup })
  } catch (error) {
    console.error("Error creating database backup:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create database backup", error: String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const backup = await request.json()

    if (!backup || !backup.teams || !backup.timestamp) {
      return NextResponse.json({ success: false, message: "Invalid backup data" }, { status: 400 })
    }

    const result = await restoreDatabase(backup)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error restoring database:", error)
    return NextResponse.json(
      { success: false, message: "Failed to restore database", error: String(error) },
      { status: 500 },
    )
  }
}
