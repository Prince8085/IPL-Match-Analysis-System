import { type NextRequest, NextResponse } from "next/server"
import { fetchVenues, sql } from "@/lib/data-service"
import { nanoid } from "nanoid"

export async function GET() {
  try {
    const venues = await fetchVenues()
    return NextResponse.json({ success: true, data: venues })
  } catch (error) {
    console.error("Error fetching venues:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch venues", error: String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      city,
      country,
      capacity,
      pitchType,
      avgFirstInningsScore,
      avgSecondInningsScore,
      battingFirstWinPercentage,
      chasingWinPercentage,
    } = body

    if (!name || !city) {
      return NextResponse.json({ success: false, message: "Name and city are required" }, { status: 400 })
    }

    const id = nanoid()

    await sql`
      INSERT INTO venues (
        id, name, city, country, capacity, pitch_type, 
        avg_first_innings_score, avg_second_innings_score, 
        batting_first_win_percentage, chasing_win_percentage
      )
      VALUES (
        ${id}, ${name}, ${city}, ${country || "India"}, ${capacity}, ${pitchType}, 
        ${avgFirstInningsScore}, ${avgSecondInningsScore}, 
        ${battingFirstWinPercentage}, ${chasingWinPercentage}
      )
    `

    return NextResponse.json({
      success: true,
      data: {
        id,
        name,
        city,
        country: country || "India",
        capacity,
        pitchType,
        avgFirstInningsScore,
        avgSecondInningsScore,
        battingFirstWinPercentage,
        chasingWinPercentage,
      },
    })
  } catch (error) {
    console.error("Error creating venue:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create venue", error: String(error) },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      name,
      city,
      country,
      capacity,
      pitchType,
      avgFirstInningsScore,
      avgSecondInningsScore,
      battingFirstWinPercentage,
      chasingWinPercentage,
    } = body

    if (!id) {
      return NextResponse.json({ success: false, message: "Venue ID is required" }, { status: 400 })
    }

    await sql`
      UPDATE venues
      SET 
        name = COALESCE(${name}, name),
        city = COALESCE(${city}, city),
        country = COALESCE(${country}, country),
        capacity = COALESCE(${capacity}, capacity),
        pitch_type = COALESCE(${pitchType}, pitch_type),
        avg_first_innings_score = COALESCE(${avgFirstInningsScore}, avg_first_innings_score),
        avg_second_innings_score = COALESCE(${avgSecondInningsScore}, avg_second_innings_score),
        batting_first_win_percentage = COALESCE(${battingFirstWinPercentage}, batting_first_win_percentage),
        chasing_win_percentage = COALESCE(${chasingWinPercentage}, chasing_win_percentage),
        updated_at = ${new Date()}
      WHERE id = ${id}
    `

    const updatedVenue = await sql`SELECT * FROM venues WHERE id = ${id}`

    if (!updatedVenue || updatedVenue.length === 0) {
      throw new Error("Venue not found")
    }

    return NextResponse.json({ success: true, data: updatedVenue[0] })
  } catch (error) {
    console.error("Error updating venue:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update venue", error: String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, message: "Venue ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM venues WHERE id = ${id}`
    return NextResponse.json({ success: true, message: "Venue deleted successfully" })
  } catch (error) {
    console.error("Error deleting venue:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete venue", error: String(error) },
      { status: 500 },
    )
  }
}
