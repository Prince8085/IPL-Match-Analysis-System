import { NextResponse } from "next/server"
import { sql } from "@/lib/data-service"
import { nanoid } from "nanoid"

export async function POST() {
  try {
    if (!sql) {
      return NextResponse.json({ success: false, message: "Database client not initialized" }, { status: 500 })
    }

    const fixedIssues = []
    let totalFixed = 0

    // Fix orphaned predictions by creating placeholder matches
    const orphanedPredictions = await sql`
      SELECT p.id, p.match_id 
      FROM predictions p 
      LEFT JOIN matches m ON p.match_id = m.id 
      WHERE m.id IS NULL
    `

    if (orphanedPredictions.length > 0) {
      // Get default teams for placeholder matches
      const defaultTeams = await sql`SELECT id FROM teams LIMIT 2`

      if (defaultTeams.length >= 2) {
        const team1Id = defaultTeams[0].id
        const team2Id = defaultTeams[1].id

        // Get default venue
        const defaultVenues = await sql`SELECT id FROM venues LIMIT 1`
        const venueId = defaultVenues.length > 0 ? defaultVenues[0].id : nanoid()

        // If no venue exists, create a placeholder venue
        if (defaultVenues.length === 0) {
          await sql`
            INSERT INTO venues (id, name, city, country, created_at, updated_at)
            VALUES (${venueId}, 'Placeholder Venue', 'Unknown', 'Unknown', NOW(), NOW())
          `
          fixedIssues.push(`Created placeholder venue with ID: ${venueId}`)
        }

        // Create placeholder matches for each orphaned prediction
        for (const prediction of orphanedPredictions) {
          await sql`
            INSERT INTO matches (
              id, team1_id, team2_id, venue_id, match_date, match_status, created_at, updated_at
            ) VALUES (
              ${prediction.match_id}, ${team1Id}, ${team2Id}, ${venueId}, NOW(), 'placeholder', NOW(), NOW()
            )
          `
          totalFixed++
        }

        fixedIssues.push(`Fixed ${orphanedPredictions.length} orphaned prediction(s) by creating placeholder matches`)
      } else {
        fixedIssues.push(`Could not fix orphaned predictions: Need at least 2 teams in the database`)
      }
    }

    // Fix matches with invalid venue references
    const matchesWithInvalidVenues = await sql`
      SELECT m.id, m.venue_id 
      FROM matches m 
      LEFT JOIN venues v ON m.venue_id = v.id 
      WHERE v.id IS NULL AND m.venue_id IS NOT NULL
    `

    if (matchesWithInvalidVenues.length > 0) {
      // Get default venue or create one
      const defaultVenues = await sql`SELECT id FROM venues LIMIT 1`
      let venueId

      if (defaultVenues.length > 0) {
        venueId = defaultVenues[0].id
      } else {
        venueId = nanoid()
        await sql`
          INSERT INTO venues (id, name, city, country, created_at, updated_at)
          VALUES (${venueId}, 'Placeholder Venue', 'Unknown', 'Unknown', NOW(), NOW())
        `
        fixedIssues.push(`Created placeholder venue with ID: ${venueId}`)
      }

      // Update matches with invalid venue references
      for (const match of matchesWithInvalidVenues) {
        await sql`
          UPDATE matches 
          SET venue_id = ${venueId}, updated_at = NOW() 
          WHERE id = ${match.id}
        `
        totalFixed++
      }

      fixedIssues.push(`Fixed ${matchesWithInvalidVenues.length} match(es) with invalid venue references`)
    }

    // Fix duplicate predictions for the same match
    const duplicatePredictions = await sql`
      SELECT match_id, array_agg(id) as prediction_ids
      FROM predictions
      GROUP BY match_id
      HAVING COUNT(*) > 1
    `

    if (duplicatePredictions.length > 0) {
      for (const duplicate of duplicatePredictions) {
        // Keep the first prediction and delete the rest
        const predictionIds = duplicate.prediction_ids
        const keepId = predictionIds[0]
        const deleteIds = predictionIds.slice(1)

        await sql`DELETE FROM predictions WHERE id = ANY(${deleteIds})`

        totalFixed += deleteIds.length
      }

      fixedIssues.push(`Fixed ${duplicatePredictions.length} match(es) with duplicate prediction records`)
    }

    return NextResponse.json({
      success: true,
      fixedIssues,
      totalFixed,
      message: totalFixed > 0 ? `Successfully fixed ${totalFixed} integrity issue(s)` : "No issues were fixed",
    })
  } catch (error) {
    console.error("Error fixing database integrity issues:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error fixing database integrity issues: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
