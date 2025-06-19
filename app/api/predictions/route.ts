import { type NextRequest, NextResponse } from "next/server"
import { generatePrediction } from "@/lib/data-service"

export async function POST(request: NextRequest) {
  try {
    console.log("Received prediction request")
    const matchData = await request.json()
    console.log("Match data received:", matchData)

    if (!matchData.team1Id && !matchData.team1_id) {
      return NextResponse.json({ success: false, message: "Team 1 ID is required" }, { status: 400 })
    }

    if (!matchData.team2Id && !matchData.team2_id) {
      return NextResponse.json({ success: false, message: "Team 2 ID is required" }, { status: 400 })
    }

    if (!matchData.venueId && !matchData.venue_id && !matchData.venue && !matchData.venue_name) {
      return NextResponse.json({ success: false, message: "Venue information is required" }, { status: 400 })
    }

    console.log("Generating predictions...")
    const predictions = await generatePrediction(matchData)
    console.log("Predictions generated successfully")

    return NextResponse.json({ success: true, data: predictions })
  } catch (error) {
    console.error("Error generating predictions:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate predictions",
        error: error.message || String(error),
      },
      { status: 500 },
    )
  }
}
