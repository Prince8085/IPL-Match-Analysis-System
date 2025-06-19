import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Activity, Shield, RefreshCw, Server } from "lucide-react"

export const metadata: Metadata = {
  title: "Database Management",
  description: "Manage database operations for the IPL Match Analysis System",
}

export default function DatabasePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Database Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <span>Connection Test</span>
            </CardTitle>
            <CardDescription>Test the database connection and view connection details</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Verify that your application can connect to the database and check connection parameters.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/database/connection-test" className="w-full">
              <Button variant="outline" className="w-full">
                Test Connection
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <span>Database Status</span>
            </CardTitle>
            <CardDescription>View database status, tables, and record counts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Check the status of your database tables, view record counts, and monitor database health.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/database/status" className="w-full">
              <Button variant="outline" className="w-full">
                View Status
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>Integrity Checker</span>
            </CardTitle>
            <CardDescription>Check and fix database integrity issues</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Identify and resolve foreign key constraint violations and other database integrity issues.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/database/integrity" className="w-full">
              <Button variant="outline" className="w-full">
                Check Integrity
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              <span>Initialize Database</span>
            </CardTitle>
            <CardDescription>Initialize or reset the database schema and seed data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create database tables, constraints, and populate with initial seed data.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/database/init" className="w-full">
              <Button variant="outline" className="w-full">
                Initialize Database
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              <span>Backup & Restore</span>
            </CardTitle>
            <CardDescription>Backup and restore database data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create backups of your database data and restore from previous backups.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/database/backup" className="w-full">
              <Button variant="outline" className="w-full">
                Backup & Restore
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
