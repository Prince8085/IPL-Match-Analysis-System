import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

export async function updateDataService() {
  try {
    const dataServicePath = join(process.cwd(), "lib", "data-service.ts")
    const dataServiceUpdatePath = join(process.cwd(), "lib", "data-service-update.ts")

    if (!existsSync(dataServicePath)) {
      return { success: false, message: "data-service.ts file not found" }
    }

    if (!existsSync(dataServiceUpdatePath)) {
      return { success: false, message: "data-service-update.ts file not found" }
    }

    const dataServiceContent = readFileSync(dataServicePath, "utf8")
    const dataServiceUpdateContent = readFileSync(dataServiceUpdatePath, "utf8")

    // Create a backup of the original file
    writeFileSync(join(process.cwd(), "lib", "data-service.backup.ts"), dataServiceContent)

    // Replace the original file with the updated version
    writeFileSync(dataServicePath, dataServiceUpdateContent)

    return { success: true, message: "data-service.ts updated successfully" }
  } catch (error) {
    console.error("Error updating data-service.ts:", error)
    return { success: false, message: "Failed to update data-service.ts", error: String(error) }
  }
}
