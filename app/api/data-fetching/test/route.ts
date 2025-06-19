import { NextResponse } from "next/server"
import { runDataFetchingTests } from "@/lib/data-fetching-test"

export async function GET() {
  try {
    const results = await runDataFetchingTests()

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Error running data fetching tests:", error)

    return NextResponse.json(
      {
        success: false,
        message: `Failed to run data fetching tests: ${error.message || String(error)}`,
      },
      { status: 500 },
    )
  }
}
