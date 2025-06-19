import { sql } from "@/lib/data-service"
import { nanoid } from "nanoid"
import { findOrCreateVenue } from "./venue-service"

// Function to find or create a match
export async function findOrCreateMatch(
  team1Id: string,
  team2Id: string,
  venueName: string,
  matchDate: Date = new Date(),
) {
  try {
    if (!sql) {
      throw new Error("Database client not initialized")
    }

    console.log(`Finding or creating match: ${team1Id} vs ${team2Id} at ${venueName}`)

    // First, ensure the venue exists
    const venue = await findOrCreateVenue(venueName)
    console.log(`Using venue: ${venue.name} (${venue.id})${venue.isNew ? " - newly created" : ""}`)

    // Check if match already exists
    const existingMatch = await sql`
      SELECT * FROM matches 
      WHERE team1_id = ${team1Id} AND team2_id = ${team2Id} AND venue_id = ${venue.id}
      ORDER BY match_date DESC
      LIMIT 1
    `

    if (existingMatch && existingMatch.length > 0) {
      console.log(`Found existing match: ${existingMatch[0].id}`)
      return {
        id: existingMatch[0].id,
        team1Id,
        team2Id,
        venueId: venue.id,
        venueName: venue.name,
        date: existingMatch[0].match_date || matchDate,
        isNew: false,
      }
    }

    // Create new match
    const matchId = nanoid()
    console.log(`Creating new match with ID: ${matchId}`)

    await sql`
      INSERT INTO matches (
        id, team1_id, team2_id, venue_id, match_date, match_status,
        created_at, updated_at
      ) VALUES (
        ${matchId}, ${team1Id}, ${team2Id}, ${venue.id}, ${matchDate}, 'upcoming',
        NOW(), NOW()
      )
    `

    return {
      id: matchId,
      team1Id,
      team2Id,
      venueId: venue.id,
      venueName: venue.name,
      date: matchDate,
      isNew: true,
    }
  } catch (error) {
    console.error("Error in findOrCreateMatch:", error)
    throw error
  }
}

// Function to get match by ID
export async function getMatchById(id: string) {
  try {
    if (!sql) {
      return null
    }

    const match = await sql`
      SELECT m.*, 
        t1.name as team1_name, t1.short_name as team1_short_name,
        t2.name as team2_name, t2.short_name as team2_short_name,
        v.name as venue_name, v.city as venue_city
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN venues v ON m.venue_id = v.id
      WHERE m.id = ${id}
      LIMIT 1
    `

    return match && match.length > 0 ? match[0] : null
  } catch (error) {
    console.error(`Error getting match by ID ${id}:`, error)
    return null
  }
}

// Function to get recent matches
export async function getRecentMatches(limit = 5) {
  try {
    if (!sql) {
      return []
    }

    const matches = await sql`
      SELECT m.*, 
        t1.name as team1_name, t1.short_name as team1_short_name,
        t2.name as team2_name, t2.short_name as team2_short_name,
        v.name as venue_name, v.city as venue_city
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN venues v ON m.venue_id = v.id
      ORDER BY m.match_date DESC
      LIMIT ${limit}
    `

    return matches || []
  } catch (error) {
    console.error(`Error getting recent matches:`, error)
    return []
  }
}
