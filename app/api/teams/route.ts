import { type NextRequest, NextResponse } from "next/server"
import { fetchTeams, createTeam, updateTeam, deleteTeam } from "@/lib/data-service"

export async function GET() {
  try {
    const teams = await fetchTeams()
    return NextResponse.json({ success: true, data: teams })
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch teams", error: String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, shortName, primaryColor, secondaryColor, logoUrl } = body

    if (!name || !shortName) {
      return NextResponse.json({ success: false, message: "Name and shortName are required" }, { status: 400 })
    }

    const newTeam = await createTeam({ name, shortName, primaryColor, secondaryColor, logoUrl })
    return NextResponse.json({ success: true, data: newTeam })
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create team", error: String(error) },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, shortName, primaryColor, secondaryColor, logoUrl } = body

    if (!id) {
      return NextResponse.json({ success: false, message: "Team ID is required" }, { status: 400 })
    }

    const updatedTeam = await updateTeam(id, { name, shortName, primaryColor, secondaryColor, logoUrl })
    return NextResponse.json({ success: true, data: updatedTeam })
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update team", error: String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, message: "Team ID is required" }, { status: 400 })
    }

    await deleteTeam(id)
    return NextResponse.json({ success: true, message: "Team deleted successfully" })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete team", error: String(error) },
      { status: 500 },
    )
  }
}
