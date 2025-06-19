"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function DatabaseConnectionTest() {
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    message: string
    error?: string
  } | null>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/db/connection-test")
      const data = await response.json()
      setConnectionStatus(data)
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: "Failed to test database connection",
        error: error instanceof Error ? error.message : String(error),
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
              Database Connection Test
            </CardTitle>
            <CardDescription className="text-gray-400">
              Test the connection to your Neon PostgreSQL database
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={testConnection}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2 text-gray-300">Testing database connection...</span>
          </div>
        ) : connectionStatus ? (
          <>
            <div className="flex items-center mb-4">
              {connectionStatus.success ? (
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500 mr-2" />
              )}
              <span className={connectionStatus.success ? "text-green-400" : "text-red-400"}>
                {connectionStatus.message}
              </span>
            </div>
            {!connectionStatus.success && connectionStatus.error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                <AlertTitle className="text-red-400">Error Details</AlertTitle>
                <AlertDescription className="text-red-300 whitespace-pre-wrap">
                  {connectionStatus.error}
                </AlertDescription>
              </Alert>
            )}
            {connectionStatus.success && (
              <Alert className="bg-green-900/20 border-green-800">
                <AlertTitle className="text-green-400">Connection Successful</AlertTitle>
                <AlertDescription className="text-green-300">
                  Your application is successfully connected to the Neon PostgreSQL database.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <div className="text-gray-400 text-center py-4">No connection test has been run yet.</div>
        )}
      </CardContent>
    </Card>
  )
}
