import { NextResponse } from "next/server"
import { sql } from "@/lib/data-service"

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ success: false, message: "Database client not initialized" }, { status: 500 })
    }

    const issues = []
    let criticalIssues = 0

    // Check for orphaned predictions (predictions with no matching match_id)
    const orphanedPredictions = await sql`
      SELECT p.id, p.match_id 
      FROM predictions p 
      LEFT JOIN matches m ON p.match_id = m.id 
      WHERE m.id IS NULL
    `

    if (orphanedPredictions.length > 0) {
      issues.push({
        table: "predictions",
        issue: `Found ${orphanedPredictions.length} prediction(s) with invalid match_id references`,
        severity: "high",
        fixable: true,
        details: orphanedPredictions,
      })
      criticalIssues++
    }

    // Check for matches with invalid team references
    const matchesWithInvalidTeams = await sql`
      SELECT m.id, m.team1_id, m.team2_id 
      FROM matches m 
      LEFT JOIN teams t1 ON m.team1_id = t1.id 
      LEFT JOIN teams t2 ON m.team2_id = t2.id 
      WHERE t1.id IS NULL OR t2.id IS NULL
    `

    if (matchesWithInvalidTeams.length > 0) {
      issues.push({
        table: "matches",
        issue: `Found ${matchesWithInvalidTeams.length} match(es) with invalid team references`,
        severity: "high",
        fixable: false,
        details: matchesWithInvalidTeams,
      })
      criticalIssues++
    }

    // Check for matches with invalid venue references
    const matchesWithInvalidVenues = await sql`
      SELECT m.id, m.venue_id 
      FROM matches m 
      LEFT JOIN venues v ON m.venue_id = v.id 
      WHERE v.id IS NULL AND m.venue_id IS NOT NULL
    `

    if (matchesWithInvalidVenues.length > 0) {
      issues.push({
        table: "matches",
        issue: `Found ${matchesWithInvalidVenues.length} match(es) with invalid venue references`,
        severity: "medium",
        fixable: true,
        details: matchesWithInvalidVenues,
      })
      criticalIssues += matchesWithInvalidVenues.length > 0 ? 1 : 0
    }

    // Check for players with invalid team references
    const playersWithInvalidTeams = await sql`
      SELECT p.id, p.name, p.team_id 
      FROM players p 
      LEFT JOIN teams t ON p.team_id = t.id 
      WHERE t.id IS NULL AND p.team_id IS NOT NULL
    `

    if (playersWithInvalidTeams.length > 0) {
      issues.push({
        table: "players",
        issue: `Found ${playersWithInvalidTeams.length} player(s) with invalid team references`,
        severity: "medium",
        fixable: false,
        details: playersWithInvalidTeams,
      })
      criticalIssues += playersWithInvalidTeams.length > 0 ? 1 : 0
    }

    // Check for duplicate predictions for the same match
    const duplicatePredictions = await sql`
      SELECT match_id, COUNT(*) as count
      FROM predictions
      GROUP BY match_id
      HAVING COUNT(*) > 1
    `

    if (duplicatePredictions.length > 0) {
      issues.push({
        table: "predictions",
        issue: `Found ${duplicatePredictions.length} match(es) with duplicate prediction records`,
        severity: "medium",
        fixable: true,
        details: duplicatePredictions,
      })
      criticalIssues += duplicatePredictions.length > 0 ? 1 : 0
    }

    return NextResponse.json({
      success: true,
      issues,
      criticalIssues,
      message:
        issues.length > 0
          ? `Found ${issues.length} issue(s) (${criticalIssues} critical)`
          : "No integrity issues found",
    })
  } catch (error) {
    console.error("Error checking database integrity:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error checking database integrity: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
