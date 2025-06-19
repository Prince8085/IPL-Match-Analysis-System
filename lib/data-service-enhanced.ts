/**
 * Enhanced data service with improved error handling, validation, and monitoring
 */

import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import type { Team, Player, Venue } from "./schema"
import {
  validateTeam,
  validateVenue,
  validatePlayer,
  validateMatchData,
  type FetchResult,
  logDataFetch,
  dataDependencies,
  withRetry,
} from "./data-fetching-utils"

// Mock data for development and testing
const mockTeams = [
  { id: "1", name: "Mumbai Indians", shortName: "MI", primaryColor: "#004BA0", secondaryColor: "#D1AB3E" },
  { id: "2", name: "Chennai Super Kings", shortName: "CSK", primaryColor: "#F9CD05", secondaryColor: "#0081E9" },
  {
    id: "3",
    name: "Royal Challengers Bangalore",
    shortName: "RCB",
    primaryColor: "#EC1C24",
    secondaryColor: "#000000",
  },
  { id: "4", name: "Kolkata Knight Riders", shortName: "KKR", primaryColor: "#3A225D", secondaryColor: "#B3A123" },
  { id: "5", name: "Delhi Capitals", shortName: "DC", primaryColor: "#00008B", secondaryColor: "#FF0000" },
  { id: "6", name: "Punjab Kings", shortName: "PBKS", primaryColor: "#ED1B24", secondaryColor: "#DCDDDF" },
  { id: "7", name: "Rajasthan Royals", shortName: "RR", primaryColor: "#2D3E8B", secondaryColor: "#FF1744" },
  { id: "8", name: "Sunrisers Hyderabad", shortName: "SRH", primaryColor: "#F7A721", secondaryColor: "#DC143C" },
  { id: "9", name: "Gujarat Titans", shortName: "GT", primaryColor: "#1C1C1C", secondaryColor: "#0080FF" },
  { id: "10", name: "Lucknow Super Giants", shortName: "LSG", primaryColor: "#A72056", secondaryColor: "#FFFF3C" },
]

const mockVenues = [
  {
    id: "1",
    name: "M. A. Chidambaram Stadium",
    city: "Chennai",
    capacity: 50000,
    pitchType: "Spin friendly",
    averageFirstInningsScore: 165,
    averageSecondInningsScore: 155,
    highestTotal: 246,
    lowestTotal: 70,
    averageRunRate: 8.25,
    boundaryPercentage: 52,
    winPercentageBattingFirst: 60,
  },
  {
    id: "2",
    name: "Wankhede Stadium",
    city: "Mumbai",
    capacity: 33000,
    pitchType: "Batting friendly",
    averageFirstInningsScore: 175,
    averageSecondInningsScore: 160,
    highestTotal: 235,
    lowestTotal: 67,
    averageRunRate: 8.75,
    boundaryPercentage: 58,
    winPercentageBattingFirst: 55,
  },
  {
    id: "3",
    name: "Eden Gardens",
    city: "Kolkata",
    capacity: 68000,
    pitchType: "Balanced",
    averageFirstInningsScore: 170,
    averageSecondInningsScore: 165,
    highestTotal: 232,
    lowestTotal: 49,
    averageRunRate: 8.5,
    boundaryPercentage: 55,
    winPercentageBattingFirst: 48,
  },
  {
    id: "4",
    name: "Arun Jaitley Stadium",
    city: "Delhi",
    capacity: 41000,
    pitchType: "Balanced",
    averageFirstInningsScore: 175,
    averageSecondInningsScore: 165,
    highestTotal: 231,
    lowestTotal: 95,
    averageRunRate: 8.7,
    boundaryPercentage: 57,
    winPercentageBattingFirst: 52,
  },
  {
    id: "5",
    name: "M. Chinnaswamy Stadium",
    city: "Bangalore",
    capacity: 40000,
    pitchType: "Batting friendly",
    averageFirstInningsScore: 180,
    averageSecondInningsScore: 170,
    highestTotal: 248,
    lowestTotal: 82,
    averageRunRate: 9.0,
    boundaryPercentage: 60,
    winPercentageBattingFirst: 45,
  },
  {
    id: "6",
    name: "Rajiv Gandhi International Stadium",
    city: "Hyderabad",
    capacity: 39000,
    pitchType: "Spin friendly",
    averageFirstInningsScore: 165,
    averageSecondInningsScore: 155,
    highestTotal: 227,
    lowestTotal: 80,
    averageRunRate: 8.3,
    boundaryPercentage: 54,
    winPercentageBattingFirst: 55,
  },
  {
    id: "7",
    name: "Punjab Cricket Association Stadium",
    city: "Mohali",
    capacity: 26000,
    pitchType: "Pace friendly",
    averageFirstInningsScore: 175,
    averageSecondInningsScore: 165,
    highestTotal: 232,
    lowestTotal: 92,
    averageRunRate: 8.8,
    boundaryPercentage: 58,
    winPercentageBattingFirst: 48,
  },
  {
    id: "8",
    name: "Sawai Mansingh Stadium",
    city: "Jaipur",
    capacity: 30000,
    pitchType: "Balanced",
    averageFirstInningsScore: 170,
    averageSecondInningsScore: 160,
    highestTotal: 223,
    lowestTotal: 89,
    averageRunRate: 8.6,
    boundaryPercentage: 56,
    winPercentageBattingFirst: 51,
  },
  {
    id: "9",
    name: "Narendra Modi Stadium",
    city: "Ahmedabad",
    capacity: 132000,
    pitchType: "Balanced",
    averageFirstInningsScore: 172,
    averageSecondInningsScore: 162,
    highestTotal: 234,
    lowestTotal: 85,
    averageRunRate: 8.7,
    boundaryPercentage: 57,
    winPercentageBattingFirst: 49,
  },
  {
    id: "10",
    name: "Barsapara Cricket Stadium",
    city: "Guwahati",
    capacity: 40000,
    pitchType: "Batting friendly",
    averageFirstInningsScore: 178,
    averageSecondInningsScore: 168,
    highestTotal: 230,
    lowestTotal: 90,
    averageRunRate: 8.9,
    boundaryPercentage: 59,
    winPercentageBattingFirst: 47,
  },
]

// Enhanced function to fetch teams with better error handling and validation
export async function getTeamsEnhanced(): Promise<FetchResult<Team[]>> {
  const timestamp = new Date().toISOString()
  const functionName = "getTeamsEnhanced"
  const params = {}

  try {
    console.log(`[${timestamp}] Fetching teams from database...`)

    // Try to fetch from database with retry mechanism
    const result = await withRetry(() => sql`SELECT * FROM teams`, {
      retries: 2,
      onRetry: (attempt, error) => {
        console.warn(`Database fetch attempt ${attempt} failed:`, error)
      },
    })

    if (result && result.length > 0) {
      console.log(`[${timestamp}] Successfully fetched ${result.length} teams from database`)

      // Validate each team
      const validationErrors: string[] = []
      result.forEach((team, index) => {
        const validation = validateTeam(team)
        if (!validation.valid) {
          validationErrors.push(`Team at index ${index} (${team.id || "unknown"}): ${validation.errors.join(", ")}`)
        }
      })

      if (validationErrors.length > 0) {
        console.warn(`[${timestamp}] Team validation warnings:`, validationErrors)
      }

      const fetchResult: FetchResult<Team[]> = {
        success: true,
        data: result,
        source: "database",
        message:
          validationErrors.length > 0
            ? `Fetched with ${validationErrors.length} validation warnings`
            : "Fetched successfully from database",
        timestamp,
      }

      logDataFetch(functionName, params, fetchResult)
      return fetchResult
    }

    // Fall back to mock data if database query returns empty
    console.log(`[${timestamp}] No teams found in database, using mock data`)

    const fetchResult: FetchResult<Team[]> = {
      success: true,
      data: mockTeams,
      source: "mock",
      message: "Fallback to mock data (no database records)",
      timestamp,
    }

    logDataFetch(functionName, params, fetchResult)
    return fetchResult
  } catch (error) {
    console.error(`[${timestamp}] Error fetching teams:`, error)

    // Return mock data if there's an error
    const fetchResult: FetchResult<Team[]> = {
      success: false,
      data: mockTeams,
      source: "fallback",
      message: `Database error: ${error.message || String(error)}. Using fallback data.`,
      timestamp,
    }

    logDataFetch(functionName, params, fetchResult)
    return fetchResult
  }
}

// Enhanced function to fetch venues with better error handling and validation
export async function getVenuesEnhanced(): Promise<FetchResult<Venue[]>> {
  const timestamp = new Date().toISOString()
  const functionName = "getVenuesEnhanced"
  const params = {}

  try {
    console.log(`[${timestamp}] Fetching venues from database...`)

    // Try to fetch from database with retry
    const result = await withRetry(() => sql`SELECT * FROM venues`, {
      retries: 2,
      onRetry: (attempt, error) => {
        console.warn(`Database fetch attempt ${attempt} failed:`, error)
      },
    })

    if (result && result.length > 0) {
      console.log(`[${timestamp}] Successfully fetched ${result.length} venues from database`)

      // Validate each venue
      const validationErrors: string[] = []
      result.forEach((venue, index) => {
        const validation = validateVenue(venue)
        if (!validation.valid) {
          validationErrors.push(`Venue at index ${index} (${venue.id || "unknown"}): ${validation.errors.join(", ")}`)
        }
      })

      if (validationErrors.length > 0) {
        console.warn(`[${timestamp}] Venue validation warnings:`, validationErrors)
      }

      const fetchResult: FetchResult<Venue[]> = {
        success: true,
        data: result,
        source: "database",
        message:
          validationErrors.length > 0
            ? `Fetched with ${validationErrors.length} validation warnings`
            : "Fetched successfully from database",
        timestamp,
      }

      logDataFetch(functionName, params, fetchResult)
      return fetchResult
    }

    // Fall back to mock data if database query returns empty
    console.log(`[${timestamp}] No venues found in database, using mock data`)

    const fetchResult: FetchResult<Venue[]> = {
      success: true,
      data: mockVenues,
      source: "mock",
      message: "Fallback to mock data (no database records)",
      timestamp,
    }

    logDataFetch(functionName, params, fetchResult)
    return fetchResult
  } catch (error) {
    console.error(`[${timestamp}] Error fetching venues:`, error)

    // Return mock data if there's an error
    const fetchResult: FetchResult<Venue[]> = {
      success: false,
      data: mockVenues,
      source: "fallback",
      message: `Database error: ${error.message || String(error)}. Using fallback data.`,
      timestamp,
    }

    logDataFetch(functionName, params, fetchResult)
    return fetchResult
  }
}

// Enhanced function to fetch players with better error handling and validation
export async function fetchPlayersEnhanced(teamIds: string[] = []): Promise<FetchResult<Player[]>> {
  const timestamp = new Date().toISOString()
  const functionName = "fetchPlayersEnhanced"
  const params = { teamIds }

  try {
    console.log(`[${timestamp}] Fetching players${teamIds.length > 0 ? ` for teams: ${teamIds.join(", ")}` : ""}...`)

    let result

    if (teamIds && teamIds.length > 0) {
      // Track team dependencies
      teamIds.forEach((id) => dataDependencies.trackDependency("teams", id))

      // Create placeholders for the IN clause
      const placeholders = teamIds.map((_, i) => `$${i + 1}`).join(", ")
      const query = `SELECT * FROM players WHERE team_id IN (${placeholders})`

      result = await withRetry(() => sql.unsafe(query, teamIds), {
        retries: 2,
        onRetry: (attempt, error) => {
          console.warn(`Database fetch attempt ${attempt} failed:`, error)
        },
      })
    } else {
      result = await withRetry(() => sql`SELECT * FROM players`, {
        retries: 2,
        onRetry: (attempt, error) => {
          console.warn(`Database fetch attempt ${attempt} failed:`, error)
        },
      })
    }

    if (result && result.length > 0) {
      console.log(`[${timestamp}] Successfully fetched ${result.length} players from database`)

      // Validate each player
      const validationErrors: string[] = []
      result.forEach((player, index) => {
        const validation = validatePlayer(player)
        if (!validation.valid) {
          validationErrors.push(`Player at index ${index} (${player.id || "unknown"}): ${validation.errors.join(", ")}`)
        }

        // Track player dependencies
        dataDependencies.trackDependency("players", player.id)
      })

      if (validationErrors.length > 0) {
        console.warn(`[${timestamp}] Player validation warnings:`, validationErrors)
      }

      const fetchResult: FetchResult<Player[]> = {
        success: true,
        data: result,
        source: "database",
        message:
          validationErrors.length > 0
            ? `Fetched with ${validationErrors.length} validation warnings`
            : "Fetched successfully from database",
        timestamp,
      }

      logDataFetch(functionName, params, fetchResult)
      return fetchResult
    }

    // Return mock players if database query returns empty
    console.log(`[${timestamp}] No players found in database, using mock data`)

    const mockPlayers = [
      {
        id: "1",
        name: "Rohit Sharma",
        teamId: "1",
        role: "Batsman",
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm off break",
      },
      {
        id: "2",
        name: "Jasprit Bumrah",
        teamId: "1",
        role: "Bowler",
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm fast",
      },
      {
        id: "3",
        name: "MS Dhoni",
        teamId: "2",
        role: "Wicketkeeper",
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm medium",
      },
      {
        id: "4",
        name: "Ravindra Jadeja",
        teamId: "2",
        role: "All-rounder",
        battingStyle: "Left-handed",
        bowlingStyle: "Left-arm orthodox",
      },
    ].filter((player) => !teamIds.length || teamIds.includes(player.teamId))

    // Track mock player dependencies
    mockPlayers.forEach((player) => dataDependencies.trackDependency("players", player.id))

    const fetchResult: FetchResult<Player[]> = {
      success: true,
      data: mockPlayers,
      source: "mock",
      message: "Fallback to mock data (no database records)",
      timestamp,
    }

    logDataFetch(functionName, params, fetchResult)
    return fetchResult
  } catch (error) {
    console.error(`[${timestamp}] Error fetching players:`, error)

    // Return mock data if there's an error
    const mockPlayers = [
      {
        id: "1",
        name: "Rohit Sharma",
        teamId: "1",
        role: "Batsman",
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm off break",
      },
      {
        id: "2",
        name: "Jasprit Bumrah",
        teamId: "1",
        role: "Bowler",
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm fast",
      },
    ].filter((player) => !teamIds.length || teamIds.includes(player.teamId))

    const fetchResult: FetchResult<Player[]> = {
      success: false,
      data: mockPlayers,
      source: "fallback",
      message: `Database error: ${error.message || String(error)}. Using fallback data.`,
      timestamp,
    }

    logDataFetch(functionName, params, fetchResult)
    return fetchResult
  }
}

// Enhanced function to fetch match data with better error handling and validation
export async function fetchMatchDataEnhanced(
  team1Id: string,
  team2Id: string,
  venueName: string,
  matchDate?: Date,
): Promise<FetchResult<any>> {
  const timestamp = new Date().toISOString()
  const functionName = "fetchMatchDataEnhanced"
  const params = { team1Id, team2Id, venueName, matchDate: matchDate?.toISOString() }

  try {
    console.log(`[${timestamp}] Fetching match data for teams ${team1Id} vs ${team2Id} at ${venueName}`)

    // Get team data
    const teamsResult = await getTeamsEnhanced()
    const teams = teamsResult.data || []

    const team1 = teams.find((t) => String(t.id) === String(team1Id))
    const team2 = teams.find((t) => String(t.id) === String(team2Id))

    if (!team1 || !team2) {
      console.error(`[${timestamp}] Team data not found`, { team1Id, team2Id, teamsFound: teams.length })

      // Create fallback teams if not found
      const fallbackTeam1 = team1 || {
        id: team1Id,
        name: `Team ${team1Id}`,
        shortName: `T${team1Id}`,
        primaryColor: "#333333",
        secondaryColor: "#999999",
      }

      const fallbackTeam2 = team2 || {
        id: team2Id,
        name: `Team ${team2Id}`,
        shortName: `T${team2Id}`,
        primaryColor: "#666666",
        secondaryColor: "#cccccc",
      }

      console.warn(`[${timestamp}] Using fallback team data for missing teams`)

      // Track team dependencies
      dataDependencies.trackDependency("teams", team1Id)
      dataDependencies.trackDependency("teams", team2Id)

      // Get venue data
      const venuesResult = await getVenuesEnhanced()
      const venues = venuesResult.data || []

      console.log(`[${timestamp}] Looking for venue: "${venueName}" among ${venues.length} venues`)

      // Try multiple matching strategies
      let venue = venues.find((v) => v.name === venueName || String(v.id) === venueName)

      // If exact match fails, try case-insensitive match
      if (!venue) {
        console.log(`[${timestamp}] Exact match failed, trying case-insensitive match`)
        venue = venues.find(
          (v) =>
            v.name.toLowerCase() === venueName.toLowerCase() || String(v.id).toLowerCase() === venueName.toLowerCase(),
        )
      }

      // If still no match, try partial match (contains)
      if (!venue) {
        console.log(`[${timestamp}] Case-insensitive match failed, trying partial match`)
        venue = venues.find(
          (v) =>
            v.name.toLowerCase().includes(venueName.toLowerCase()) ||
            venueName.toLowerCase().includes(v.name.toLowerCase()),
        )
      }

      // If still no match, create a default venue
      if (!venue) {
        console.warn(`[${timestamp}] Venue "${venueName}" not found. Creating a default venue.`)
        venue = {
          id: "default-" + Date.now(),
          name: venueName,
          city: "Unknown",
          pitchType: "Balanced",
          averageFirstInningsScore: 170,
          averageSecondInningsScore: 160,
          highestTotal: 220,
          lowestTotal: 100,
          averageRunRate: 8.5,
          boundaryPercentage: 55,
          winPercentageBattingFirst: 50,
        }
      }

      // Track venue dependency
      dataDependencies.trackDependency("venues", venue.id)

      // Create a match data object
      const matchData = {
        id: uuidv4(),
        team1Id: fallbackTeam1.id,
        team2Id: fallbackTeam2.id,
        venueId: venue.id,
        team1_name: fallbackTeam1.name,
        team1_short_name: fallbackTeam1.shortName,
        team1_color: fallbackTeam1.primaryColor,
        team2_name: fallbackTeam2.name,
        team2_short_name: fallbackTeam2.shortName,
        team2_color: fallbackTeam2.primaryColor,
        venue_name: venue.name,
        venue_city: venue.city,
        pitch_type: venue.pitchType,
        match_date: matchDate ? matchDate.toISOString() : new Date().toISOString(),
        match_status: "Upcoming",
        match_type: "T20",
      }

      // Validate match data
      const validation = validateMatchData(matchData)

      const fetchResult: FetchResult<any> = {
        success: false,
        data: matchData,
        source: "fallback",
        message: `Team data not found. Using fallback data. Validation: ${validation.valid ? "passed" : "failed with errors: " + validation.errors.join(", ")}`,
        timestamp,
      }

      logDataFetch(functionName, params, fetchResult)
      return fetchResult
    }

    // Get venue data
    const venuesResult = await getVenuesEnhanced()
    const venues = venuesResult.data || []

    console.log(`[${timestamp}] Looking for venue: "${venueName}" among ${venues.length} venues`)

    // Try multiple matching strategies
    let venue = venues.find((v) => v.name === venueName || String(v.id) === venueName)

    // If exact match fails, try case-insensitive match
    if (!venue) {
      console.log(`[${timestamp}] Exact match failed, trying case-insensitive match`)
      venue = venues.find(
        (v) =>
          v.name.toLowerCase() === venueName.toLowerCase() || String(v.id).toLowerCase() === venueName.toLowerCase(),
      )
    }

    // If still no match, try partial match (contains)
    if (!venue) {
      console.log(`[${timestamp}] Case-insensitive match failed, trying partial match`)
      venue = venues.find(
        (v) =>
          v.name.toLowerCase().includes(venueName.toLowerCase()) ||
          venueName.toLowerCase().includes(v.name.toLowerCase()),
      )
    }

    // If still no match, create a default venue
    if (!venue) {
      console.warn(`[${timestamp}] Venue "${venueName}" not found. Creating a default venue.`)
      venue = {
        id: "default-" + Date.now(),
        name: venueName,
        city: "Unknown",
        pitchType: "Balanced",
        averageFirstInningsScore: 170,
        averageSecondInningsScore: 160,
        highestTotal: 220,
        lowestTotal: 100,
        averageRunRate: 8.5,
        boundaryPercentage: 55,
        winPercentageBattingFirst: 50,
      }
    }

    // Track venue dependency
    dataDependencies.trackDependency("venues", venue.id)

    // Create a match data object
    const matchData = {
      id: uuidv4(),
      team1Id: team1.id,
      team2Id: team2.id,
      venueId: venue.id,
      team1_name: team1.name,
      team1_short_name: team1.shortName,
      team1_color: team1.primaryColor,
      team2_name: team2.name,
      team2_short_name: team2.shortName,
      team2_color: team2.primaryColor,
      venue_name: venue.name,
      venue_city: venue.city,
      pitch_type: venue.pitchType,
      match_date: matchDate ? matchDate.toISOString() : new Date().toISOString(),
      match_status: "Upcoming",
      match_type: "T20",
    }

    console.log(`[${timestamp}] Successfully created match data:`, matchData)

    // Validate match data
    const validation = validateMatchData(matchData)

    const fetchResult: FetchResult<any> = {
      success: true,
      data: matchData,
      source: "database",
      message: `Match data created successfully. Validation: ${validation.valid ? "passed" : "failed with errors: " + validation.errors.join(", ")}`,
      timestamp,
    }

    logDataFetch(functionName, params, fetchResult)
    return fetchResult
  } catch (error) {
    console.error(`[${timestamp}] Error in fetchMatchDataEnhanced:`, error)

    // Create fallback match data
    const fallbackMatchData = {
      id: uuidv4(),
      team1Id: team1Id,
      team2Id: team2Id,
      venueId: "default",
      team1_name: `Team ${team1Id}`,
      team1_short_name: `T${team1Id}`,
      team2_name: `Team ${team2Id}`,
      team2_short_name: `T${team2Id}`,
      venue_name: venueName || "Default Venue",
      venue_city: "Unknown",
      pitch_type: "Balanced",
      match_date: matchDate ? matchDate.toISOString() : new Date().toISOString(),
      match_status: "Upcoming",
      match_type: "T20",
    }

    const fetchResult: FetchResult<any> = {
      success: false,
      data: fallbackMatchData,
      source: "error",
      message: `Error fetching match data: ${error.message || String(error)}. Using fallback data.`,
      timestamp,
    }

    logDataFetch(functionName, params, fetchResult)
    return fetchResult
  }
}

// Enhanced function to generate predictions with better error handling and validation
export async function generatePredictionsEnhanced(matchData: any, isLiveUpdate = false): Promise<FetchResult<any>> {
  const timestamp = new Date().toISOString()
  const functionName = "generatePredictionsEnhanced"
  const params = {
    matchData: { id: matchData?.id, team1Id: matchData?.team1Id, team2Id: matchData?.team2Id },
    isLiveUpdate,
  }

  try {
    console.log(`[${timestamp}] Generating predictions for match data:`, params.matchData)

    if (!matchData) {
      throw new Error("Match data is required")
    }

    // Validate match data
    const validation = validateMatchData(matchData)
    if (!validation.valid) {
      console.warn(`[${timestamp}] Match data validation warnings:`, validation.errors)
    }

    // Extract team IDs from match data
    const team1Id = matchData.team1Id || matchData.team1_id
    const team2Id = matchData.team2Id || matchData.team2_id

    if (!team1Id || !team2Id) {
      throw new Error("Team IDs are required")
    }

    // Get team data
    const teamsResult = await getTeamsEnhanced()
    const teams = teamsResult.data || []

    const team1 = teams.find((t) => String(t.id) === String(team1Id)) || {
      id: team1Id,
      name: matchData.team1_name || "Team 1",
      shortName: matchData.team1_short_name || "T1",
    }

    const team2 = teams.find((t) => String(t.id) === String(team2Id)) || {
      id: team2Id,
      name: matchData.team2_name || "Team 2",
      shortName: matchData.team2_short_name || "T2",
    }

    // Track team dependencies
    dataDependencies.trackDependency("teams", team1Id)
    dataDependencies.trackDependency("teams", team2Id)

    // Get venue data if available
    const venueId = matchData.venueId || matchData.venue_id
    const venueName = matchData.venue_name

    let venue
    if (venueId || venueName) {
      const venuesResult = await getVenuesEnhanced()
      const venues = venuesResult.data || []

      venue = venues.find((v) => (venueId && String(v.id) === String(venueId)) || (venueName && v.name === venueName))

      if (venue) {
        dataDependencies.trackDependency("venues", venue.id)
      }
    }

    if (!venue) {
      venue = {
        id: venueId || "default",
        name: venueName || "Default Stadium",
        city: matchData.venue_city || "Default City",
        pitchType: matchData.pitch_type || "Balanced",
      }
    }

    // Generate prediction data
    const prediction = generateMockPrediction(team1, team2, venue, isLiveUpdate)
    console.log(`[${timestamp}] Successfully generated prediction data`)

    const fetchResult: FetchResult<any> = {
      success: true,
      data: prediction,
      source: "mock", // Currently using mock data, could be "database" if we implement real predictions
      message: "Prediction generated successfully",
      timestamp,
    }

    logDataFetch(functionName, params, fetchResult)
    return fetchResult
  } catch (error) {
    console.error(`[${timestamp}] Error generating predictions:`, error)

    // Create fallback prediction with minimal data
    const fallbackPrediction = {
      teams: {
        team1: matchData?.team1_name || "Team 1",
        team2: matchData?.team2_name || "Team 2",
      },
      winProbability: {
        team1: 50,
        team2: 45,
        tie: 5,
      },
      insights: ["Prediction based on limited data due to an error.", "Results may not be accurate."],
      firstInnings: {
        projectedScore: "160-180",
        keyPhases: ["Powerplay", "Middle Overs", "Death Overs"],
      },
      secondInnings: {
        chaseSuccessProbability: "50%",
        criticalFactors: ["Wickets in hand", "Run rate", "Partnerships"],
      },
    }

    const fetchResult: FetchResult<any> = {
      success: false,
      data: fallbackPrediction,
      source: "error",
      message: `Error generating predictions: ${error.message || String(error)}. Using fallback data.`,
      timestamp,
    }

    logDataFetch(functionName, params, fetchResult)
    return fetchResult
  }
}

// Generate detailed mock prediction data
function generateMockPrediction(team1, team2, venue, isLiveUpdate = false) {
  // Ensure we have valid objects even if inputs are null/undefined
  team1 = team1 || { id: "1", name: "Team 1", shortName: "T1" }
  team2 = team2 || { id: "2", name: "Team 2", shortName: "T2" }
  venue = venue || {
    id: "1",
    name: "Default Stadium",
    city: "Default City",
    pitchType: "Balanced",
  }

  // Generate random win probabilities that sum to 100
  const team1WinProb = Math.floor(Math.random() * 60) + 20
  const team2WinProb = Math.floor(Math.random() * (95 - team1WinProb)) + 5
  const tieProb = 100 - team1WinProb - team2WinProb

  // Default values for predictions
  const defaultPredictions = {
    teams: {
      team1: team1.name,
      team2: team2.name,
    },
    winProbability: {
      team1: team1WinProb,
      team2: team2WinProb,
      tie: tieProb,
    },
    predictedScores: {
      team1: {
        innings1: Math.floor(Math.random() * 40) + 160, // 160-200
        innings2: Math.floor(Math.random() * 30) + 150, // 150-180
      },
      team2: {
        innings1: Math.floor(Math.random() * 40) + 160, // 160-200
        innings2: Math.floor(Math.random() * 30) + 150, // 150-180
      },
    },
    keyPlayers: {
      team1: [
        { id: "1", name: "Rohit Sharma", role: "Batsman", impact: 8.5 },
        { id: "2", name: "Jasprit Bumrah", role: "Bowler", impact: 9.2 },
      ],
      team2: [
        { id: "3", name: "MS Dhoni", role: "Wicketkeeper", impact: 7.8 },
        { id: "4", name: "Ravindra Jadeja", role: "All-rounder", impact: 8.7 },
      ],
    },
    keyMatchups: [
      {
        batsman: { id: "1", name: "Rohit Sharma", team: team1.name },
        bowler: { id: "5", name: "Deepak Chahar", team: team2.name },
        battingAvg: 24.5,
        strikeRate: 138.2,
        dismissals: 5,
        ballsFaced: 68,
        advantage: "bowler",
      },
      {
        batsman: { id: "6", name: "Faf du Plessis", team: team2.name },
        bowler: { id: "2", name: "Jasprit Bumrah", team: team1.name },
        battingAvg: 18.3,
        strikeRate: 112.5,
        dismissals: 6,
        ballsFaced: 72,
        advantage: "bowler",
      },
    ],
    venueStats: {
      name: venue.name,
      city: venue.city,
      avgFirstInningsScore: venue.averageFirstInningsScore || venue.avg_first_innings_score || 170,
      avgSecondInningsScore: venue.averageSecondInningsScore || venue.avg_second_innings_score || 160,
      highestTotal: venue.highestTotal || 230,
      lowestTotal: venue.lowestTotal || 80,
      avgRunRate: venue.averageRunRate || 8.5,
      boundaryPercentage: venue.boundaryPercentage || 55,
      winPercentageBattingFirst: venue.winPercentageBattingFirst || venue.batting_first_win_percentage || 52,
    },
    pitchAnalysis: {
      pitchType: venue.pitchType || "Balanced",
      paceBowlingImpact: 7.2,
      spinBowlingImpact: 6.8,
      battingDifficulty: 6.5,
      averageBoundariesPerMatch: 42,
      chaseSuccessRate: 48,
    },
    pitchHeatmap: {
      zones: [
        { zone: "Good length", frequency: 35, averageRunRate: 6.2, wicketProbability: 12 },
        { zone: "Short", frequency: 20, averageRunRate: 8.5, wicketProbability: 8 },
        { zone: "Yorker", frequency: 15, averageRunRate: 5.8, wicketProbability: 15 },
        { zone: "Full toss", frequency: 10, averageRunRate: 10.2, wicketProbability: 5 },
        { zone: "Bouncer", frequency: 12, averageRunRate: 7.5, wicketProbability: 10 },
        { zone: "Wide", frequency: 8, averageRunRate: 9.0, wicketProbability: 3 },
      ],
    },
    weatherImpact: {
      condition: "Clear",
      temperature: 28,
      humidity: 65,
      windSpeed: 12,
      impactOnSwing: 6.5,
      impactOnSpin: 4.2,
      overallImpact: "Minimal",
    },
    teamComparison: {
      battingStrength: {
        team1: 8.2,
        team2: 7.9,
      },
      bowlingStrength: {
        team1: 7.8,
        team2: 8.3,
      },
      fieldingEfficiency: {
        team1: 7.5,
        team2: 8.0,
      },
      powerPlayPerformance: {
        team1: 8.5,
        team2: 7.8,
      },
      deathOverPerformance: {
        team1: 7.6,
        team2: 8.4,
      },
    },
    headToHead: {
      totalMatches: 28,
      team1Wins: 15,
      team2Wins: 12,
      noResults: 1,
      lastFiveEncounters: [
        { winner: team1.name, margin: "23 runs", year: 2022 },
        { winner: team2.name, margin: "5 wickets", year: 2022 },
        { winner: team1.name, margin: "8 wickets", year: 2021 },
        { winner: team1.name, margin: "27 runs", year: 2021 },
        { winner: team2.name, margin: "4 wickets", year: 2020 },
      ],
    },
    phaseAnalysis: {
      team1: {
        batting: [
          { name: "Powerplay", rating: 8.5 },
          { name: "Middle", rating: 7.8 },
          { name: "Death", rating: 8.2 },
        ],
        bowling: [
          { name: "Powerplay", rating: 7.5 },
          { name: "Middle", rating: 8.0 },
          { name: "Death", rating: 8.5 },
        ],
      },
      team2: {
        batting: [
          { name: "Powerplay", rating: 7.9 },
          { name: "Middle", rating: 8.3 },
          { name: "Death", rating: 7.6 },
        ],
        bowling: [
          { name: "Powerplay", rating: 8.2 },
          { name: "Middle", rating: 7.7 },
          { name: "Death", rating: 8.1 },
        ],
      },
    },
    keyMoments: [
      {
        phase: "Powerplay",
        over: 4,
        description: "Team 1 likely to dominate with aggressive batting",
        probability: 65,
      },
      {
        phase: "Middle Overs",
        over: 12,
        description: "Team 2 spinners expected to restrict run rate",
        probability: 70,
      },
      {
        phase: "Death Overs",
        over: 12,
        description: "Team 1 has superior death bowlers",
        probability: 60,
      },
    ],
    modelInsights: {
      modelName: "CricPredict v2.0",
      accuracy: 72,
      confidenceScore: 68,
      keyFactors: [
        "Recent form of key players",
        "Head-to-head record at this venue",
        "Pitch conditions favoring Team 2's bowling attack",
      ],
      featureImportance: [
        { feature: "Recent Form", importance: 25 },
        { feature: "Head-to-Head", importance: 20 },
        { feature: "Venue Stats", importance: 18 },
        { feature: "Player Matchups", importance: 15 },
        { feature: "Current Season Performance", importance: 12 },
        { feature: "Toss Decision", importance: 10 },
      ],
      modelComparison: [
        { model: "Statistical", accuracy: 65 },
        { model: "Machine Learning", accuracy: 72 },
        { model: "Expert Consensus", accuracy: 68 },
      ],
    },
    liveScore: {
      currentInnings: "1",
      team1: {
        runs: 85,
        wickets: 2,
        overs: 9,
        balls: 0,
        runRate: 9.44,
        projectedScore: 189,
      },
      team2: {
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        runRate: 0,
        projectedScore: 0,
      },
      batsman1: {
        name: "Rohit Sharma",
        runs: 42,
        balls: 28,
        fours: 4,
        sixes: 2,
        strikeRate: 150,
      },
      batsman2: {
        name: "Suryakumar Yadav",
        runs: 35,
        balls: 22,
        fours: 3,
        sixes: 2,
        strikeRate: 159.09,
      },
      bowler: {
        name: "Deepak Chahar",
        overs: 3,
        maidens: 0,
        runs: 32,
        wickets: 1,
        economyRate: 10.67,
      },
      currentPartnership: "58(36)",
      recentOvers: [
        {
          number: 9,
          runs: 12,
          balls: ["1", "4", "1", "0", "6", "0"],
        },
        {
          number: 8,
          runs: 8,
          balls: ["1", "1", "4", "1", "0", "1"],
        },
        {
          number: 7,
          runs: 15,
          balls: ["1", "4", "4", "1", "1", "4"],
        },
        {
          number: 6,
          runs: 6,
          balls: ["1", "1", "1", "1", "1", "1"],
        },
        {
          number: 5,
          runs: 10,
          balls: ["1", "0", "4", "1", "0", "4"],
        },
      ],
      target: null,
      toWin: null,
      requiredRunRate: null,
      ballsRemaining: null,
      matchStatus: "Mumbai Indians are in a strong position with a healthy run rate in the powerplay.",
    },
    ballByBall: [
      {
        over: 1,
        ball: 1,
        batsman: "Rohit Sharma",
        bowler: "Deepak Chahar",
        runs: 0,
        extras: 0,
        wicket: false,
        commentary: "Good length delivery, defended back to the bowler.",
        predictedOutcome: {
          runProbability: { "0": 60, "1": 25, "2": 5, "4": 8, "6": 2 },
          wicketProbability: 10,
        },
      },
      {
        over: 1,
        ball: 2,
        batsman: "Rohit Sharma",
        bowler: "Deepak Chahar",
        runs: 4,
        extras: 0,
        wicket: false,
        commentary: "Short and wide, cut away through point for a boundary!",
        predictedOutcome: {
          runProbability: { "0": 40, "1": 20, "2": 5, "4": 30, "6": 5 },
          wicketProbability: 5,
        },
      },
    ],
    overAnalysis: [
      {
        over: 1,
        runs: 8,
        wickets: 0,
        highlights: "Cautious start with one boundary",
        predictedRuns: { min: 6, max: 10, most_likely: 8 },
        predictedWickets: { probability: 15, most_likely: 0 },
      },
      {
        over: 2,
        runs: 12,
        wickets: 1,
        highlights: "One big six but lost a wicket",
        predictedRuns: { min: 8, max: 14, most_likely: 11 },
        predictedWickets: { probability: 30, most_likely: 1 },
      },
    ],
    turningPoints: [
      {
        phase: "Powerplay",
        over: 4,
        description: "Two quick wickets by Bumrah changed momentum",
        impactScore: 8.5,
      },
      {
        phase: "Middle Overs",
        over: 12,
        description: "Three consecutive boundaries shifted pressure back to bowling team",
        impactScore: 7.8,
      },
    ],
  }

  return defaultPredictions
}
