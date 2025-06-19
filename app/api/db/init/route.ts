import { NextResponse } from "next/server"
import { createAllTables } from "@/lib/schema"
import { seedDatabase } from "@/lib/seed-data"

export async function GET() {
  try {
    console.log("Starting database initialization...")

    // Create all tables
    const tablesResult = await createAllTables()

    if (!tablesResult.success) {
      return NextResponse.json({ success: false, message: tablesResult.message }, { status: 500 })
    }

    // Seed the database with initial data
    const seedResult = await seedDatabase()

    if (!seedResult.success) {
      return NextResponse.json({ success: false, message: seedResult.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized and seeded successfully",
    })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      { success: false, message: `Database initialization failed: ${error.message}` },
      { status: 500 },
    )
  }
}
