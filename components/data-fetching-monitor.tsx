"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, Database, RefreshCw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DataFetchingMonitor() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [venueToTest, setVenueToTest] = useState("")
  const [venueTestResults, setVenueTestResults] = useState(null)
  const [venueTestLoading, setVenueTestLoading] = useState(false)
  const [error, setError] = useState(null)

  const runTests = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/data-fetching/test")
      const data = await response.json()

      if (data.success) {
        setTestResults(data.results)
      } else {
        setError(data.message || "Failed to run data fetching tests")
      }
    } catch (error) {
      console.error("Error running data fetching tests:", error)
      setError("An error occurred while running the tests")
    } finally {
      setIsLoading(false)
    }
  }

  const testVenue = async () => {
    if (!venueToTest.trim()) {
      setError("Please enter a venue name to test")
      return
    }

    setVenueTestLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/data-fetching/test-venue?venue=${encodeURIComponent(venueToTest)}`)
      const data = await response.json()

      if (data.success) {
        setVenueTestResults(data.results)
      } else {
        setError(data.message || "Failed to test venue matching")
      }
    } catch (error) {
      console.error("Error testing venue matching:", error)
      setError("An error occurred while testing venue matching")
    } finally {
      setVenueTestLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Data Fetching Monitor</CardTitle>
          <CardDescription className="text-gray-400">
            Test and monitor data fetching mechanisms in the application
          </CardDescription>
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

            <div className="flex flex-col md:flex-row gap-4">
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

              <div className="flex flex-1 gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter venue name to test"
                    value={venueToTest}
                    onChange={(e) => setVenueToTest(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={testVenue}
                  disabled={venueTestLoading || !venueToTest.trim()}
                >
                  {venueTestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {testResults && (
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-gray-700">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="database"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    Database
                  </TabsTrigger>
                  <TabsTrigger
                    value="data"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    Data Fetching
                  </TabsTrigger>
                  <TabsTrigger
                    value="errors"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    Errors
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-300">Database Connection</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          {testResults.databaseConnection ? (
                            <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
                          )}
                          <span className="text-lg font-medium text-white">
                            {testResults.databaseConnection ? "Connected" : "Failed"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-300">Tables Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Teams</span>
                            <Badge className={testResults.tablesExist.teams ? "bg-green-600" : "bg-red-600"}>
                              {testResults.tablesExist.teams ? "Exists" : "Missing"}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Venues</span>
                            <Badge className={testResults.tablesExist.venues ? "bg-green-600" : "bg-red-600"}>
                              {testResults.tablesExist.venues ? "Exists" : "Missing"}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Players</span>
                            <Badge className={testResults.tablesExist.players ? "bg-green-600" : "bg-red-600"}>
                              {testResults.tablesExist.players ? "Exists" : "Missing"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-300">Data Fetching Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Teams</span>
                            <Badge className={testResults.dataFetching.teams ? "bg-green-600" : "bg-red-600"}>
                              {testResults.dataFetching.teams ? "Success" : "Failed"}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Venues</span>
                            <Badge className={testResults.dataFetching.venues ? "bg-green-600" : "bg-red-600"}>
                              {testResults.dataFetching.venues ? "Success" : "Failed"}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Match Data</span>
                            <Badge className={testResults.dataFetching.matchData ? "bg-green-600" : "bg-red-600"}>
                              {testResults.dataFetching.matchData ? "Success" : "Failed"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="database" className="mt-4">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white">Database Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 bg-gray-600">
                            <Database className="h-4 w-4 text-gray-300" />
                          </div>
                          <div>
                            <div className="text-white font-medium">Connection Status</div>
                            <div className="text-gray-400">
                              {testResults.databaseConnection
                                ? "Successfully connected to the database"
                                : "Failed to connect to the database"}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-600 pt-4">
                          <h3 className="text-white font-medium mb-2">Tables</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                              <span className="text-gray-300">Teams</span>
                              <Badge className={testResults.tablesExist.teams ? "bg-green-600" : "bg-red-600"}>
                                {testResults.tablesExist.teams ? "Exists" : "Missing"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                              <span className="text-gray-300">Venues</span>
                              <Badge className={testResults.tablesExist.venues ? "bg-green-600" : "bg-red-600"}>
                                {testResults.tablesExist.venues ? "Exists" : "Missing"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                              <span className="text-gray-300">Players</span>
                              <Badge className={testResults.tablesExist.players ? "bg-green-600" : "bg-red-600"}>
                                {testResults.tablesExist.players ? "Exists" : "Missing"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="data" className="mt-4">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white">Data Fetching Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-800 rounded">
                            <h3 className="text-white font-medium mb-2">Teams</h3>
                            <div className="flex items-center mb-2">
                              <Badge
                                className={testResults.dataFetching.teams ? "bg-green-600 mr-2" : "bg-red-600 mr-2"}
                              >
                                {testResults.dataFetching.teams ? "Success" : "Failed"}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm">
                              {testResults.dataFetching.teams
                                ? "Teams data was successfully fetched from the data source"
                                : "Failed to fetch teams data. Check the errors tab for details."}
                            </p>
                          </div>

                          <div className="p-4 bg-gray-800 rounded">
                            <h3 className="text-white font-medium mb-2">Venues</h3>
                            <div className="flex items-center mb-2">
                              <Badge
                                className={testResults.dataFetching.venues ? "bg-green-600 mr-2" : "bg-red-600 mr-2"}
                              >
                                {testResults.dataFetching.venues ? "Success" : "Failed"}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm">
                              {testResults.dataFetching.venues
                                ? "Venues data was successfully fetched from the data source"
                                : "Failed to fetch venues data. Check the errors tab for details."}
                            </p>
                          </div>

                          <div className="p-4 bg-gray-800 rounded">
                            <h3 className="text-white font-medium mb-2">Players</h3>
                            <div className="flex items-center mb-2">
                              <Badge
                                className={testResults.dataFetching.players ? "bg-green-600 mr-2" : "bg-red-600 mr-2"}
                              >
                                {testResults.dataFetching.players ? "Success" : "Failed"}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm">
                              {testResults.dataFetching.players
                                ? "Players data was successfully fetched from the data source"
                                : "Failed to fetch players data. Check the errors tab for details."}
                            </p>
                          </div>

                          <div className="p-4 bg-gray-800 rounded">
                            <h3 className="text-white font-medium mb-2">Match Data</h3>
                            <div className="flex items-center mb-2">
                              <Badge
                                className={testResults.dataFetching.matchData ? "bg-green-600 mr-2" : "bg-red-600 mr-2"}
                              >
                                {testResults.dataFetching.matchData ? "Success" : "Failed"}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm">
                              {testResults.dataFetching.matchData
                                ? "Match data was successfully fetched and processed"
                                : "Failed to fetch or process match data. Check the errors tab for details."}
                            </p>
                          </div>

                          <div className="p-4 bg-gray-800 rounded">
                            <h3 className="text-white font-medium mb-2">Predictions</h3>
                            <div className="flex items-center mb-2">
                              <Badge
                                className={
                                  testResults.dataFetching.predictions ? "bg-green-600 mr-2" : "bg-red-600 mr-2"
                                }
                              >
                                {testResults.dataFetching.predictions ? "Success" : "Failed"}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm">
                              {testResults.dataFetching.predictions
                                ? "Predictions were successfully generated"
                                : "Failed to generate predictions. Check the errors tab for details."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="errors" className="mt-4">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white">Errors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {testResults.errors && testResults.errors.length > 0 ? (
                        <div className="space-y-2">
                          {testResults.errors.map((error, index) => (
                            <Alert
                              key={index}
                              variant="destructive"
                              className="bg-red-900/20 border-red-800 text-red-300"
                            >
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Error {index + 1}</AlertTitle>
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-6">
                          <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                          <span className="text-gray-300">No errors detected</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {venueTestResults && (
              <Card className="bg-gray-700 border-gray-600 mt-4">
                <CardHeader>
                  <CardTitle className="text-white">Venue Matching Results: "{venueToTest}"</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-800 rounded">
                        <h3 className="text-white font-medium mb-2">Exact Match</h3>
                        <Badge className={venueTestResults.exactMatch ? "bg-green-600" : "bg-red-600"}>
                          {venueTestResults.exactMatch ? "Found" : "Not Found"}
                        </Badge>
                      </div>

                      <div className="p-3 bg-gray-800 rounded">
                        <h3 className="text-white font-medium mb-2">Case-Insensitive Match</h3>
                        <Badge className={venueTestResults.caseInsensitiveMatch ? "bg-green-600" : "bg-red-600"}>
                          {venueTestResults.caseInsensitiveMatch ? "Found" : "Not Found"}
                        </Badge>
                      </div>

                      <div className="p-3 bg-gray-800 rounded">
                        <h3 className="text-white font-medium mb-2">Partial Match</h3>
                        <Badge className={venueTestResults.partialMatch ? "bg-green-600" : "bg-red-600"}>
                          {venueTestResults.partialMatch ? "Found" : "Not Found"}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-800 rounded">
                      <h3 className="text-white font-medium mb-2">Match Data Result</h3>
                      <div className="flex items-center mb-2">
                        <Badge className={venueTestResults.matchDataSuccess ? "bg-green-600 mr-2" : "bg-red-600 mr-2"}>
                          {venueTestResults.matchDataSuccess ? "Success" : "Failed"}
                        </Badge>
                      </div>

                      {venueTestResults.venueUsed && (
                        <div className="mt-2">
                          <Label className="text-gray-400">Venue Used</Label>
                          <div className="p-2 bg-gray-700 rounded mt-1 text-white">{venueTestResults.venueUsed}</div>
                        </div>
                      )}

                      {venueTestResults.error && (
                        <Alert variant="destructive" className="mt-2 bg-red-900/20 border-red-800 text-red-300">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{venueTestResults.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
