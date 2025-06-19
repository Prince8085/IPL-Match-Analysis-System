// This file will replace the existing data-service.ts
// It maintains the same API but uses the database instead of mock data

import { nanoid } from "nanoid"
import { db } from "./db"
import * as schema from "./schema"
import { eq, and } from "drizzle-orm"

// Mock IPL teams - keeping this for backward compatibility
const mockTeams = [
  { id: "csk", name: "Chennai Super Kings" },
  { id: "mi", name: "Mumbai Indians" },
  { id: "rcb", name: "Royal Challengers Bangalore" },
  { id: "kkr", name: "Kolkata Knight Riders" },
  { id: "dc", name: "Delhi Capitals" },
  { id: "srh", name: "Sunrisers Hyderabad" },
  { id: "pbks", name: "Punjab Kings" },
  { id: "rr", name: "Rajasthan Royals" },
  { id: "gt", name: "Gujarat Titans" },
  { id: "lsg", name: "Lucknow Super Giants" },
]

// Teams
export async function fetchTeams() {
  try {
    // Try to fetch from database first
    const teams = await db.select().from(schema.teams)

    // If no teams in database, seed with mock data and return
    if (teams.length === 0) {
      await seedMockTeams()
      return mockTeams
    }

    return teams
  } catch (error) {
    console.error("Error fetching teams:", error)
    // Fallback to mock data if database fails
    return mockTeams
  }
}

async function seedMockTeams() {
  try {
    for (const team of mockTeams) {
      await db
        .insert(schema.teams)
        .values({
          id: team.id,
          name: team.name,
          shortName: team.name
            .split(" ")
            .map((word) => word[0])
            .join(""),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing()
    }
  } catch (error) {
    console.error("Error seeding mock teams:", error)
  }
}

// Players
export async function fetchPlayers(teamIds) {
  try {
    // Try to fetch from database first
    let players
    if (teamIds && teamIds.length > 0) {
      players = await db.select().from(schema.players).where(schema.players.teamId.in(teamIds))
    } else {
      players = await db.select().from(schema.players)
    }

    // If no players in database, generate mock data
    if (players.length === 0) {
      return generatePlayerData(
        teamIds && teamIds.length > 0 ? mockTeams.find((team) => team.id === teamIds[0])?.name || "Team 1" : "Team 1",
        teamIds && teamIds.length > 1 ? mockTeams.find((team) => team.id === teamIds[1])?.name || "Team 2" : "Team 2",
      )
    }

    return players
  } catch (error) {
    console.error("Error fetching players:", error)
    // Fallback to mock data if database fails
    return generatePlayerData(
      teamIds && teamIds.length > 0 ? mockTeams.find((team) => team.id === teamIds[0])?.name || "Team 1" : "Team 1",
      teamIds && teamIds.length > 1 ? mockTeams.find((team) => team.id === teamIds[1])?.name || "Team 2" : "Team 2",
    )
  }
}

// Match data
export async function fetchMatchData(team1Id, team2Id, venue, date) {
  try {
    // Check if match already exists in database
    const existingMatches = await db
      .select()
      .from(schema.matches)
      .where(and(eq(schema.matches.team1Id, team1Id), eq(schema.matches.team2Id, team2Id)))

    if (existingMatches.length > 0) {
      // Return existing match data
      const matchId = existingMatches[0].id

      // Get venue data
      const venues = await db.select().from(schema.venues).where(eq(schema.venues.id, existingMatches[0].venueId))

      // Get team data
      const team1 = await db.select().from(schema.teams).where(eq(schema.teams.id, team1Id))

      const team2 = await db.select().from(schema.teams).where(eq(schema.teams.id, team2Id))

      return {
        id: matchId,
        team1Id,
        team2Id,
        venueId: existingMatches[0].venueId,
        venue: venues[0]?.name || venue,
        date: existingMatches[0].matchDate || new Date(),
        team1: team1[0],
        team2: team2[0],
      }
    }

    // If no match exists, return mock data
    return {
      team1Id,
      team2Id,
      venue,
      date: date || new Date(),
    }
  } catch (error) {
    console.error("Error fetching match data:", error)
    // Fallback to mock data if database fails
    return {
      team1Id,
      team2Id,
      venue,
      date: date || new Date(),
    }
  }
}

// Predictions
export async function generatePredictions(matchData, isLiveUpdate = false) {
  try {
    // Check if prediction already exists in database
    if (matchData.id) {
      const existingPredictions = await db
        .select()
        .from(schema.predictions)
        .where(eq(schema.predictions.matchId, matchData.id))

      if (existingPredictions.length > 0 && !isLiveUpdate) {
        // Parse JSON fields
        const prediction = existingPredictions[0]
        const keyInsights = prediction.keyInsights ? JSON.parse(prediction.keyInsights) : []
        const firstInningsKeyPhases = prediction.firstInningsKeyPhases
          ? JSON.parse(prediction.firstInningsKeyPhases)
          : []
        const secondInningsCriticalFactors = prediction.secondInningsCriticalFactors
          ? JSON.parse(prediction.secondInningsCriticalFactors)
          : []

        // Get team names
        const team1 = await db.select().from(schema.teams).where(eq(schema.teams.id, matchData.team1Id))

        const team2 = await db.select().from(schema.teams).where(eq(schema.teams.id, matchData.team2Id))

        // Return existing prediction with formatted data
        return {
          ...prediction,
          teams: {
            team1: team1[0]?.name || "Team 1",
            team2: team2[0]?.name || "Team 2",
          },
          winProbability: {
            team1: prediction.team1WinProbability,
            team2: prediction.team2WinProbability,
            tie: prediction.tieProbability,
          },
          insights: keyInsights,
          firstInnings: {
            projectedScore: prediction.projectedFirstInningsScore,
            keyPhases: firstInningsKeyPhases,
          },
          secondInnings: {
            chaseSuccessProbability: prediction.chaseSuccessProbability,
            criticalFactors: secondInningsCriticalFactors,
          },
          // Add other mock data for backward compatibility
          ...generateMockPredictionData(team1[0]?.name || "Team 1", team2[0]?.name || "Team 2"),
        }
      }
    }

    // Create a new match if it doesn't exist
    let matchId
    let venueId
    if (!matchData.id) {
      // Check if venue exists, create if not
      venueId = matchData.venue
      if (typeof matchData.venue === "string") {
        const venues = await db.select().from(schema.venues).where(eq(schema.venues.name, matchData.venue))

        if (venues.length === 0) {
          const newVenue = await db
            .insert(schema.venues)
            .values({
              id: nanoid(),
              name: matchData.venue,
              city: "Unknown",
              country: "India",
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning()

          venueId = newVenue[0].id
        } else {
          venueId = venues[0].id
        }
      }

      // Create new match
      const newMatch = await db
        .insert(schema.matches)
        .values({
          id: nanoid(),
          team1Id: matchData.team1Id,
          team2Id: matchData.team2Id,
          venueId,
          matchDate: matchData.date || new Date(),
          matchStatus: "upcoming",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      matchId = newMatch[0].id
    } else {
      matchId = matchData.id
      venueId = matchData.venue
    }

    // Get team names
    const team1 = await db.select().from(schema.teams).where(eq(schema.teams.id, matchData.team1Id))

    const team2 = await db.select().from(schema.teams).where(eq(schema.teams.id, matchData.team2Id))

    const team1Name = team1[0]?.name || "Team 1"
    const team2Name = team2[0]?.name || "Team 2"

    // Generate prediction data
    const team1WinProbability = Math.floor(Math.random() * 40) + 30 // 30-70%
    const team2WinProbability = Math.floor(Math.random() * (95 - team1WinProbability)) + 5 // Remaining probability minus tie chance
    const tieProbability = 100 - team1WinProbability - team2WinProbability

    const keyInsights = [
      { text: `${team1Name} have a strong record at this venue with 70% win rate`, confidence: 85, impact: "high" },
      {
        text: `${team2Name} have won 3 of the last 5 encounters between these teams`,
        confidence: 80,
        impact: "medium",
      },
      {
        text: "Dew factor is expected to play a significant role in the second innings",
        confidence: 75,
        impact: "medium",
      },
      { text: "The team winning the toss is likely to choose to field first", confidence: 70, impact: "medium" },
      { text: `Key matchup: Jasprit Bumrah vs MS Dhoni in the death overs`, confidence: 90, impact: "high" },
    ]

    const firstInningsKeyPhases = [
      { name: "Powerplay (1-6)", runs: `${45 + Math.floor(Math.random() * 15)}` },
      { name: "Middle Overs (7-15)", runs: `${70 + Math.floor(Math.random() * 20)}` },
      { name: "Death Overs (16-20)", runs: `${50 + Math.floor(Math.random() * 20)}` },
    ]

    const secondInningsCriticalFactors = [
      { text: "Dew will make bowling difficult in the second innings", weight: 30 },
      { text: "The pitch is expected to play better for batting as the game progresses", weight: 25 },
      { text: "Teams have successfully chased targets of 180+ in 65% of night games at this venue", weight: 20 },
      { text: "The shorter boundaries on one side will favor the chasing team's left-handed batsmen", weight: 15 },
      { text: "The presence of quality death bowlers will be crucial for the defending team", weight: 10 },
    ]

    // Save prediction to database
    const predictionId = nanoid()
    await db.insert(schema.predictions).values({
      id: predictionId,
      matchId,
      team1WinProbability,
      team2WinProbability,
      tieProbability,
      projectedFirstInningsScore: `${160 + Math.floor(Math.random() * 40)}-${170 + Math.floor(Math.random() * 40)}`,
      chaseSuccessProbability: `${40 + Math.floor(Math.random() * 40)}%`,
      keyInsights: JSON.stringify(keyInsights),
      firstInningsKeyPhases: JSON.stringify(firstInningsKeyPhases),
      secondInningsCriticalFactors: JSON.stringify(secondInningsCriticalFactors),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Return full prediction data
    return {
      id: predictionId,
      matchId,
      teams: {
        team1: team1Name,
        team2: team2Name,
      },
      winProbability: {
        team1: team1WinProbability,
        team2: team2WinProbability,
        tie: tieProbability,
      },
      insights: keyInsights,
      firstInnings: {
        projectedScore: `${160 + Math.floor(Math.random() * 40)}-${170 + Math.floor(Math.random() * 40)}`,
        keyPhases: firstInningsKeyPhases,
      },
      secondInnings: {
        chaseSuccessProbability: `${40 + Math.floor(Math.random() * 40)}%`,
        criticalFactors: secondInningsCriticalFactors,
      },
      // Add other mock data for backward compatibility
      ...generateMockPredictionData(team1Name, team2Name),
    }
  } catch (error) {
    console.error("Error generating predictions:", error)
    // Fallback to mock data if database fails
    return generateMockPredictionData(
      mockTeams.find((team) => team.id === matchData.team1Id)?.name || "Team 1",
      mockTeams.find((team) => team.id === matchData.team2Id)?.name || "Team 2",
    )
  }
}

// Helper function to generate mock prediction data for backward compatibility
function generateMockPredictionData(team1, team2) {
  return {
    headToHead: {
      totalMatches: 35,
      team1Wins: 15,
      team2Wins: 19,
      noResults: 1,
    },
    lastFiveEncounters: [
      { winner: team2, date: "23 Apr 2023", result: `${team2} won by 7 wickets` },
      { winner: team1, date: "8 May 2022", result: `${team1} won by 3 runs` },
      { winner: team2, date: "19 Sep 2021", result: `${team2} won by 20 runs` },
      { winner: team2, date: "1 May 2021", result: `${team2} won by 4 wickets` },
      { winner: team1, date: "23 Sep 2020", result: `${team1} won by 5 wickets` },
    ],
    teamComparison: {
      battingStrength: {
        team1: 8.5,
        team2: 9.0,
      },
      bowlingAttack: {
        team1: 8.0,
        team2: 9.2,
      },
      fieldingQuality: {
        team1: 8.3,
        team2: 8.1,
      },
      recentForm: {
        team1: 8.7,
        team2: 7.9,
      },
      venueRecord: {
        team1: 9.1,
        team2: 7.8,
      },
      pressureHandling: {
        team1: 8.6,
        team2: 8.8,
      },
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
      pitchReport:
        "The pitch has a good covering of grass which should assist the seamers early on. As the match progresses, it will become slower and assist spin. Dew will be a significant factor in the second innings.",
    },
    weatherImpact: {
      date: "Today",
      condition: "Clear",
      temperature: 28,
      humidity: 65,
      dewFactor: 70,
      dewFactorInsight:
        "High humidity levels will likely result in significant dew formation in the second innings, making it difficult for bowlers to grip the ball.",
      impactOnPlay: [
        { description: "No rain interruptions expected", advantage: null },
        { description: "High humidity may cause dew in the second innings", advantage: team2 },
        { description: "Ball may swing more in the evening due to atmospheric conditions", advantage: team1 },
        { description: "Players may face fatigue due to high temperature and humidity", advantage: null },
      ],
    },
    venueStats: {
      avgFirstInningsScore: 172,
      avgSecondInningsScore: 165,
      battingFirstWinPercentage: 45,
      chasingWinPercentage: 55,
      team1: {
        matches: 25,
        wins: 18,
        winPercentage: 72,
        avgScore: 180,
        highestScore: 223,
        lowestScore: 134,
      },
      team2: {
        matches: 30,
        wins: 20,
        winPercentage: 67,
        avgScore: 175,
        highestScore: 219,
        lowestScore: 129,
      },
    },
    players: generatePlayerData(team1, team2),
    ballByBall: generateBallByBallData(),
    overAnalysis: generateOverAnalysis(),
    turningPoints: generateTurningPoints(team1, team2),
    liveScore: generateLiveScoreData(team1, team2),
    keyMoments: generateKeyMoments(team1, team2),
    advancedMetrics: generateAdvancedMetrics(),
    phaseAnalysis: {
      team1: {
        batting: [
          { name: "Powerplay", rating: 8.5, strength: "Strong" },
          { name: "Middle Overs", rating: 7.8, strength: "Good" },
          { name: "Death Overs", rating: 9.2, strength: "Excellent" },
        ],
        bowling: [
          { name: "Powerplay", rating: 7.5, strength: "Good" },
          { name: "Middle Overs", rating: 8.3, strength: "Strong" },
          { name: "Death Overs", rating: 7.9, strength: "Good" },
        ],
      },
      team2: {
        batting: [
          { name: "Powerplay", rating: 8.8, strength: "Strong" },
          { name: "Middle Overs", rating: 8.2, strength: "Strong" },
          { name: "Death Overs", rating: 8.5, strength: "Strong" },
        ],
        bowling: [
          { name: "Powerplay", rating: 8.7, strength: "Strong" },
          { name: "Middle Overs", rating: 7.9, strength: "Good" },
          { name: "Death Overs", rating: 9.0, strength: "Excellent" },
        ],
      },
    },
    pitchHeatmap: {
      scoringZones: [
        { area: "Cover", effectiveness: "High", description: "Gap between fielders" },
        { area: "Mid-wicket", effectiveness: "High", description: "Strong scoring area" },
        { area: "Square Leg", effectiveness: "Medium", description: "Good for pull shots" },
        { area: "Third Man", effectiveness: "Medium", description: "Open for edges" },
      ],
      bowlingStrategies: [
        { type: "Yorkers", effectiveness: "High", description: "Difficult to hit" },
        { type: "Slower Balls", effectiveness: "Medium", description: "Effective in death overs" },
        { type: "Back of Length", effectiveness: "High", description: "Restricts scoring" },
        { type: "Wide Yorkers", effectiveness: "Medium", description: "Limits boundary options" },
      ],
    },
    strategicMatchups: [
      {
        type: "Batter vs Bowler",
        player1: { name: "MS Dhoni", role: "Batter", initials: "MSD" },
        player2: { name: "Jasprit Bumrah", role: "Bowler", initials: "JB" },
        advantage: team2,
        significance: "high",
        insight: "Bumrah has dismissed Dhoni 5 times in IPL while conceding only 34 runs in 42 balls.",
      },
      {
        type: "Spinner vs Batter",
        player1: { name: "Ravindra Jadeja", role: "Bowler", initials: "RJ" },
        player2: { name: "Rohit Sharma", role: "Batter", initials: "RS" },
        advantage: team1,
        significance: "medium",
        insight: "Jadeja has kept Rohit quiet in the middle overs with an economy of just 6.2 runs per over.",
      },
      {
        type: "Powerplay Battle",
        player1: { name: "Deepak Chahar", role: "Bowler", initials: "DC" },
        player2: { name: "Quinton de Kock", role: "Batter", initials: "QDK" },
        advantage: team1,
        significance: "high",
        insight: "Chahar has dismissed de Kock 3 times in the powerplay with the new ball swinging.",
      },
    ],
    tacticalAnalysis: {
      team1: {
        approach: `${team1} are likely to adopt an aggressive approach in the powerplay, targeting the shorter boundaries. They will look to use their spinners in the middle overs to control the run rate.`,
        keyTactics: [
          { description: "Aggressive powerplay batting", effectiveness: 85 },
          { description: "Spin choke in middle overs", effectiveness: 80 },
          { description: "Pace off deliveries at death", effectiveness: 75 },
        ],
        weaknesses: [
          "Vulnerable against quality pace bowling",
          "Middle order can collapse under pressure",
          "Death bowling can be expensive at times",
        ],
      },
      team2: {
        approach: `${team2} typically rely on a solid start and acceleration in the death overs. Their bowling strategy revolves around taking early wickets and controlling the middle phase with quality spin.`,
        keyTactics: [
          { description: "Early wickets with new ball", effectiveness: 90 },
          { description: "Control middle overs with spin", effectiveness: 85 },
          { description: "Death over specialists", effectiveness: 95 },
        ],
        weaknesses: [
          "Over-reliance on top order batsmen",
          "Struggle against quality spin on turning tracks",
          "Fielding can be inconsistent at times",
        ],
      },
    },
    modelInsights: {
      overallAccuracy: 82,
      winPredictionAccuracy: 78,
      scorePredictionError: 8,
      featureImportance: [
        { name: "Recent Form", importance: 24 },
        { name: "Head-to-Head Record", importance: 18 },
        { name: "Venue Stats", importance: 16 },
        { name: "Player Matchups", importance: 14 },
        { name: "Pitch Conditions", importance: 12 },
        { name: "Weather Impact", importance: 8 },
        { name: "Toss Decision", importance: 5 },
        { name: "Team Composition", importance: 3 },
      ],
      architecture: {
        type: "Ensemble Model",
        algorithm: "Gradient Boosted Decision Trees",
        trainingData: "Last 5 IPL seasons (800+ matches)",
        components: [
          { name: "Win Predictor", type: "Classification", description: "Predicts match outcome" },
          { name: "Score Predictor", type: "Regression", description: "Projects team totals" },
          { name: "Player Performance", type: "Mixed", description: "Projects individual stats" },
          { name: "Phase Analyzer", type: "Sequence", description: "Analyzes match phases" },
        ],
        dataSources: [
          { name: "Historical Match Data", description: "Complete ball-by-ball data from all IPL seasons" },
          { name: "Player Statistics", description: "Comprehensive player performance metrics" },
          { name: "Venue Analytics", description: "Detailed venue-specific performance data" },
          { name: "Weather Information", description: "Historical and forecast weather conditions" },
        ],
      },
      modelComparison: [
        { name: "Ensemble", accuracy: 82, weight: 100, description: "Combined model approach" },
        { name: "XGBoost", accuracy: 79, weight: 40, description: "Gradient boosting framework" },
        { name: "Neural Network", accuracy: 77, weight: 30, description: "Deep learning approach" },
        { name: "Random Forest", accuracy: 75, weight: 20, description: "Multiple decision trees" },
        { name: "Logistic Regression", accuracy: 68, weight: 10, description: "Statistical baseline" },
      ],
      backtestingSummary: {
        matchesAnalyzed: 120,
        winPredictionAccuracy: 76,
        scorePredictionError: 12,
      },
      backtestResults: [
        {
          match: `${team1} vs ${team2}`,
          date: "23 Apr 2023",
          prediction: `${team2} win`,
          actual: `${team2} win`,
          predictionCorrect: true,
        },
        {
          match: `${team1} vs RCB`,
          date: "12 Apr 2023",
          prediction: `${team1} win`,
          actual: `${team1} win`,
          predictionCorrect: true,
        },
        {
          match: `KKR vs ${team2}`,
          date: "18 Apr 2023",
          prediction: `${team2} win`,
          actual: "KKR win",
          predictionCorrect: false,
        },
        {
          match: `${team1} vs DC`,
          date: "3 Apr 2023",
          prediction: `${team1} win`,
          actual: `${team1} win`,
          predictionCorrect: true,
        },
        {
          match: `PBKS vs ${team2}`,
          date: "9 Apr 2023",
          prediction: `${team2} win`,
          actual: "PBKS win",
          predictionCorrect: false,
        },
      ],
      limitations: [
        "Model does not fully account for unexpected player injuries during a match",
        "Extreme weather changes during a match may affect prediction accuracy",
        "Impact of strategic timeouts is difficult to quantify",
        "Player mental state and fatigue levels are not fully captured",
      ],
    },
  }
}

// Keep the existing helper functions for backward compatibility
function generatePlayerData(team1, team2) {
  return [
    {
      id: "p1",
      name: "MS Dhoni",
      team: team1,
      role: "Wicket-keeper",
      formRating: 8.5,
      matchImpact: 9.2,
      keyStat: "SR 150+ in death overs",
      projectedPoints: 55,
      keyMatchup: "vs Bumrah",
      keyMetrics: [
        { name: "Batting Average", value: "45.2", trend: "up", trendValue: "2.3" },
        { name: "Strike Rate", value: "142.8", trend: "up", trendValue: "5.6" },
        { name: "Boundary %", value: "18.5%", trend: "up", trendValue: "2.1%" },
        { name: "Dot Ball %", value: "32.4%", trend: "down", trendValue: "3.2%" },
      ],
      recentForm: [
        { score: "45(28)", performance: "excellent" },
        { score: "32(22)", performance: "good" },
        { score: "18(15)", performance: "average" },
        { score: "56(32)", performance: "excellent" },
        { score: "12(10)", performance: "poor" },
      ],
      matchPrediction: [
        "Likely to score 30+ runs at a strike rate of 150+",
        "Expected to be most effective against spinners",
        "High probability of finishing the innings if batting second",
      ],
      keyMatchups: [
        {
          against: "Jasprit Bumrah",
          advantage: "unfavorable",
          insight: "Struggles against Bumrah's yorkers in death overs",
          stats: { balls: 42, runs: 34, dismissals: 5 },
        },
        {
          against: "Yuzvendra Chahal",
          advantage: "favorable",
          insight: "Dominates against leg spin, especially in middle overs",
          stats: { balls: 36, runs: 58, dismissals: 1 },
        },
      ],
    },
    {
      id: "p2",
      name: "Rohit Sharma",
      team: team2,
      role: "Batsman",
      formRating: 8.2,
      matchImpact: 8.8,
      keyStat: "Avg 45+ vs spin",
      projectedPoints: 62,
      keyMatchup: "vs Jadeja",
      keyMetrics: [
        { name: "Batting Average", value: "42.8", trend: "down", trendValue: "1.5" },
        { name: "Strike Rate", value: "138.5", trend: "up", trendValue: "3.2" },
        { name: "Boundary %", value: "19.2%", trend: "up", trendValue: "1.8%" },
        { name: "Dot Ball %", value: "34.1%", trend: "down", trendValue: "2.5%" },
      ],
      recentForm: [
        { score: "68(42)", performance: "excellent" },
        { score: "12(10)", performance: "poor" },
        { score: "45(32)", performance: "good" },
        { score: "52(36)", performance: "excellent" },
        { score: "28(22)", performance: "average" },
      ],
      matchPrediction: [
        "Likely to score 40+ if he survives the powerplay",
        "Expected to target the leg-side boundary against left-arm spin",
        "High probability of setting a strong platform in the first 6 overs",
      ],
      keyMatchups: [
        {
          against: "Ravindra Jadeja",
          advantage: "neutral",
          insight: "Careful approach against Jadeja, focuses on singles",
          stats: { balls: 48, runs: 52, dismissals: 2 },
        },
        {
          against: "Deepak Chahar",
          advantage: "unfavorable",
          insight: "Vulnerable against inswing in the powerplay",
          stats: { balls: 32, runs: 28, dismissals: 4 },
        },
      ],
    },
    {
      id: "p3",
      name: "Virat Kohli",
      team: "Royal Challengers Bangalore",
      role: "Batsman",
      formRating: 9.0,
      matchImpact: 9.5,
      keyStat: "Consistency in scoring",
      projectedPoints: 70,
      keyMatchup: "vs Rabada",
    },
    {
      id: "p4",
      name: "Jasprit Bumrah",
      team: "Mumbai Indians",
      role: "Bowler",
      formRating: 8.8,
      matchImpact: 9.3,
      keyStat: "Economy in death overs",
      projectedPoints: 45,
      keyMatchup: "vs Dhoni",
    },
    {
      id: "p5",
      name: "Ravindra Jadeja",
      team: "Chennai Super Kings",
      role: "All-rounder",
      formRating: 8.6,
      matchImpact: 9.1,
      keyStat: "Wickets and economy",
      projectedPoints: 50,
      keyMatchup: "vs Sharma",
    },
  ]
}

function generateBallByBallData() {
  const ballByBallData = []

  for (let over = 1; over <= 20; over++) {
    for (let ball = 1; ball <= 6; ball++) {
      ballByBallData.push({
        over,
        ball,
        outcomes: [
          { runs: 0, probability: 0.3, description: "Dot ball - Good length delivery" },
          {
            runs: 1,
            probability: 0.25,
            description: "Single - Pushed to mid-on",
            insight: "70% of balls in this zone result in singles",
          },
          { runs: 2, probability: 0.15, description: "Two runs - Driven through covers" },
          {
            runs: 4,
            probability: 0.2,
            description: "Boundary - Short ball pulled to square leg",
            insight: "Batsman has 65% boundary rate against short balls",
          },
          { runs: 6, probability: 0.08, description: "Six - Full toss hit over long-on" },
          {
            runs: "W",
            probability: 0.02,
            description: "Wicket - Caught at mid-off",
            insight: "Bowler has taken 8 wickets in this phase",
          },
        ],
        keyMatchup: {
          bowler: { name: "Jasprit Bumrah", initials: "JB" },
          batter: { name: "MS Dhoni", initials: "MSD" },
          insight: "Bumrah has dismissed Dhoni 5 times in IPL while conceding only 34 runs in 42 balls",
          stats: { balls: 42, runs: 34, wickets: 5 },
        },
      })
    }
  }

  return ballByBallData
}

function generateOverAnalysis() {
  const overAnalysis = []

  for (let over = 1; over <= 20; over++) {
    overAnalysis.push({
      over,
      expectedRuns:
        over <= 6
          ? 8 + Math.floor(Math.random() * 4)
          : over <= 15
            ? 7 + Math.floor(Math.random() * 4)
            : 9 + Math.floor(Math.random() * 5),
      runRange: over <= 6 ? "7-12" : over <= 15 ? "6-10" : "8-14",
      boundaryProbability: over <= 6 ? "35-40%" : over <= 15 ? "25-30%" : "40-45%",
      dotBallProbability: over <= 6 ? "25-30%" : over <= 15 ? "30-35%" : "20-25%",
      wicketProbability: over <= 6 ? "15-20%" : over <= 15 ? "20-25%" : "25-30%",
      likelyDismissal: over <= 6 ? "Caught behind/slips" : over <= 15 ? "Caught in outfield" : "Bowled/LBW",
      atRiskBatters: [
        { name: "Batsman 1", dismissalProbability: "25%" },
        { name: "Batsman 2", dismissalProbability: "18%" },
      ],
    })
  }

  return overAnalysis
}

function generateTurningPoints(team1, team2) {
  return [
    {
      phase: "Powerplay",
      over: 5,
      ball: 3,
      title: "Early Breakthrough",
      description: `${team2} loses a key opener in the powerplay, shifting momentum to ${team1}`,
      team: team1,
      winImpact: 8,
    },
    {
      phase: "Middle Overs",
      over: 12,
      ball: 4,
      title: "Partnership Broken",
      description: `${team1}'s spinner breaks a dangerous partnership that was building momentum`,
      team: team1,
      winImpact: 12,
    },
    {
      phase: "Death Overs",
      over: 18,
      ball: 5,
      title: "Death Over Heroics",
      description: `${team2}'s finisher hits 3 consecutive boundaries to bring the equation in favor`,
      team: team2,
      winImpact: 15,
    },
  ]
}

function generateLiveScoreData(team1, team2) {
  return {
    currentInnings: "1",
    team1: {
      runs: 65,
      wickets: 2,
      overs: 7,
      balls: 3,
      runRate: "8.84",
      projectedScore: "175-185",
    },
    team2: {
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      runRate: "0.00",
      projectedScore: "0",
    },
    currentPartnership: "38(24)",
    batsman1: {
      name: "Batsman 1",
      runs: 42,
      balls: 28,
      strikeRate: 150,
    },
    batsman2: {
      name: "Batsman 2",
      runs: 18,
      balls: 15,
      strikeRate: 120,
    },
    bowler: {
      name: "Bowler",
      wickets: 1,
      runs: 32,
      economyRate: 8.5,
    },
    recentOvers: [
      {
        number: 7,
        runs: 12,
        balls: ["1", "4", "1", "0", "6", "0"],
      },
      {
        number: 6,
        runs: 8,
        balls: ["1", "1", "4", "1", "0", "1"],
      },
      {
        number: 5,
        runs: 15,
        balls: ["1", "4", "4", "1", "W", "4"],
      },
      {
        number: 4,
        runs: 6,
        balls: ["1", "0", "1", "2", "1", "1"],
      },
      {
        number: 3,
        runs: 9,
        balls: ["1", "0", "4", "1", "2", "1"],
      },
    ],
    target: null,
    toWin: null,
    ballsRemaining: null,
    requiredRunRate: null,
    matchStatus: `${team1} are 65/2 after 7.3 overs. Current run rate: 8.84`,
  }
}

function generateKeyMoments(team1, team2) {
  return [
    {
      phase: "Powerplay",
      over: 3,
      title: "Early Breakthrough",
      description: `${team1}'s opening bowler removes ${team2}'s dangerous opener in the third over`,
      team: team1,
      winImpact: 7,
    },
    {
      phase: "Middle Overs",
      over: 11,
      title: "Partnership Building",
      description: `${team2}'s middle order builds a solid partnership, adding 50 runs in 35 balls`,
      team: team2,
      winImpact: 9,
    },
    {
      phase: "Death Overs",
      over: 18,
      title: "Death Over Specialist",
      description: `${team1}'s death bowler concedes only 4 runs and takes a wicket in the 18th over`,
      team: team1,
      winImpact: 12,
    },
  ]
}

function generateAdvancedMetrics() {
  return [
    {
      name: "Pressure Handling Index",
      description: "Measures player performance in high-pressure situations",
      leaders: [
        { name: "MS Dhoni", team: "Chennai Super Kings", value: "9.2/10" },
        { name: "Jasprit Bumrah", team: "Mumbai Indians", value: "9.0/10" },
        { name: "Virat Kohli", team: "Royal Challengers Bangalore", value: "8.8/10" },
      ],
    },
    {
      name: "Death Over Economy",
      description: "Bowling economy rate in overs 16-20",
      leaders: [
        { name: "Jasprit Bumrah", team: "Mumbai Indians", value: "7.2" },
        { name: "Rashid Khan", team: "Gujarat Titans", value: "7.5" },
        { name: "Bhuvneshwar Kumar", team: "Sunrisers Hyderabad", value: "8.1" },
      ],
    },
    {
      name: "Boundary Percentage",
      description: "Percentage of balls hit for boundaries",
      leaders: [
        { name: "Jos Buttler", team: "Rajasthan Royals", value: "22.5%" },
        { name: "Suryakumar Yadav", team: "Mumbai Indians", value: "21.8%" },
        { name: "KL Rahul", team: "Lucknow Super Giants", value: "20.3%" },
      ],
    },
    {
      name: "Dot Ball Percentage",
      description: "Percentage of deliveries that yield no runs",
      leaders: [
        { name: "Rashid Khan", team: "Gujarat Titans", value: "42.5%" },
        { name: "Jasprit Bumrah", team: "Mumbai Indians", value: "40.8%" },
        { name: "Yuzvendra Chahal", team: "Rajasthan Royals", value: "38.2%" },
      ],
    },
  ]
}

// Export the original functions for backward compatibility
export async function generatePrediction(matchData) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock prediction data
  return {
    teams: {
      team1: "Chennai Super Kings",
      team2: "Mumbai Indians",
    },
    winProbability: {
      team1: 60,
      team2: 40,
    },
    insights: [
      "Chennai Super Kings have a higher chance of winning.",
      "Key players from Mumbai Indians need to perform well.",
    ],
    firstInnings: {
      projectedScore: "180-200",
      keyPhases: ["Powerplay", "Middle Overs", "Death Overs"],
    },
    secondInnings: {
      chaseSuccessProbability: "55%",
      criticalFactors: ["Wickets in hand", "Run rate", "Partnerships"],
    },
  }
}
