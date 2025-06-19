import { nanoid } from "nanoid"
import { sql } from "./db"
import * as schema from "./schema"

// Mock IPL teams
const mockTeams = [
  { id: "csk", name: "Chennai Super Kings", shortName: "CSK", primaryColor: "#F9CD05", secondaryColor: "#0081E9" },
  { id: "mi", name: "Mumbai Indians", shortName: "MI", primaryColor: "#004BA0", secondaryColor: "#D1AB3E" },
  {
    id: "rcb",
    name: "Royal Challengers Bangalore",
    shortName: "RCB",
    primaryColor: "#EC1C24",
    secondaryColor: "#000000",
  },
  { id: "kkr", name: "Kolkata Knight Riders", shortName: "KKR", primaryColor: "#3A225D", secondaryColor: "#B3A123" },
  { id: "dc", name: "Delhi Capitals", shortName: "DC", primaryColor: "#00008B", secondaryColor: "#FF0000" },
  { id: "srh", name: "Sunrisers Hyderabad", shortName: "SRH", primaryColor: "#F7A721", secondaryColor: "#DC143C" },
  { id: "pbks", name: "Punjab Kings", shortName: "PBKS", primaryColor: "#ED1B24", secondaryColor: "#DCDDDF" },
  { id: "rr", name: "Rajasthan Royals", shortName: "RR", primaryColor: "#2D3E8B", secondaryColor: "#FF1744" },
  { id: "gt", name: "Gujarat Titans", shortName: "GT", primaryColor: "#1C1C1C", secondaryColor: "#0080FF" },
  { id: "lsg", name: "Lucknow Super Giants", shortName: "LSG", primaryColor: "#A72056", secondaryColor: "#FFFF3C" },
]

// Mock venues
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
  {
    id: "chinnaswamy",
    name: "M. Chinnaswamy Stadium",
    city: "Bangalore",
    country: "India",
    capacity: 40000,
    pitchType: "Batting friendly",
    avgFirstInningsScore: 180,
    avgSecondInningsScore: 170,
    battingFirstWinPercentage: 48,
    chasingWinPercentage: 52,
  },
  {
    id: "eden",
    name: "Eden Gardens",
    city: "Kolkata",
    country: "India",
    capacity: 68000,
    pitchType: "Balanced",
    avgFirstInningsScore: 170,
    avgSecondInningsScore: 165,
    battingFirstWinPercentage: 48,
    chasingWinPercentage: 52,
  },
  {
    id: "arun_jaitley",
    name: "Arun Jaitley Stadium",
    city: "Delhi",
    country: "India",
    capacity: 41000,
    pitchType: "Balanced",
    avgFirstInningsScore: 175,
    avgSecondInningsScore: 165,
    battingFirstWinPercentage: 52,
    chasingWinPercentage: 48,
  },
]

// Mock players
const mockPlayers = [
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
  {
    id: "russell",
    name: "Andre Russell",
    teamId: "kkr",
    role: "All-rounder",
    battingStyle: "Right-handed",
    bowlingStyle: "Right-arm fast-medium",
    nationality: "West Indian",
    formRating: 8.7,
    matchImpact: 9.0,
    keyStat: "Strike rate 180+",
  },
  {
    id: "pant",
    name: "Rishabh Pant",
    teamId: "dc",
    role: "Wicket-keeper",
    battingStyle: "Left-handed",
    bowlingStyle: "None",
    nationality: "Indian",
    formRating: 8.4,
    matchImpact: 8.9,
    keyStat: "Middle overs acceleration",
  },
  {
    id: "rashid",
    name: "Rashid Khan",
    teamId: "gt",
    role: "Bowler",
    battingStyle: "Right-handed",
    bowlingStyle: "Right-arm leg break",
    nationality: "Afghan",
    formRating: 9.1,
    matchImpact: 9.4,
    keyStat: "Economy under 7",
  },
]

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Create tables if they don't exist
    await schema.createAllTables()

    // Seed teams
    console.log("Seeding teams...")
    for (const team of mockTeams) {
      await sql`
        INSERT INTO teams (id, name, short_name, primary_color, secondary_color)
        VALUES (${team.id}, ${team.name}, ${team.shortName}, ${team.primaryColor}, ${team.secondaryColor})
        ON CONFLICT (id) DO NOTHING
      `
    }

    // Seed venues
    console.log("Seeding venues...")
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

    // Seed players
    console.log("Seeding players...")
    for (const player of mockPlayers) {
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

    // Seed head-to-head stats
    console.log("Seeding head-to-head stats...")
    await sql`
      INSERT INTO head_to_head_stats (
        id, team1_id, team2_id, total_matches, team1_wins, team2_wins, no_results, last_five_encounters
      )
      VALUES (
        ${nanoid()}, ${"csk"}, ${"mi"}, ${35}, ${15}, ${19}, ${1},
        ${JSON.stringify([
          { winner: "mi", date: "23 Apr 2023", result: "Mumbai Indians won by 7 wickets" },
          { winner: "csk", date: "8 May 2022", result: "Chennai Super Kings won by 3 runs" },
          { winner: "mi", date: "19 Sep 2021", result: "Mumbai Indians won by 20 runs" },
          { winner: "mi", date: "1 May 2021", result: "Mumbai Indians won by 4 wickets" },
          { winner: "csk", date: "23 Sep 2020", result: "Chennai Super Kings won by 5 wickets" },
        ])}
      )
      ON CONFLICT DO NOTHING
    `

    // Seed team venue stats
    console.log("Seeding team venue stats...")
    await sql`
      INSERT INTO team_venue_stats (
        id, team_id, venue_id, matches_played, matches_won, win_percentage, 
        avg_score, highest_score, lowest_score
      )
      VALUES (
        ${nanoid()}, ${"csk"}, ${"chepauk"}, ${25}, ${18}, ${72}, 
        ${180}, ${223}, ${134}
      )
      ON CONFLICT DO NOTHING
    `

    await sql`
      INSERT INTO team_venue_stats (
        id, team_id, venue_id, matches_played, matches_won, win_percentage, 
        avg_score, highest_score, lowest_score
      )
      VALUES (
        ${nanoid()}, ${"mi"}, ${"wankhede"}, ${30}, ${20}, ${67}, 
        ${175}, ${219}, ${129}
      )
      ON CONFLICT DO NOTHING
    `

    // Seed player matchups
    console.log("Seeding player matchups...")
    await sql`
      INSERT INTO player_matchups (
        id, player1_id, player2_id, balls, runs, dismissals, advantage
      )
      VALUES (
        ${nanoid()}, ${"dhoni"}, ${"bumrah"}, ${42}, ${34}, ${5}, ${"bowler"}
      )
      ON CONFLICT DO NOTHING
    `

    console.log("Database seeding completed successfully")
    return { success: true, message: "Database seeded successfully" }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, message: `Failed to seed database: ${error.message}` }
  }
}
