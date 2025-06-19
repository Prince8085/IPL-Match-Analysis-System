import { NextResponse } from "next/server"
import { updateDataService } from "@/lib/update-data-service"

export async function POST() {
  try {
    const result = await updateDataService()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      return NextResponse.json({ success: false, message: result.message, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating data service:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update data service", error: String(error) },
      { status: 500 },
    )
  }
}
