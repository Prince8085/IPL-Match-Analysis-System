"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, XCircle, RefreshCw, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DatabaseStatus() {
  const [isLoading, setIsLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/db/status")

      if (!response.ok) {
        throw new Error(`Failed to check database status: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setDbStatus(data)
      } else {
        setError(data.message || "Failed to check database status")
        toast({
          title: "Error",
          description: data.message || "Failed to check database status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking database status:", error)
      setError(error instanceof Error ? error.message : "Failed to check database status")
      toast({
        title: "Error",
        description: "Failed to check database status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initializeDatabase = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/db/init")

      if (!response.ok) {
        throw new Error(`Failed to initialize database: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Database initialized successfully",
        })
        // Refresh status after initialization
        checkDatabaseStatus()
      } else {
        setError(data.message || "Failed to initialize database")
        toast({
          title: "Error",
          description: data.message || "Failed to initialize database",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error initializing database:", error)
      setError(error instanceof Error ? error.message : "Failed to initialize database")
      toast({
        title: "Error",
        description: "Failed to initialize database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Status
            </CardTitle>
            <CardDescription className="text-gray-400">Check the status of your database tables</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={checkDatabaseStatus}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-800">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400">Error</AlertTitle>
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2 text-gray-300">Checking database status...</span>
          </div>
        ) : dbStatus ? (
          <div className="space-y-4">
            <div className="flex items-center">
              {dbStatus.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className={dbStatus.connected ? "text-green-400" : "text-red-400"}>
                Database Connection: {dbStatus.connected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-gray-300 font-medium">Table Status:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {dbStatus.tables &&
                  Object.entries(dbStatus.tables).map(([tableName, status]: [string, any]) => (
                    <div key={tableName} className="flex items-center p-2 bg-gray-700/50 rounded-md">
                      {status.exists ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <span className="text-gray-300 capitalize">{tableName}:</span>
                      <span className="ml-2 text-gray-400">
                        {status.exists ? `${status.count} records` : "Table not found"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={initializeDatabase} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Initialize Database"
                )}
              </Button>
              <p className="text-xs text-gray-400 mt-1">This will create missing tables and seed with initial data</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No database status information available. Click refresh to check status.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
