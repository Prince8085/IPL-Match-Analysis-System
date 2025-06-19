import { type NextRequest, NextResponse } from "next/server"
import { testVenueMatching } from "@/lib/data-fetching-test"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const venue = searchParams.get("venue")

    if (!venue) {
      return NextResponse.json(
        {
          success: false,
          message: "Venue parameter is required",
        },
        { status: 400 },
      )
    }

    const results = await testVenueMatching(venue)

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Error testing venue matching:", error)

    return NextResponse.json(
      {
        success: false,
        message: `Failed to test venue matching: ${error.message || String(error)}`,
      },
      { status: 500 },
    )
  }
}
