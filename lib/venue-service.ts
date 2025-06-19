import { sql } from "@/lib/data-service"
import { nanoid } from "nanoid"

// Function to find or create a venue
export async function findOrCreateVenue(venueName: string) {
  try {
    if (!sql) {
      throw new Error("Database client not initialized")
    }

    // First, try to find the venue by exact name match
    let venue = await sql`SELECT * FROM venues WHERE name = ${venueName} LIMIT 1`

    if (venue && venue.length > 0) {
      console.log(`Found venue by exact name match: ${venueName}`)
      return { id: venue[0].id, name: venue[0].name, isNew: false }
    }

    // Try case-insensitive match
    venue = await sql`SELECT * FROM venues WHERE LOWER(name) = LOWER(${venueName}) LIMIT 1`

    if (venue && venue.length > 0) {
      console.log(`Found venue by case-insensitive match: ${venueName}`)
      return { id: venue[0].id, name: venue[0].name, isNew: false }
    }

    // Try partial match
    venue = await sql`SELECT * FROM venues WHERE 
      LOWER(name) LIKE LOWER(${"%" + venueName + "%"}) OR 
      LOWER(${venueName}) LIKE LOWER(${"%" + "name" + "%"}) 
      LIMIT 1`

    if (venue && venue.length > 0) {
      console.log(`Found venue by partial match: ${venueName} -> ${venue[0].name}`)
      return { id: venue[0].id, name: venue[0].name, isNew: false }
    }

    // If no match found, create a new venue
    console.log(`No venue match found, creating new venue: ${venueName}`)
    const venueId = `venue-${nanoid(8)}`

    await sql`
      INSERT INTO venues (
        id, name, city, country, 
        created_at, updated_at
      ) VALUES (
        ${venueId}, ${venueName}, 'Unknown', 'India',
        NOW(), NOW()
      )
    `

    return { id: venueId, name: venueName, isNew: true }
  } catch (error) {
    console.error(`Error in findOrCreateVenue for "${venueName}":`, error)
    throw error
  }
}

// Function to get all venues
export async function getAllVenues() {
  try {
    if (!sql) {
      return []
    }

    const venues = await sql`SELECT * FROM venues ORDER BY name`
    return venues || []
  } catch (error) {
    console.error("Error getting all venues:", error)
    return []
  }
}

// Function to get venue by ID
export async function getVenueById(id: string) {
  try {
    if (!sql) {
      return null
    }

    const venue = await sql`SELECT * FROM venues WHERE id = ${id} LIMIT 1`
    return venue && venue.length > 0 ? venue[0] : null
  } catch (error) {
    console.error(`Error getting venue by ID ${id}:`, error)
    return null
  }
}

// Function to ensure default venues exist
export async function ensureDefaultVenues() {
  try {
    if (!sql) {
      return false
    }

    // Check if venues table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'venues'
      )
    `

    if (!tableExists[0].exists) {
      console.log("Venues table does not exist")
      return false
    }

    // Check if any venues exist
    const venueCount = await sql`SELECT COUNT(*) FROM venues`

    if (Number.parseInt(venueCount[0].count) > 0) {
      console.log(`${venueCount[0].count} venues already exist`)
      return true
    }

    // Create default venues
    const defaultVenues = [
      {
        id: "wankhede",
        name: "Wankhede Stadium",
        city: "Mumbai",
        country: "India",
      },
      {
        id: "chepauk",
        name: "M.A. Chidambaram Stadium",
        city: "Chennai",
        country: "India",
      },
      {
        id: "eden-gardens",
        name: "Eden Gardens",
        city: "Kolkata",
        country: "India",
      },
      {
        id: "narendra-modi-stadium",
        name: "Narendra Modi Stadium",
        city: "Ahmedabad",
        country: "India",
      },
      {
        id: "arun-jaitley-stadium",
        name: "Arun Jaitley Stadium",
        city: "Delhi",
        country: "India",
      },
    ]

    for (const venue of defaultVenues) {
      await sql`
        INSERT INTO venues (
          id, name, city, country, 
          created_at, updated_at
        ) VALUES (
          ${venue.id}, ${venue.name}, ${venue.city}, ${venue.country},
          NOW(), NOW()
        )
        ON CONFLICT (id) DO NOTHING
      `
    }

    console.log(`Created ${defaultVenues.length} default venues`)
    return true
  } catch (error) {
    console.error("Error ensuring default venues:", error)
    return false
  }
}
