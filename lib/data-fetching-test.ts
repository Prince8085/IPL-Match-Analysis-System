/**
 * Test utilities for data fetching mechanisms
 */

import { testDatabaseConnection, testTableExists } from "./data-fetching-utils"
import {
  getTeamsEnhanced,
  getVenuesEnhanced,
  fetchPlayersEnhanced,
  fetchMatchDataEnhanced,
  generatePredictionsEnhanced,
} from "./data-service-enhanced"

export async function runDataFetchingTests() {
  console.log("=== Running Data Fetching Tests ===")
  const results = {
    databaseConnection: false,
    tablesExist: {
      teams: false,
      venues: false,
      players: false,
    },
    dataFetching: {
      teams: false,
      venues: false,
      players: false,
      matchData: false,
      predictions: false,
    },
    errors: [],
  }

  try {
    // Test database connection
    console.log("Testing database connection...")
    results.databaseConnection = await testDatabaseConnection()
    console.log(`Database connection: ${results.databaseConnection ? "SUCCESS" : "FAILED"}`)

    // Test table existence
    console.log("Testing table existence...")
    results.tablesExist.teams = await testTableExists("teams")
    results.tablesExist.venues = await testTableExists("venues")
    results.tablesExist.players = await testTableExists("players")

    console.log(`Teams table exists: ${results.tablesExist.teams ? "YES" : "NO"}`)
    console.log(`Venues table exists: ${results.tablesExist.venues ? "YES" : "NO"}`)
    console.log(`Players table exists: ${results.tablesExist.players ? "YES" : "NO"}`)

    // Test data fetching
    console.log("Testing data fetching...")

    // Test teams fetching
    try {
      console.log("Testing teams fetching...")
      const teamsResult = await getTeamsEnhanced()
      results.dataFetching.teams = teamsResult.success && Array.isArray(teamsResult.data) && teamsResult.data.length > 0
      console.log(`Teams fetching: ${results.dataFetching.teams ? "SUCCESS" : "FAILED"}`)
      console.log(`Source: ${teamsResult.source}, Count: ${teamsResult.data?.length || 0}`)
    } catch (error) {
      results.errors.push(`Teams fetching error: ${error.message}`)
      console.error("Teams fetching error:", error)
    }

    // Test venues fetching
    try {
      console.log("Testing venues fetching...")
      const venuesResult = await getVenuesEnhanced()
      results.dataFetching.venues =
        venuesResult.success && Array.isArray(venuesResult.data) && venuesResult.data.length > 0
      console.log(`Venues fetching: ${results.dataFetching.venues ? "SUCCESS" : "FAILED"}`)
      console.log(`Source: ${venuesResult.source}, Count: ${venuesResult.data?.length || 0}`)
    } catch (error) {
      results.errors.push(`Venues fetching error: ${error.message}`)
      console.error("Venues fetching error:", error)
    }

    // Test players fetching
    try {
      console.log("Testing players fetching...")
      const playersResult = await fetchPlayersEnhanced()
      results.dataFetching.players =
        playersResult.success && Array.isArray(playersResult.data) && playersResult.data.length > 0
      console.log(`Players fetching: ${results.dataFetching.players ? "SUCCESS" : "FAILED"}`)
      console.log(`Source: ${playersResult.source}, Count: ${playersResult.data?.length || 0}`)
    } catch (error) {
      results.errors.push(`Players fetching error: ${error.message}`)
      console.error("Players fetching error:", error)
    }

    // Test match data fetching
    try {
      console.log("Testing match data fetching...")
      const matchDataResult = await fetchMatchDataEnhanced("1", "2", "Wankhede Stadium")
      results.dataFetching.matchData = matchDataResult.success && matchDataResult.data !== null
      console.log(`Match data fetching: ${results.dataFetching.matchData ? "SUCCESS" : "FAILED"}`)
      console.log(`Source: ${matchDataResult.source}`)
    } catch (error) {
      results.errors.push(`Match data fetching error: ${error.message}`)
      console.error("Match data fetching error:", error)
    }

    // Test predictions generation
    try {
      console.log("Testing predictions generation...")
      const matchData = {
        team1Id: "1",
        team2Id: "2",
        venueId: "1",
        team1_name: "Mumbai Indians",
        team2_name: "Chennai Super Kings",
        venue_name: "Wankhede Stadium",
      }
      const predictionsResult = await generatePredictionsEnhanced(matchData)
      results.dataFetching.predictions = predictionsResult.success && predictionsResult.data !== null
      console.log(`Predictions generation: ${results.dataFetching.predictions ? "SUCCESS" : "FAILED"}`)
      console.log(`Source: ${predictionsResult.source}`)
    } catch (error) {
      results.errors.push(`Predictions generation error: ${error.message}`)
      console.error("Predictions generation error:", error)
    }

    // Print summary
    console.log("\n=== Data Fetching Tests Summary ===")
    console.log(`Database connection: ${results.databaseConnection ? "SUCCESS" : "FAILED"}`)
    console.log(
      `Tables exist: Teams (${results.tablesExist.teams ? "YES" : "NO"}), Venues (${results.tablesExist.venues ? "YES" : "NO"}), Players (${results.tablesExist.players ? "YES" : "NO"})`,
    )
    console.log(
      `Data fetching: Teams (${results.dataFetching.teams ? "SUCCESS" : "FAILED"}), Venues (${results.dataFetching.venues ? "SUCCESS" : "FAILED"}), Players (${results.dataFetching.players ? "SUCCESS" : "FAILED"}), Match Data (${results.dataFetching.matchData ? "SUCCESS" : "FAILED"}), Predictions (${results.dataFetching.predictions ? "SUCCESS" : "FAILED"})`,
    )

    if (results.errors.length > 0) {
      console.log("\nErrors encountered:")
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`)
      })
    }

    return results
  } catch (error) {
    console.error("Error running data fetching tests:", error)
    results.errors.push(`General test error: ${error.message}`)
    return results
  }
}

// Function to test specific venue matching
export async function testVenueMatching(venueName: string) {
  console.log(`=== Testing Venue Matching for "${venueName}" ===`)

  try {
    // Get all venues
    const venuesResult = await getVenuesEnhanced()
    const venues = venuesResult.data || []

    console.log(`Found ${venues.length} venues in the system`)

    // Try exact match
    console.log("Trying exact match...")
    const exactMatch = venues.find((v) => v.name === venueName)
    console.log(`Exact match: ${exactMatch ? "FOUND - " + exactMatch.name : "NOT FOUND"}`)

    // Try case-insensitive match
    console.log("Trying case-insensitive match...")
    const caseInsensitiveMatch = venues.find((v) => v.name.toLowerCase() === venueName.toLowerCase())
    console.log(
      `Case-insensitive match: ${caseInsensitiveMatch ? "FOUND - " + caseInsensitiveMatch.name : "NOT FOUND"}`,
    )

    // Try partial match
    console.log("Trying partial match...")
    const partialMatch = venues.find(
      (v) =>
        v.name.toLowerCase().includes(venueName.toLowerCase()) ||
        venueName.toLowerCase().includes(v.name.toLowerCase()),
    )
    console.log(`Partial match: ${partialMatch ? "FOUND - " + partialMatch.name : "NOT FOUND"}`)

    // Test full match data fetching with this venue
    console.log("\nTesting full match data fetching with this venue...")
    const matchDataResult = await fetchMatchDataEnhanced("1", "2", venueName)

    console.log(`Match data fetching: ${matchDataResult.success ? "SUCCESS" : "FAILED"}`)
    console.log(`Source: ${matchDataResult.source}`)
    console.log(`Venue used: ${matchDataResult.data?.venue_name || "Unknown"}`)

    return {
      exactMatch: exactMatch !== undefined,
      caseInsensitiveMatch: caseInsensitiveMatch !== undefined,
      partialMatch: partialMatch !== undefined,
      matchDataSuccess: matchDataResult.success,
      venueUsed: matchDataResult.data?.venue_name || null,
    }
  } catch (error) {
    console.error("Error testing venue matching:", error)
    return {
      exactMatch: false,
      caseInsensitiveMatch: false,
      partialMatch: false,
      matchDataSuccess: false,
      venueUsed: null,
      error: error.message,
    }
  }
}
