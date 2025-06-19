import { type NextRequest, NextResponse } from "next/server"
import { saveAnalysis, getSavedAnalyses, deleteSavedAnalysis } from "@/lib/data-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    const analyses = await getSavedAnalyses(userId)
    return NextResponse.json({ success: true, data: analyses })
  } catch (error) {
    console.error("Error fetching saved analyses:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch saved analyses", error: String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, matchId, predictionData } = body

    if (!userId || !name || !matchId || !predictionData) {
      return NextResponse.json(
        { success: false, message: "User ID, name, match ID, and prediction data are required" },
        { status: 400 },
      )
    }

    const savedAnalysis = await saveAnalysis(userId, name, matchId, predictionData)
    return NextResponse.json({ success: true, data: savedAnalysis })
  } catch (error) {
    console.error("Error saving analysis:", error)
    return NextResponse.json(
      { success: false, message: "Failed to save analysis", error: String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (!id || !userId) {
      return NextResponse.json({ success: false, message: "Analysis ID and User ID are required" }, { status: 400 })
    }

    await deleteSavedAnalysis(id, userId)
    return NextResponse.json({ success: true, message: "Analysis deleted successfully" })
  } catch (error) {
    console.error("Error deleting saved analysis:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete saved analysis", error: String(error) },
      { status: 500 },
    )
  }
}
