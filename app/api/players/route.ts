import { type NextRequest, NextResponse } from "next/server"
import { fetchPlayers, createPlayer, updatePlayer, deletePlayer } from "@/lib/data-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamIds = searchParams.get("teamIds")

    let players
    if (teamIds) {
      players = await fetchPlayers(teamIds.split(","))
    } else {
      players = await fetchPlayers()
    }

    return NextResponse.json({ success: true, data: players })
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch players", error: String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, teamId, role, battingStyle, bowlingStyle, nationality, formRating, matchImpact, keyStat } = body

    if (!name || !role) {
      return NextResponse.json({ success: false, message: "Name and role are required" }, { status: 400 })
    }

    const newPlayer = await createPlayer({
      name,
      teamId,
      role,
      battingStyle,
      bowlingStyle,
      nationality,
      formRating,
      matchImpact,
      keyStat,
    })

    return NextResponse.json({ success: true, data: newPlayer })
  } catch (error) {
    console.error("Error creating player:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create player", error: String(error) },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, teamId, role, battingStyle, bowlingStyle, nationality, formRating, matchImpact, keyStat } = body

    if (!id) {
      return NextResponse.json({ success: false, message: "Player ID is required" }, { status: 400 })
    }

    const updatedPlayer = await updatePlayer(id, {
      name,
      teamId,
      role,
      battingStyle,
      bowlingStyle,
      nationality,
      formRating,
      matchImpact,
      keyStat,
    })

    return NextResponse.json({ success: true, data: updatedPlayer })
  } catch (error) {
    console.error("Error updating player:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update player", error: String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, message: "Player ID is required" }, { status: 400 })
    }

    await deletePlayer(id)
    return NextResponse.json({ success: true, message: "Player deleted successfully" })
  } catch (error) {
    console.error("Error deleting player:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete player", error: String(error) },
      { status: 500 },
    )
  }
}
