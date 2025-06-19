import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { nanoid } from "nanoid"
import { findOrCreateMatch } from "./match-service"

// Get the database URL from environment variables
const getDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL

  if (!dbUrl) {
    console.error("No database URL found in environment variables")
    return null
  }

  return dbUrl
}

// Initialize Neon SQL instance
const createSqlClient = () => {
  try {
    const dbUrl = getDatabaseUrl()
    if (!dbUrl) return null
    return neon(dbUrl)
  } catch (error) {
    console.error("Failed to initialize database connection:", error)
    return null
  }
}

// Initialize the SQL client
export const sql = createSqlClient()

// Initialize drizzle with the Neon client
export const db = sql ? drizzle(sql) : null

// Mock data for fallback
const mockTeams = [
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

const mockVenues = [
  {
    id: "wankhede",
    name: "Wankhede Stadium",
    city: "Mumbai",
    country: "India",
    capacity: 33000,
    pitchType: "Batting friendly",
    avgFirstInningsScore: 175,
    avgSecondInningsScore: 165,
    battingFirstWinPercentage: 45,
    chasingWinPercentage: 55,
  },
  {
    id: "chepauk",
    name: "M.A. Chidambaram Stadium",
    city: "Chennai",
    country: "India",
    capacity: 50000,
    pitchType: "Spin friendly",
    avgFirstInningsScore: 165,
    avgSecondInningsScore: 155,
    battingFirstWinPercentage: 55,
    chasingWinPercentage: 45,
  },
  // Add more venues as needed
]

// Export a function to test the database connection
export const testConnection = async () => {
  try {
    if (!sql) {
      return {
        success: false,
        message: "Database client not initialized",
        error: "No database URL provided",
      }
    }

    // Simple query to test connection
    const result = await sql`SELECT 1 as connected`
    return { success: true, message: "Database connection successful" }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Helper function to check if a table exists
export const tableExists = async (tableName: string) => {
  try {
    if (!sql) return false

    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    `
    return result[0]?.exists || false
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

// Helper function to get table row count
export const getTableRowCount = async (tableName: string) => {
  try {
    if (!sql) return 0
    if (!(await tableExists(tableName))) {
      return 0
    }

    const result = await sql.unsafe(`SELECT COUNT(*) FROM ${tableName}`)
    return Number.parseInt(result[0]?.count || "0", 10)
  } catch (error) {
    console.error(`Error getting row count for table ${tableName}:`, error)
    return 0
  }
}

// Function to fetch teams from the database
export async function fetchTeams() {
  try {
    if (!sql) return mockTeams

    // Check if teams table exists
    if (!(await tableExists("teams"))) {
      console.log("Teams table does not exist, returning mock data")
      return mockTeams
    }

    // Fetch teams from database
    const teams = await sql`SELECT * FROM teams ORDER BY name`

    if (teams && teams.length > 0) {
      return teams
    }

    // Return mock data if no teams found
    return mockTeams
  } catch (error) {
    console.error("Error fetching teams:", error)
    return mockTeams
  }
}

// Function to fetch venues from the database
export async function fetchVenues() {
  try {
    if (!sql) return mockVenues

    // Check if venues table exists
    if (!(await tableExists("venues"))) {
      console.log("Venues table does not exist, returning mock data")
      return mockVenues
    }

    // Fetch venues from database
    const venues = await sql`SELECT * FROM venues ORDER BY name`

    if (venues && venues.length > 0) {
      return venues
    }

    // Return mock data if no venues found
    return mockVenues
  } catch (error) {
    console.error("Error fetching venues:", error)
    return mockVenues
  }
}

// Function to fetch players from the database
export async function fetchPlayers(teamIds = []) {
  try {
    if (!sql) return []

    // Check if players table exists
    if (!(await tableExists("players"))) {
      console.log("Players table does not exist, returning empty array")
      return []
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

    return players || []
  } catch (error) {
    console.error("Error fetching players:", error)
    return []
  }
}

// Function to fetch match data
export async function fetchMatchData(team1Id, team2Id, venueName, matchDate) {
  try {
    if (!sql) {
      return {
        team1Id,
        team2Id,
        venue: venueName,
        date: matchDate || new Date(),
      }
    }

    // Get team data
    const teams = await fetchTeams()
    const team1 = teams.find((t) => t.id === team1Id)
    const team2 = teams.find((t) => t.id === team2Id)

    if (!team1 || !team2) {
      throw new Error("Team data not found")
    }

    // Use the new findOrCreateMatch function to handle match and venue creation
    const match = await findOrCreateMatch(team1Id, team2Id, venueName, matchDate || new Date())

    // Return match data with team information
    return {
      id: match.id,
      team1Id,
      team2Id,
      venueId: match.venueId,
      venue: match.venueName,
      date: match.date,
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

// Function to generate predictions
export async function generatePredictions(matchData, isLiveUpdate = false) {
  try {
    if (!matchData) {
      throw new Error("Match data is required")
    }

    // Extract team IDs from match data
    const team1Id = matchData.team1Id
    const team2Id = matchData.team2Id
    const venueName = matchData.venue

    if (!team1Id || !team2Id) {
      throw new Error("Team IDs are required")
    }

    // Get team data
    const teams = await fetchTeams()
    const team1 = teams.find((t) => t.id === team1Id) || { name: "Team 1" }
    const team2 = teams.find((t) => t.id === team2Id) || { name: "Team 2" }

    // Generate random win probabilities
    const team1WinProb = Math.floor(Math.random() * 60) + 20
    const team2WinProb = Math.floor(Math.random() * (95 - team1WinProb)) + 5
    const tieProb = 100 - team1WinProb - team2WinProb

    // Ensure match exists in database
    let matchId = matchData.id

    if (!matchId && sql) {
      try {
        // Create or get match
        const match = await findOrCreateMatch(team1Id, team2Id, venueName, matchData.date || new Date())
        matchId = match.id
        console.log(`Using match ID: ${matchId} for prediction`)
      } catch (error) {
        console.error("Error creating match record:", error)
        // Continue with prediction generation even if match creation fails
      }
    }

    // Check if prediction already exists in database
    let existingPrediction
    if (matchId && sql && (await tableExists("predictions"))) {
      existingPrediction = await sql`
        SELECT * FROM predictions WHERE match_id = ${matchId} LIMIT 1
      `

      if (existingPrediction && existingPrediction.length > 0 && !isLiveUpdate) {
        // Parse JSON fields if they exist
        const prediction = existingPrediction[0]
        const keyInsights = prediction.key_insights ? JSON.parse(prediction.key_insights) : []
        const firstInningsKeyPhases = prediction.first_innings_key_phases
          ? JSON.parse(prediction.first_innings_key_phases)
          : []
        const secondInningsCriticalFactors = prediction.second_innings_critical_factors
          ? JSON.parse(prediction.second_innings_critical_factors)
          : []

        return {
          teams: {
            team1: team1.name,
            team2: team2.name,
          },
          winProbability: {
            team1: prediction.team1_win_probability || team1WinProb,
            team2: prediction.team2_win_probability || team2WinProb,
            tie: prediction.tie_probability || tieProb,
          },
          insights:
            keyInsights.length > 0
              ? keyInsights
              : [
                  `${team1.name} have a strong record at this venue.`,
                  `${team2.name} have won 3 of the last 5 encounters.`,
                ],
          firstInnings: {
            projectedScore: prediction.projected_first_innings_score || "180-200",
            keyPhases:
              firstInningsKeyPhases.length > 0 ? firstInningsKeyPhases : ["Powerplay", "Middle Overs", "Death Overs"],
          },
          secondInnings: {
            chaseSuccessProbability: prediction.chase_success_probability || "55%",
            criticalFactors:
              secondInningsCriticalFactors.length > 0
                ? secondInningsCriticalFactors
                : ["Wickets in hand", "Run rate", "Partnerships"],
          },
        }
      }
    }

    // Generate new prediction
    const keyInsights = [
      `${team1.name} have a strong record at this venue.`,
      `${team2.name} have won 3 of the last 5 encounters.`,
      "Dew factor is expected to play a significant role in the second innings.",
    ]

    const firstInningsKeyPhases = [
      { name: "Powerplay (1-6)", runs: `${45 + Math.floor(Math.random() * 15)}` },
      { name: "Middle Overs (7-15)", runs: `${70 + Math.floor(Math.random() * 20)}` },
      { name: "Death Overs (16-20)", runs: `${50 + Math.floor(Math.random() * 20)}` },
    ]

    const secondInningsCriticalFactors = [
      "Wickets in hand",
      "Required run rate management",
      "Handling pressure in death overs",
    ]

    // Save prediction to database if possible
    if (matchId && sql && (await tableExists("predictions"))) {
      try {
        // Check if a prediction already exists for this match
        const existingPrediction = await sql`
          SELECT id FROM predictions WHERE match_id = ${matchId}
        `

        const predictionId = nanoid()

        if (existingPrediction && existingPrediction.length > 0) {
          // Update existing prediction
          await sql`
            UPDATE predictions SET
              team1_win_probability = ${team1WinProb},
              team2_win_probability = ${team2WinProb},
              tie_probability = ${tieProb},
              projected_first_innings_score = ${"180-200"},
              chase_success_probability = ${"55%"},
              key_insights = ${JSON.stringify(keyInsights)},
              first_innings_key_phases = ${JSON.stringify(firstInningsKeyPhases)},
              second_innings_critical_factors = ${JSON.stringify(secondInningsCriticalFactors)},
              updated_at = NOW()
            WHERE match_id = ${matchId}
          `
        } else {
          // Insert new prediction
          await sql`
            INSERT INTO predictions (
              id, match_id, team1_win_probability, team2_win_probability, tie_probability,
              projected_first_innings_score, chase_success_probability,
              key_insights, first_innings_key_phases, second_innings_critical_factors,
              created_at, updated_at
            ) VALUES (
              ${predictionId}, ${matchId}, ${team1WinProb}, ${team2WinProb}, ${tieProb},
              ${"180-200"}, ${"55%"},
              ${JSON.stringify(keyInsights)}, ${JSON.stringify(firstInningsKeyPhases)}, ${JSON.stringify(secondInningsCriticalFactors)},
              NOW(), NOW()
            )
          `
        }
      } catch (error) {
        console.error("Error saving prediction to database:", error)
      }
    }

    return {
      teams: {
        team1: team1.name,
        team2: team2.name,
      },
      winProbability: {
        team1: team1WinProb,
        team2: team2WinProb,
        tie: tieProb,
      },
      insights: keyInsights,
      firstInnings: {
        projectedScore: "180-200",
        keyPhases: firstInningsKeyPhases,
      },
      secondInnings: {
        chaseSuccessProbability: "55%",
        criticalFactors: secondInningsCriticalFactors,
      },
    }
  } catch (error) {
    console.error("Error generating predictions:", error)

    // Return basic prediction on error
    return {
      teams: {
        team1: "Team 1",
        team2: "Team 2",
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
  }
}

// Function for backward compatibility
export async function generatePrediction(matchData) {
  return generatePredictions(matchData)
}

// Function to initialize database
export async function initializeDatabase() {
  try {
    if (!sql) {
      return {
        success: false,
        message: "Database client not initialized. Check your environment variables.",
      }
    }

    // Create Teams table
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        short_name VARCHAR(10) NOT NULL,
        logo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create Venues table
    await sql`
      CREATE TABLE IF NOT EXISTS venues (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        city VARCHAR(50) NOT NULL,
        country VARCHAR(50) DEFAULT 'India',
        capacity INTEGER,
        pitch_type VARCHAR(50),
        avg_first_innings_score INTEGER,
        avg_second_innings_score INTEGER,
        batting_first_win_percentage INTEGER,
        chasing_win_percentage INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create Players table
    await sql`
      CREATE TABLE IF NOT EXISTS players (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        team_id VARCHAR(50) REFERENCES teams(id),
        role VARCHAR(50) NOT NULL,
        batting_style VARCHAR(50),
        bowling_style VARCHAR(50),
        nationality VARCHAR(50),
        form_rating DECIMAL(3,1),
        match_impact DECIMAL(3,1),
        key_stat TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create Matches table
    await sql`
      CREATE TABLE IF NOT EXISTS matches (
        id VARCHAR(50) PRIMARY KEY,
        team1_id VARCHAR(50) REFERENCES teams(id),
        team2_id VARCHAR(50) REFERENCES teams(id),
        venue_id VARCHAR(50) REFERENCES venues(id),
        match_date TIMESTAMP WITH TIME ZONE,
        toss_winner_id VARCHAR(50) REFERENCES teams(id),
        toss_decision VARCHAR(10),
        match_result TEXT,
        winner_id VARCHAR(50) REFERENCES teams(id),
        match_status VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create Predictions table
    await sql`
      CREATE TABLE IF NOT EXISTS predictions (
        id VARCHAR(50) PRIMARY KEY,
        match_id VARCHAR(50) REFERENCES matches(id),
        team1_win_probability INTEGER,
        team2_win_probability INTEGER,
        tie_probability INTEGER,
        projected_first_innings_score VARCHAR(20),
        chase_success_probability VARCHAR(10),
        key_insights JSONB,
        first_innings_key_phases JSONB,
        second_innings_critical_factors JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_match_prediction UNIQUE (match_id)
      )
    `

    // Seed the database with initial data
    await seedDatabase()

    return { success: true, message: "Database initialized successfully" }
  } catch (error) {
    console.error("Error initializing database:", error)
    return {
      success: false,
      message: `Database initialization failed: ${error.message}`,
    }
  }
}

// Function to seed the database with initial data
async function seedDatabase() {
  try {
    if (!sql) return false

    // Seed teams
    for (const team of mockTeams) {
      await sql`
        INSERT INTO teams (id, name, short_name)
        VALUES (${team.id}, ${team.name}, ${team.shortName})
        ON CONFLICT (id) DO NOTHING
      `
    }

    // Seed venues
    for (const venue of mockVenues) {
      await sql`
        INSERT INTO venues (
          id, name, city, country, capacity, pitch_type, 
          avg_first_innings_score, avg_second_innings_score,
          batting_first_win_percentage, chasing_win_percentage
        )
        VALUES (
          ${venue.id}, ${venue.name}, ${venue.city}, ${venue.country}, 
          ${venue.capacity}, ${venue.pitchType},
          ${venue.avgFirstInningsScore}, ${venue.avgSecondInningsScore},
          ${venue.battingFirstWinPercentage}, ${venue.chasingWinPercentage}
        )
        ON CONFLICT (id) DO NOTHING
      `
    }

    // Seed some sample players
    const samplePlayers = [
      {
        id: "dhoni",
        name: "MS Dhoni",
        teamId: "csk",
        role: "Wicket-keeper",
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm medium",
        nationality: "Indian",
        formRating: 8.5,
        matchImpact: 9.2,
        keyStat: "SR 150+ in death overs",
      },
      {
        id: "rohit",
        name: "Rohit Sharma",
        teamId: "mi",
        role: "Batsman",
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm off break",
        nationality: "Indian",
        formRating: 8.2,
        matchImpact: 8.8,
        keyStat: "Avg 45+ vs spin",
      },
      {
        id: "kohli",
        name: "Virat Kohli",
        teamId: "rcb",
        role: "Batsman",
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm medium",
        nationality: "Indian",
        formRating: 9.0,
        matchImpact: 9.5,
        keyStat: "Consistency in scoring",
      },
      {
        id: "bumrah",
        name: "Jasprit Bumrah",
        teamId: "mi",
        role: "Bowler",
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm fast",
        nationality: "Indian",
        formRating: 8.8,
        matchImpact: 9.3,
        keyStat: "Economy in death overs",
      },
      {
        id: "jadeja",
        name: "Ravindra Jadeja",
        teamId: "csk",
        role: "All-rounder",
        battingStyle: "Left-handed",
        bowlingStyle: "Left-arm orthodox",
        nationality: "Indian",
        formRating: 8.6,
        matchImpact: 9.1,
        keyStat: "Wickets and economy",
      },
    ]

    for (const player of samplePlayers) {
      await sql`
        INSERT INTO players (
          id, name, team_id, role, batting_style, bowling_style,
          nationality, form_rating, match_impact, key_stat
        )
        VALUES (
          ${player.id}, ${player.name}, ${player.teamId}, ${player.role},
          ${player.battingStyle}, ${player.bowlingStyle}, ${player.nationality},
          ${player.formRating}, ${player.matchImpact}, ${player.keyStat}
        )
        ON CONFLICT (id) DO NOTHING
      `
    }

    return true
  } catch (error) {
    console.error("Error seeding database:", error)
    return false
  }
}

// Function to check if database is initialized
export async function checkDbInitialized() {
  try {
    if (!sql) return false

    // Check if teams table exists and has data
    const teamsExist = await tableExists("teams")
    if (!teamsExist) return false

    const teamsCount = await getTableRowCount("teams")
    return teamsCount > 0
  } catch (error) {
    console.error("Error checking if database is initialized:", error)
    return false
  }
}

// Function to backup the database
export async function backupDatabase() {
  try {
    if (!sql) {
      return {
        success: false,
        message: "Database client not initialized. Check your environment variables.",
      }
    }

    // Fetch all data from the database
    const teams = await sql`SELECT * FROM teams`
    const venues = await sql`SELECT * FROM venues`
    const players = await sql`SELECT * FROM players`
    const matches = await sql`SELECT * FROM matches`
    const predictions = await sql`SELECT * FROM predictions`

    // Create a backup object
    const backup = {
      timestamp: new Date().toISOString(),
      teams,
      venues,
      players,
      matches,
      predictions,
    }

    return { success: true, data: backup }
  } catch (error) {
    console.error("Error creating database backup:", error)
    return {
      success: false,
      message: `Failed to create backup: ${error.message}`,
    }
  }
}

// Function to restore the database
export async function restoreDatabase(backup) {
  try {
    if (!sql) {
      return {
        success: false,
        message: "Database client not initialized. Check your environment variables.",
      }
    }

    if (!backup || !backup.teams) {
      return {
        success: false,
        message: "Invalid backup data",
      }
    }

    // Clear existing data
    await sql`DELETE FROM predictions`
    await sql`DELETE FROM matches`
    await sql`DELETE FROM players`
    await sql`DELETE FROM venues`
    await sql`DELETE FROM teams`

    // Restore teams
    for (const team of backup.teams) {
      await sql`
        INSERT INTO teams (id, name, short_name, logo_url, created_at, updated_at)
        VALUES (
          ${team.id}, ${team.name}, ${team.short_name}, ${team.logo_url},
          ${team.created_at || new Date()}, ${team.updated_at || new Date()}
        )
      `
    }

    // Restore venues
    for (const venue of backup.venues) {
      await sql`
        INSERT INTO venues (
          id, name, city, country, capacity, pitch_type, 
          avg_first_innings_score, avg_second_innings_score,
          batting_first_win_percentage, chasing_win_percentage,
          created_at, updated_at
        )
        VALUES (
          ${venue.id}, ${venue.name}, ${venue.city}, ${venue.country || "India"}, 
          ${venue.capacity}, ${venue.pitch_type},
          ${venue.avg_first_innings_score}, ${venue.avg_second_innings_score},
          ${venue.batting_first_win_percentage}, ${venue.chasing_win_percentage},
          ${venue.created_at || new Date()}, ${venue.updated_at || new Date()}
        )
      `
    }

    // Restore players
    for (const player of backup.players) {
      await sql`
        INSERT INTO players (
          id, name, team_id, role, batting_style, bowling_style,
          nationality, form_rating, match_impact, key_stat,
          created_at, updated_at
        )
        VALUES (
          ${player.id}, ${player.name}, ${player.team_id}, ${player.role},
          ${player.batting_style}, ${player.bowling_style}, ${player.nationality},
          ${player.form_rating}, ${player.match_impact}, ${player.key_stat},
          ${player.created_at || new Date()}, ${player.updated_at || new Date()}
        )
      `
    }

    // Restore matches
    if (backup.matches) {
      for (const match of backup.matches) {
        await sql`
          INSERT INTO matches (
            id, team1_id, team2_id, venue_id, match_date,
            toss_winner_id, toss_decision, match_result, winner_id, match_status,
            created_at, updated_at
          )
          VALUES (
            ${match.id}, ${match.team1_id}, ${match.team2_id}, ${match.venue_id}, 
            ${match.match_date || new Date()},
            ${match.toss_winner_id}, ${match.toss_decision}, ${match.match_result}, 
            ${match.winner_id}, ${match.match_status},
            ${match.created_at || new Date()}, ${match.updated_at || new Date()}
          )
        `
      }
    }

    // Restore predictions
    if (backup.predictions) {
      for (const prediction of backup.predictions) {
        await sql`
          INSERT INTO predictions (
            id, match_id, team1_win_probability, team2_win_probability, tie_probability,
            projected_first_innings_score, chase_success_probability,
            key_insights, first_innings_key_phases, second_innings_critical_factors,
            created_at, updated_at
          )
          VALUES (
            ${prediction.id}, ${prediction.match_id}, 
            ${prediction.team1_win_probability}, ${prediction.team2_win_probability}, ${prediction.tie_probability},
            ${prediction.projected_first_innings_score}, ${prediction.chase_success_probability},
            ${prediction.key_insights}, ${prediction.first_innings_key_phases}, ${prediction.second_innings_critical_factors},
            ${prediction.created_at || new Date()}, ${prediction.updated_at || new Date()}
          )
        `
      }
    }

    return { success: true, message: "Database restored successfully" }
  } catch (error) {
    console.error("Error restoring database:", error)
    return {
      success: false,
      message: `Failed to restore database: ${error.message}`,
    }
  }
}

// Additional helper functions for CRUD operations
export async function createTeam(team) {
  try {
    if (!sql) return { success: false, message: "Database client not initialized" }

    const id = team.id || nanoid()
    const result = await sql`
      INSERT INTO teams (id, name, short_name, logo_url, created_at, updated_at)
      VALUES (
        ${id}, ${team.name}, ${team.shortName}, ${team.logoUrl},
        NOW(), NOW()
      )
      RETURNING *
    `

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating team:", error)
    return { success: false, message: `Failed to create team: ${error.message}` }
  }
}

export async function updateTeam(id, team) {
  try {
    if (!sql) return { success: false, message: "Database client not initialized" }

    const result = await sql`
      UPDATE teams
      SET 
        name = COALESCE(${team.name}, name),
        short_name = COALESCE(${team.shortName}, short_name),
        logo_url = COALESCE(${team.logoUrl}, logo_url),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return { success: false, message: "Team not found" }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating team:", error)
    return { success: false, message: `Failed to update team: ${error.message}` }
  }
}

export async function deleteTeam(id) {
  try {
    if (!sql) return { success: false, message: "Database client not initialized" }

    // Check if team has related records
    const players = await sql`SELECT COUNT(*) FROM players WHERE team_id = ${id}`
    const matches1 = await sql`SELECT COUNT(*) FROM matches WHERE team1_id = ${id}`
    const matches2 = await sql`SELECT COUNT(*) FROM matches WHERE team2_id = ${id}`

    if (
      Number.parseInt(players[0].count) > 0 ||
      Number.parseInt(matches1[0].count) > 0 ||
      Number.parseInt(matches2[0].count) > 0
    ) {
      return {
        success: false,
        message: "Cannot delete team with related records. Delete players and matches first.",
      }
    }

    const result = await sql`DELETE FROM teams WHERE id = ${id} RETURNING *`

    if (result.length === 0) {
      return { success: false, message: "Team not found" }
    }

    return { success: true, message: "Team deleted successfully" }
  } catch (error) {
    console.error("Error deleting team:", error)
    return { success: false, message: `Failed to delete team: ${error.message}` }
  }
}

export async function createPlayer(player) {
  try {
    if (!sql) return { success: false, message: "Database client not initialized" }

    const id = player.id || nanoid()
    const result = await sql`
      INSERT INTO players (
        id, name, team_id, role, batting_style, bowling_style,
        nationality, form_rating, match_impact, key_stat,
        created_at, updated_at
      )
      VALUES (
        ${id}, ${player.name}, ${player.teamId}, ${player.role},
        ${player.battingStyle}, ${player.bowlingStyle}, ${player.nationality},
        ${player.formRating}, ${player.matchImpact}, ${player.keyStat},
        NOW(), NOW()
      )
      RETURNING *
    `

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating player:", error)
    return { success: false, message: `Failed to create player: ${error.message}` }
  }
}

export async function updatePlayer(id, player) {
  try {
    if (!sql) return { success: false, message: "Database client not initialized" }

    const result = await sql`
      UPDATE players
      SET 
        name = COALESCE(${player.name}, name),
        team_id = COALESCE(${player.teamId}, team_id),
        role = COALESCE(${player.role}, role),
        batting_style = COALESCE(${player.battingStyle}, batting_style),
        bowling_style = COALESCE(${player.bowlingStyle}, bowling_style),
        nationality = COALESCE(${player.nationality}, nationality),
        form_rating = COALESCE(${player.formRating}, form_rating),
        match_impact = COALESCE(${player.matchImpact}, match_impact),
        key_stat = COALESCE(${player.keyStat}, key_stat),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return { success: false, message: "Player not found" }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating player:", error)
    return { success: false, message: `Failed to update player: ${error.message}` }
  }
}

export async function deletePlayer(id) {
  try {
    if (!sql) return { success: false, message: "Database client not initialized" }

    const result = await sql`DELETE FROM players WHERE id = ${id} RETURNING *`

    if (result.length === 0) {
      return { success: false, message: "Player not found" }
    }

    return { success: true, message: "Player deleted successfully" }
  } catch (error) {
    console.error("Error deleting player:", error)
    return { success: false, message: `Failed to delete player: ${error.message}` }
  }
}

export async function saveAnalysis(userId, name, matchId, predictionData) {
  try {
    if (!sql) return { success: false, message: "Database client not initialized" }

    // Check if saved_analyses table exists
    if (!(await tableExists("saved_analyses"))) {
      await sql`
        CREATE TABLE IF NOT EXISTS saved_analyses (
          id VARCHAR(50) PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL,
          name VARCHAR(100) NOT NULL,
          match_id VARCHAR(50) REFERENCES matches(id),
          prediction_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
    }

    const id = nanoid()
    const result = await sql`
      INSERT INTO saved_analyses (id, user_id, name, match_id, prediction_data, created_at, updated_at)
      VALUES (
        ${id}, ${userId}, ${name}, ${matchId}, ${predictionData},
        NOW(), NOW()
      )
      RETURNING *
    `

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error saving analysis:", error)
    return { success: false, message: `Failed to save analysis: ${error.message}` }
  }
}

export async function getSavedAnalyses(userId) {
  try {
    if (!sql) return { success: false, message: "Database client not initialized" }

    // Check if saved_analyses table exists
    if (!(await tableExists("saved_analyses"))) {
      return { success: true, data: [] }
    }

    const analyses = await sql`
      SELECT * FROM saved_analyses
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return { success: true, data: analyses }
  } catch (error) {
    console.error("Error fetching saved analyses:", error)
    return { success: false, message: `Failed to fetch saved analyses: ${error.message}` }
  }
}

export async function deleteSavedAnalysis(id, userId) {
  try {
    if (!sql) return { success: false, message: "Database client not initialized" }

    const result = await sql`
      DELETE FROM saved_analyses 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `

    if (result.length === 0) {
      return { success: false, message: "Analysis not found or you don't have permission to delete it" }
    }

    return { success: true, message: "Analysis deleted successfully" }
  } catch (error) {
    console.error("Error deleting saved analysis:", error)
    return { success: false, message: `Failed to delete saved analysis: ${error.message}` }
  }
}
