import type { Metadata } from "next"
import DatabaseIntegrityChecker from "@/components/database-integrity-checker"

export const metadata: Metadata = {
  title: "Database Integrity Checker",
  description: "Check and fix database integrity issues in the IPL Match Analysis System",
}

export default function DatabaseIntegrityPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Database Integrity Checker</h1>
      </div>

      <p className="text-muted-foreground">
        This tool helps identify and fix database integrity issues, such as foreign key constraint violations.
      </p>

      <DatabaseIntegrityChecker />

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-6">
        <h2 className="text-lg font-medium text-amber-800 mb-2">About Database Integrity</h2>
        <p className="text-amber-700 mb-2">
          Database integrity ensures that data follows the defined relationships and constraints. Common issues include:
        </p>
        <ul className="list-disc pl-5 text-amber-700 space-y-1">
          <li>Foreign key constraint violations (references to non-existent records)</li>
          <li>Duplicate records where uniqueness is required</li>
          <li>Missing required data in non-nullable fields</li>
          <li>Inconsistent data across related tables</li>
        </ul>
        <p className="text-amber-700 mt-2">
          The integrity checker can automatically fix some issues, but manual intervention may be required for others.
        </p>
      </div>
    </div>
  )
}
