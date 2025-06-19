import type { Metadata } from "next"
import DatabaseConnectionTest from "@/components/db-connection-test"

export const metadata: Metadata = {
  title: "Database Connection Test",
  description: "Test your database connection",
}

export default function ConnectionTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-white">Database Connection Test</h1>
      <DatabaseConnectionTest />
    </div>
  )
}
