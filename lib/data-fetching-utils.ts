/**
 * Utility functions for data fetching, validation, and testing
 */

import { sql } from "@/lib/db"

// Data validation types
export type ValidationResult = {
  valid: boolean
  errors: string[]
}

export type FetchResult<T> = {
  success: boolean
  data: T | null
  source: "database" | "mock" | "fallback" | "error"
  message?: string
  timestamp: string
}

// Validation functions
export function validateTeam(team: any): ValidationResult {
  const errors: string[] = []

  if (!team) {
    return { valid: false, errors: ["Team is null or undefined"] }
  }

  if (!team.id) errors.push("Team ID is missing")
  if (!team.name) errors.push("Team name is missing")
  if (!team.shortName && !team.short_name) errors.push("Team short name is missing")

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateVenue(venue: any): ValidationResult {
  const errors: string[] = []

  if (!venue) {
    return { valid: false, errors: ["Venue is null or undefined"] }
  }

  if (!venue.id) errors.push("Venue ID is missing")
  if (!venue.name) errors.push("Venue name is missing")
  if (!venue.city) errors.push("Venue city is missing")

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validatePlayer(player: any): ValidationResult {
  const errors: string[] = []

  if (!player) {
    return { valid: false, errors: ["Player is null or undefined"] }
  }

  if (!player.id) errors.push("Player ID is missing")
  if (!player.name) errors.push("Player name is missing")
  if (!player.role) errors.push("Player role is missing")

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateMatchData(matchData: any): ValidationResult {
  const errors: string[] = []

  if (!matchData) {
    return { valid: false, errors: ["Match data is null or undefined"] }
  }

  if (!matchData.team1Id && !matchData.team1_id) errors.push("Team 1 ID is missing")
  if (!matchData.team2Id && !matchData.team2_id) errors.push("Team 2 ID is missing")
  if (!matchData.venueId && !matchData.venue_id && !matchData.venue_name) errors.push("Venue information is missing")

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Data fetching test utilities
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}

export async function testTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    `
    return result && result.length > 0 && result[0].exists === true
  } catch (error) {
    console.error(`Test for table ${tableName} existence failed:`, error)
    return false
  }
}

// Data monitoring utilities
export function logDataFetch<T>(functionName: string, params: Record<string, any>, result: FetchResult<T>): void {
  console.log(`[${new Date().toISOString()}] ${functionName}:`, {
    params,
    success: result.success,
    source: result.source,
    dataSize: result.data ? (Array.isArray(result.data) ? result.data.length : 1) : 0,
    message: result.message,
    timestamp: result.timestamp,
  })
}

// Data dependency tracking
export const dataDependencies = {
  teams: new Set<string>(),
  venues: new Set<string>(),
  players: new Set<string>(),

  trackDependency(type: "teams" | "venues" | "players", id: string) {
    this[type].add(id)
  },

  getDependencies(type: "teams" | "venues" | "players"): string[] {
    return Array.from(this[type])
  },

  clearDependencies(type?: "teams" | "venues" | "players") {
    if (type) {
      this[type].clear()
    } else {
      this.teams.clear()
      this.venues.clear()
      this.players.clear()
    }
  },
}

// Retry mechanism for data fetching
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number
    delay?: number
    onRetry?: (attempt: number, error: any) => void
  } = {},
): Promise<T> {
  const { retries = 3, delay = 500, onRetry } = options

  let lastError: any

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt <= retries) {
        if (onRetry) {
          onRetry(attempt, error)
        }

        await new Promise((resolve) => setTimeout(resolve, delay * attempt))
      }
    }
  }

  throw lastError
}
