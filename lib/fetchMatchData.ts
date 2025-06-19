import { sql } from "@/lib/db"
import { nanoid } from "nanoid"

// Function to fetch match data and ensure match exists in database
export async function fetchMatchData(team1Id, team2Id, venueName, matchDate = new Date()) {
  try {
    if (!sql) {
      return {
        team1Id,
        team2Id,
        venue: venueName,
        date: matchDate,
      }
    }

    // Get team data
    const teams = await sql`SELECT * FROM teams WHERE id IN (${team1Id}, ${team2Id})`
    const team1 = teams.find((t) => t.id === team1Id)
    const team2 = teams.find((t) => t.id === team2Id)

    if (!team1 || !team2) {
      throw new Error("Team data not found")
    }

    // Get venue data
    const venues = await sql`SELECT * FROM venues`
    let venue = venues.find((v) => v.name === venueName || v.id === venueName)

    // If venue not found by exact match, try case-insensitive match
    if (!venue) {
      venue = venues.find(
        (v) => v.name.toLowerCase() === venueName.toLowerCase() || v.id.toLowerCase() === venueName.toLowerCase(),
      )
    }

    // If still not found, try partial match
    if (!venue) {
      venue = venues.find(
        (v) =>
          v.name.toLowerCase().includes(venueName.toLowerCase()) ||
          venueName.toLowerCase().includes(v.name.toLowerCase()),
      )
    }

    // If still no match, create a default venue
    let venueId
    if (!venue) {
      venueId = `venue-${nanoid(8)}`
      // Insert new venue
      await sql`
        INSERT INTO venues (id, name, city, country)
        VALUES (${venueId}, ${venueName}, 'Unknown', 'India')
      `
    } else {
      venueId = venue.id
    }

    // Check if match already exists in database
    let matchId
    const existingMatch = await sql`
      SELECT * FROM matches 
      WHERE team1_id = ${team1Id} AND team2_id = ${team2Id} AND venue_id = ${venueId}
      LIMIT 1
    `

    if (existingMatch && existingMatch.length > 0) {
      matchId = existingMatch[0].id
    } else {
      // Create new match
      matchId = nanoid()
      await sql`
        INSERT INTO matches (
          id, team1_id, team2_id, venue_id, match_date, match_status,
          created_at, updated_at
        ) VALUES (
          ${matchId}, ${team1Id}, ${team2Id}, ${venueId}, ${matchDate}, 'upcoming',
          NOW(), NOW()
        )
      `
    }

    // Create a match data object
    return {
      id: matchId,
      team1Id,
      team2Id,
      venueId,
      venue: venueName,
      date: matchDate,
      team1,
      team2,
    }
  } catch (error) {
    console.error("Error in fetchMatchData:", error)

    // Return basic match data on error
    return {
      team1Id,
      team2Id,
      venue: venueName,
      date: matchDate || new Date(),
    }
  }
}
