import { sql } from "@/lib/db"
import { nanoid } from "nanoid"

// Define types for our database entities
export type Team = {
  id: string
  name: string
  shortName: string
  primaryColor?: string
  secondaryColor?: string
  logoUrl?: string
  createdAt?: Date
  updatedAt?: Date
}

export type Player = {
  id: string
  name: string
  teamId: string
  role: string
  battingStyle?: string
  bowlingStyle?: string
  nationality?: string
  formRating?: number
  matchImpact?: number
  keyStat?: string
  createdAt?: Date
  updatedAt?: Date
}

export type Venue = {
  id: string
  name: string
  city: string
  country?: string
  capacity?: number
  pitchType?: string
  avgFirstInningsScore?: number
  avgSecondInningsScore?: number
  highestTotal?: number
  lowestTotal?: number
  avgRunRate?: number
  boundaryPercentage?: number
  battingFirstWinPercentage?: number
  chasingWinPercentage?: number
  createdAt?: Date
  updatedAt?: Date
}

export type Match = {
  id: string
  team1Id: string
  team2Id: string
  venueId: string
  matchDate: Date
  matchType?: string
  matchStatus: string
  tossWinner?: string
  tossDecision?: string
  winner?: string
  margin?: string
  playerOfMatch?: string
  createdAt?: Date
  updatedAt?: Date
}

export type Prediction = {
  id: string
  matchId: string
  team1WinProbability: number
  team2WinProbability: number
  tieProbability: number
  projectedFirstInningsScore?: string
  chaseSuccessProbability?: string
  keyInsights?: string
  firstInningsKeyPhases?: string
  secondInningsCriticalFactors?: string
  createdAt?: Date
  updatedAt?: Date
}

export type HeadToHeadStats = {
  id: string
  team1Id: string
  team2Id: string
  totalMatches: number
  team1Wins: number
  team2Wins: number
  noResults: number
  lastFiveEncounters?: string
  createdAt?: Date
  updatedAt?: Date
}

export type TeamVenueStats = {
  id: string
  teamId: string
  venueId: string
  matchesPlayed: number
  matchesWon: number
  winPercentage: number
  avgScore?: number
  highestScore?: number
  lowestScore?: number
  createdAt?: Date
  updatedAt?: Date
}

export type PlayerMatchups = {
  id: string
  player1Id: string
  player2Id: string
  balls: number
  runs: number
  dismissals: number
  advantage: string
  createdAt?: Date
  updatedAt?: Date
}

// Database schema creation functions
export async function createTeamsTable() {
  return sql`
    CREATE TABLE IF NOT EXISTS teams (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      short_name VARCHAR(10) NOT NULL,
      primary_color VARCHAR(20),
      secondary_color VARCHAR(20),
      logo_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `
}

export async function createVenuesTable() {
  return sql`
    CREATE TABLE IF NOT EXISTS venues (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      city VARCHAR(50) NOT NULL,
      country VARCHAR(50) DEFAULT 'India',
      capacity INTEGER,
      pitch_type VARCHAR(50),
      avg_first_innings_score INTEGER,
      avg_second_innings_score INTEGER,
      highest_total INTEGER,
      lowest_total INTEGER,
      avg_run_rate DECIMAL(4,2),
      boundary_percentage INTEGER,
      batting_first_win_percentage INTEGER,
      chasing_win_percentage INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `
}

export async function createPlayersTable() {
  return sql`
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
}

export async function createMatchesTable() {
  return sql`
    CREATE TABLE IF NOT EXISTS matches (
      id VARCHAR(50) PRIMARY KEY,
      team1_id VARCHAR(50) REFERENCES teams(id),
      team2_id VARCHAR(50) REFERENCES teams(id),
      venue_id VARCHAR(50) REFERENCES venues(id),
      match_date TIMESTAMP WITH TIME ZONE,
      match_type VARCHAR(20) DEFAULT 'T20',
      match_status VARCHAR(20) NOT NULL,
      toss_winner VARCHAR(50),
      toss_decision VARCHAR(20),
      winner VARCHAR(50),
      margin VARCHAR(50),
      player_of_match VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `
}

export async function createPredictionsTable() {
  return sql`
    CREATE TABLE IF NOT EXISTS predictions (
      id VARCHAR(50) PRIMARY KEY,
      match_id VARCHAR(50) REFERENCES matches(id),
      team1_win_probability INTEGER NOT NULL,
      team2_win_probability INTEGER NOT NULL,
      tie_probability INTEGER NOT NULL,
      projected_first_innings_score VARCHAR(20),
      chase_success_probability VARCHAR(10),
      key_insights JSONB,
      first_innings_key_phases JSONB,
      second_innings_critical_factors JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `
}

export async function createHeadToHeadStatsTable() {
  return sql`
    CREATE TABLE IF NOT EXISTS head_to_head_stats (
      id VARCHAR(50) PRIMARY KEY,
      team1_id VARCHAR(50) REFERENCES teams(id),
      team2_id VARCHAR(50) REFERENCES teams(id),
      total_matches INTEGER NOT NULL,
      team1_wins INTEGER NOT NULL,
      team2_wins INTEGER NOT NULL,
      no_results INTEGER NOT NULL,
      last_five_encounters JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `
}

export async function createTeamVenueStatsTable() {
  return sql`
    CREATE TABLE IF NOT EXISTS team_venue_stats (
      id VARCHAR(50) PRIMARY KEY,
      team_id VARCHAR(50) REFERENCES teams(id),
      venue_id VARCHAR(50) REFERENCES venues(id),
      matches_played INTEGER NOT NULL,
      matches_won INTEGER NOT NULL,
      win_percentage INTEGER NOT NULL,
      avg_score INTEGER,
      highest_score INTEGER,
      lowest_score INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `
}

export async function createPlayerMatchupsTable() {
  return sql`
    CREATE TABLE IF NOT EXISTS player_matchups (
      id VARCHAR(50) PRIMARY KEY,
      player1_id VARCHAR(50) REFERENCES players(id),
      player2_id VARCHAR(50) REFERENCES players(id),
      balls INTEGER NOT NULL,
      runs INTEGER NOT NULL,
      dismissals INTEGER NOT NULL,
      advantage VARCHAR(20) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `
}

// Helper function to create all tables
export async function createAllTables() {
  try {
    await createTeamsTable()
    await createVenuesTable()
    await createPlayersTable()
    await createMatchesTable()
    await createPredictionsTable()
    await createHeadToHeadStatsTable()
    await createTeamVenueStatsTable()
    await createPlayerMatchupsTable()
    return { success: true, message: "All tables created successfully" }
  } catch (error) {
    console.error("Error creating tables:", error)
    return { success: false, message: `Error creating tables: ${error.message}` }
  }
}

// Helper functions for database operations
export const teams = {
  // Convert database row to Team object
  fromRow: (row: any): Team => ({
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    logoUrl: row.logo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),

  // Convert Team object to database row
  toRow: (team: Team) => ({
    id: team.id || nanoid(),
    name: team.name,
    short_name: team.shortName,
    primary_color: team.primaryColor,
    secondary_color: team.secondaryColor,
    logo_url: team.logoUrl,
    created_at: team.createdAt || new Date(),
    updated_at: team.updatedAt || new Date(),
  }),
}

export const players = {
  // Convert database row to Player object
  fromRow: (row: any): Player => ({
    id: row.id,
    name: row.name,
    teamId: row.team_id,
    role: row.role,
    battingStyle: row.batting_style,
    bowlingStyle: row.bowling_style,
    nationality: row.nationality,
    formRating: row.form_rating,
    matchImpact: row.match_impact,
    keyStat: row.key_stat,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),

  // Convert Player object to database row
  toRow: (player: Player) => ({
    id: player.id || nanoid(),
    name: player.name,
    team_id: player.teamId,
    role: player.role,
    batting_style: player.battingStyle,
    bowling_style: player.bowlingStyle,
    nationality: player.nationality,
    form_rating: player.formRating,
    match_impact: player.matchImpact,
    key_stat: player.keyStat,
    created_at: player.createdAt || new Date(),
    updated_at: player.updatedAt || new Date(),
  }),
}

export const venues = {
  // Convert database row to Venue object
  fromRow: (row: any): Venue => ({
    id: row.id,
    name: row.name,
    city: row.city,
    country: row.country,
    capacity: row.capacity,
    pitchType: row.pitch_type,
    avgFirstInningsScore: row.avg_first_innings_score,
    avgSecondInningsScore: row.avg_second_innings_score,
    highestTotal: row.highest_total,
    lowestTotal: row.lowest_total,
    avgRunRate: row.avg_run_rate,
    boundaryPercentage: row.boundary_percentage,
    battingFirstWinPercentage: row.batting_first_win_percentage,
    chasingWinPercentage: row.chasing_win_percentage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),

  // Convert Venue object to database row
  toRow: (venue: Venue) => ({
    id: venue.id || nanoid(),
    name: venue.name,
    city: venue.city,
    country: venue.country || "India",
    capacity: venue.capacity,
    pitch_type: venue.pitchType,
    avg_first_innings_score: venue.avgFirstInningsScore,
    avg_second_innings_score: venue.avgSecondInningsScore,
    highest_total: venue.highestTotal,
    lowest_total: venue.lowestTotal,
    avg_run_rate: venue.avgRunRate,
    boundary_percentage: venue.boundaryPercentage,
    batting_first_win_percentage: venue.battingFirstWinPercentage,
    chasing_win_percentage: venue.chasingWinPercentage,
    created_at: venue.createdAt || new Date(),
    updated_at: venue.updatedAt || new Date(),
  }),
}

export const matches = {
  // Convert database row to Match object
  fromRow: (row: any): Match => ({
    id: row.id,
    team1Id: row.team1_id,
    team2Id: row.team2_id,
    venueId: row.venue_id,
    matchDate: row.match_date,
    matchType: row.match_type,
    matchStatus: row.match_status,
    tossWinner: row.toss_winner,
    tossDecision: row.toss_decision,
    winner: row.winner,
    margin: row.margin,
    playerOfMatch: row.player_of_match,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),

  // Convert Match object to database row
  toRow: (match: Match) => ({
    id: match.id || nanoid(),
    team1_id: match.team1Id,
    team2_id: match.team2Id,
    venue_id: match.venueId,
    match_date: match.matchDate,
    match_type: match.matchType || "T20",
    match_status: match.matchStatus,
    toss_winner: match.tossWinner,
    toss_decision: match.tossDecision,
    winner: match.winner,
    margin: match.margin,
    player_of_match: match.playerOfMatch,
    created_at: match.createdAt || new Date(),
    updated_at: match.updatedAt || new Date(),
  }),
}

export const predictions = {
  // Convert database row to Prediction object
  fromRow: (row: any): Prediction => ({
    id: row.id,
    matchId: row.match_id,
    team1WinProbability: row.team1_win_probability,
    team2WinProbability: row.team2_win_probability,
    tieProbability: row.tie_probability,
    projectedFirstInningsScore: row.projected_first_innings_score,
    chaseSuccessProbability: row.chase_success_probability,
    keyInsights: row.key_insights,
    firstInningsKeyPhases: row.first_innings_key_phases,
    secondInningsCriticalFactors: row.second_innings_critical_factors,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),

  // Convert Prediction object to database row
  toRow: (prediction: Prediction) => ({
    id: prediction.id || nanoid(),
    match_id: prediction.matchId,
    team1_win_probability: prediction.team1WinProbability,
    team2_win_probability: prediction.team2WinProbability,
    tie_probability: prediction.tieProbability,
    projected_first_innings_score: prediction.projectedFirstInningsScore,
    chase_success_probability: prediction.chaseSuccessProbability,
    key_insights: prediction.keyInsights,
    first_innings_key_phases: prediction.firstInningsKeyPhases,
    second_innings_critical_factors: prediction.secondInningsCriticalFactors,
    created_at: prediction.createdAt || new Date(),
    updated_at: prediction.updatedAt || new Date(),
  }),
}
