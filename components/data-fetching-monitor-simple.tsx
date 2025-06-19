"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"

export default function DataFetchingMonitorSimple() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [error, setError] = useState(null)

  const runTests = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock results
      setTestResults({
        databaseConnection: true,
        tablesExist: {
          teams: true,
          venues: true,
          players: true,
        },
        dataFetching: {
          teams: true,
          venues: true,
          matchData: true,
        },
        errors: [],
      })
    } catch (error) {
      console.error("Error running data fetching tests:", error)
      setError("An error occurred while running the tests")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Data Fetching Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={runTests} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Data Fetching Tests
                </>
              )}
            </Button>

            {testResults && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-medium mb-2">Test Results</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Database Connection</span>
                    <span className={testResults.databaseConnection ? "text-green-500" : "text-red-500"}>
                      {testResults.databaseConnection ? "Connected" : "Failed"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Teams Table</span>
                    <span className={testResults.tablesExist.teams ? "text-green-500" : "text-red-500"}>
                      {testResults.tablesExist.teams ? "Exists" : "Missing"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Venues Table</span>
                    <span className={testResults.tablesExist.venues ? "text-green-500" : "text-red-500"}>
                      {testResults.tablesExist.venues ? "Exists" : "Missing"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
