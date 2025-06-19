import { NextResponse } from "next/server"
import { fetchTeams, fetchVenues, fetchPlayers } from "@/lib/data-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") || "all"

    const result = {}

    if (action === "teams" || action === "all") {
      const teams = await fetchTeams()
      result.teams = {
        count: teams.length,
        data: teams,
      }
    }

    if (action === "venues" || action === "all") {
      const venues = await fetchVenues()
      result.venues = {
        count: venues.length,
        data: venues,
      }
    }

    if (action === "players" || action === "all") {
      const teamId = searchParams.get("teamId")
      const players = await fetchPlayers(teamId ? [teamId] : [])
      result.players = {
        count: players.length,
        data: players,
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
