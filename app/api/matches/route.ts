import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { nanoid } from "nanoid"
import * as schema from "@/lib/schema"

export async function POST(request: NextRequest) {
  try {
    const matchData = await request.json()

    if (!matchData.team1Id) {
      return NextResponse.json({ success: false, message: "Team 1 ID is required" }, { status: 400 })
    }

    if (!matchData.team2Id) {
      return NextResponse.json({ success: false, message: "Team 2 ID is required" }, { status: 400 })
    }

    if (!matchData.venueId) {
      return NextResponse.json({ success: false, message: "Venue ID is required" }, { status: 400 })
    }

    const matchId = matchData.id || nanoid()
    const matchDate = matchData.matchDate || new Date()

    // Insert the match record
    await sql`
      INSERT INTO matches (
        id, team1_id, team2_id, venue_id, match_date, match_status,
        created_at, updated_at
      ) VALUES (
        ${matchId}, ${matchData.team1Id}, ${matchData.team2Id}, ${matchData.venueId}, 
        ${matchDate}, ${matchData.matchStatus || "upcoming"},
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        team1_id = ${matchData.team1Id},
        team2_id = ${matchData.team2Id},
        venue_id = ${matchData.venueId},
        match_date = ${matchDate},
        match_status = ${matchData.matchStatus || "upcoming"},
        updated_at = NOW()
    `

    return NextResponse.json({
      success: true,
      message: "Match created successfully",
      data: { id: matchId },
    })
  } catch (error) {
    console.error("Error creating match:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create match",
        error: error.message || String(error),
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const team1Id = searchParams.get("team1Id")
    const team2Id = searchParams.get("team2Id")

    let query = `SELECT * FROM matches`
    const params = []

    if (team1Id || team2Id) {
      query += ` WHERE`

      if (team1Id) {
        query += ` team1_id = $1`
        params.push(team1Id)
      }

      if (team1Id && team2Id) {
        query += ` AND`
      }

      if (team2Id) {
        query += ` team2_id = ${team1Id ? "$2" : "$1"}`
        params.push(team2Id)
      }
    }

    query += ` ORDER BY match_date DESC`

    const matches = await sql.unsafe(query, params)

    return NextResponse.json({ success: true, data: matches })
  } catch (error) {
    console.error("Error fetching matches:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch matches",
        error: error.message || String(error),
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      team1Id,
      team2Id,
      venueId,
      matchDate,
      matchType,
      matchStatus,
      tossWinner,
      tossDecision,
      winner,
      margin,
      playerOfMatch,
    } = body

    if (!id) {
      return NextResponse.json({ success: false, message: "Match ID is required" }, { status: 400 })
    }

    await sql`
      UPDATE matches
      SET 
        team1_id = COALESCE(${team1Id}, team1_id),
        team2_id = COALESCE(${team2Id}, team2_id),
        venue_id = COALESCE(${venueId}, venue_id),
        match_date = COALESCE(${matchDate ? new Date(matchDate) : null}, match_date),
        match_type = COALESCE(${matchType}, match_type),
        match_status = COALESCE(${matchStatus}, match_status),
        toss_winner = COALESCE(${tossWinner}, toss_winner),
        toss_decision = COALESCE(${tossDecision}, toss_decision),
        winner = COALESCE(${winner}, winner),
        margin = COALESCE(${margin}, margin),
        player_of_match = COALESCE(${playerOfMatch}, player_of_match),
        updated_at = ${new Date()}
      WHERE id = ${id}
    `

    const updatedMatch = await sql`SELECT * FROM matches WHERE id = ${id}`

    if (!updatedMatch || updatedMatch.length === 0) {
      throw new Error("Match not found")
    }

    return NextResponse.json({ success: true, data: schema.matches.fromRow(updatedMatch[0]) })
  } catch (error) {
    console.error("Error updating match:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update match", error: String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, message: "Match ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM matches WHERE id = ${id}`
    return NextResponse.json({ success: true, message: "Match deleted successfully" })
  } catch (error) {
    console.error("Error deleting match:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete match", error: String(error) },
      { status: 500 },
    )
  }
}
