/**
 * Simplified data service for IPL Match Analysis System
 * This file contains only the essential functions needed for the core functionality
 */

import { sql } from "./db"

// Fetch teams from database or return mock data if database fails
export async function fetchTeams() {
  try {
    console.log("Fetching teams from database...")

    // Check if database connection is available
    if (!sql) {
      console.log("Database connection not available, using mock data")
      return getMockTeams()
    }

    // Try to fetch from database
    const teams = await sql`SELECT * FROM teams ORDER BY name`

    if (teams && teams.length > 0) {
      console.log(`Successfully fetched ${teams.length} teams from database`)
      return teams
    }

    // Return mock data if no teams found in database
    console.log("No teams found in database, using mock data")
    return getMockTeams()
  } catch (error) {
    console.error("Error fetching teams:", error)
    // Return mock data on error
    return getMockTeams()
  }
}

// Fetch venues from database or return mock data if database fails
export async function fetchVenues() {
  try {
    console.log("Fetching venues from database...")

    // Check if database connection is available
    if (!sql) {
      console.log("Database connection not available, using mock data")
      return getMockVenues()
    }

    // Try to fetch from database
    const venues = await sql`SELECT * FROM venues ORDER BY name`

    if (venues && venues.length > 0) {
      console.log(`Successfully fetched ${venues.length} venues from database`)
      return venues
    }

    // Return mock data if no venues found in database
    console.log("No venues found in database, using mock data")
    return getMockVenues()
  } catch (error) {
    console.error("Error fetching venues:", error)
    // Return mock data on error
    return getMockVenues()
  }
}

// Fetch players from database or return mock data if database fails
export async function fetchPlayers(teamIds = []) {
  try {
    console.log("Fetching players from database...")

    // Check if database connection is available
    if (!sql) {
      console.log("Database connection not available, using mock data")
      return getMockPlayers(teamIds)
    }

    let players
    if (teamIds && teamIds.length > 0) {
      // Create placeholders for the IN clause
      const placeholders = teamIds.map((_, i) => `$${i + 1}`).join(", ")
      const query = `SELECT * FROM players WHERE team_id IN (${placeholders}) ORDER BY name`

      players = await sql.unsafe(query, teamIds)
    } else {
      players = await sql`SELECT * FROM players ORDER BY name`
    }

    if (players && players.length > 0) {
      console.log(`Successfully fetched ${players.length} players from database`)
      return players
    }

    // Return mock data if no players found in database
    console.log("No players found in database, using mock data")
    return getMockPlayers(teamIds)
  } catch (error) {
    console.error("Error fetching players:", error)
    // Return mock data on error
    return getMockPlayers(teamIds)
  }
}

// Generate prediction based on match data
export async function generatePrediction(matchData) {
  try {
    console.log("Generating prediction for match data:", matchData)

    if (!matchData) {
      throw new Error("Match data is required")
    }

    // Extract team IDs from match data
    const team1Id = matchData.team1Id
    const team2Id = matchData.team2Id

    if (!team1Id || !team2Id) {
      throw new Error("Team IDs are required")
    }

    // Get team data
    const teams = await fetchTeams()
    const team1 = teams.find((t) => t.id === team1Id) || { name: "Team 1" }
    const team2 = teams.find((t) => t.id === team2Id) || { name: "Team 2" }

    // Generate random win probabilities
    const team1WinProb = Math.floor(Math.random() * 60) + 20 // 20-80%
    const team2WinProb = Math.floor(Math.random() * (95 - team1WinProb)) + 5 // Remaining probability minus tie chance
    const tieProb = 100 - team1WinProb - team2WinProb

    // Create prediction object
    const prediction = {
      teams: {
        team1: team1.name,
        team2: team2.name,
      },
      winProbability: {
        team1: team1WinProb,
        team2: team2WinProb,
        tie: tieProb,
      },
      insights: [
        `${team1.name} have a strong record at this venue.`,
        `${team2.name} have won 3 of the last 5 encounters.`,
        "Dew factor is expected to play a significant role in the second innings.",
      ],
      firstInnings: {
        projectedScore: "180-200",
        keyPhases: [
          { name: "Powerplay (1-6)", runs: `${45 + Math.floor(Math.random() * 15)}` },
          { name: "Middle Overs (7-15)", runs: `${70 + Math.floor(Math.random() * 20)}` },
          { name: "Death Overs (16-20)", runs: `${50 + Math.floor(Math.random() * 20)}` },
        ],
      },
      secondInnings: {
        chaseSuccessProbability: "55%",
        criticalFactors: ["Wickets in hand", "Required run rate management", "Handling pressure in death overs"],
      },
      pitchAnalysis: {
        pace: 65,
        bounce: 70,
        spin: 55,
        dryness: 60,
        expectedBehavior: [
          "Good bounce and carry for fast bowlers in the first innings",
          "Surface may slow down as the match progresses",
          "Spinners will get assistance in the middle overs",
          "Dew factor will make it easier for batting in the second innings",
          "Average first innings score at this venue is 175",
        ],
      },
    }

    console.log("Prediction generated successfully")
    return prediction
  } catch (error) {
    console.error("Error generating prediction:", error)
    throw error
  }
}

// Mock data functions
function getMockTeams() {
  return [
    { id: "csk", name: "Chennai Super Kings", shortName: "CSK" },
    { id: "mi", name: "Mumbai Indians", shortName: "MI" },
    { id: "rcb", name: "Royal Challengers Bangalore", shortName: "RCB" },
    { id: "kkr", name: "Kolkata Knight Riders", shortName: "KKR" },
    { id: "dc", name: "Delhi Capitals", shortName: "DC" },
    { id: "srh", name: "Sunrisers Hyderabad", shortName: "SRH" },
    { id: "pbks", name: "Punjab Kings", shortName: "PBKS" },
    { id: "rr", name: "Rajasthan Royals", shortName: "RR" },
    { id: "gt", name: "Gujarat Titans", shortName: "GT" },
    { id: "lsg", name: "Lucknow Super Giants", shortName: "LSG" },
  ]
}

function getMockVenues() {
  return [
    { id: "wankhede", name: "Wankhede Stadium", city: "Mumbai" },
    { id: "chepauk", name: "M.A. Chidambaram Stadium", city: "Chennai" },
    { id: "chinnaswamy", name: "M. Chinnaswamy Stadium", city: "Bangalore" },
    { id: "eden", name: "Eden Gardens", city: "Kolkata" },
    { id: "arun_jaitley", name: "Arun Jaitley Stadium", city: "Delhi" },
  ]
}

function getMockPlayers(teamIds = []) {
  const allPlayers = [
    {
      id: "dhoni",
      name: "MS Dhoni",
      teamId: "csk",
      role: "Wicket-keeper",
      formRating: 8.5,
      matchImpact: 9.2,
      keyStat: "SR 150+ in death overs",
    },
    {
      id: "rohit",
      name: "Rohit Sharma",
      teamId: "mi",
      role: "Batsman",
      formRating: 8.2,
      matchImpact: 8.8,
      keyStat: "Avg 45+ vs spin",
    },
    {
      id: "kohli",
      name: "Virat Kohli",
      teamId: "rcb",
      role: "Batsman",
      formRating: 9.0,
      matchImpact: 9.5,
      keyStat: "Consistency in scoring",
    },
    {
      id: "bumrah",
      name: "Jasprit Bumrah",
      teamId: "mi",
      role: "Bowler",
      formRating: 8.8,
      matchImpact: 9.3,
      keyStat: "Economy in death overs",
    },
    {
      id: "jadeja",
      name: "Ravindra Jadeja",
      teamId: "csk",
      role: "All-rounder",
      formRating: 8.6,
      matchImpact: 9.1,
      keyStat: "Wickets and economy",
    },
  ]

  // Filter by team IDs if provided
  if (teamIds && teamIds.length > 0) {
    return allPlayers.filter((player) => teamIds.includes(player.teamId))
  }

  return allPlayers
}
