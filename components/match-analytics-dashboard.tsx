"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  fetchTeams,
  fetchMatchData,
  generatePredictions,
  initializeDatabase,
  checkDbInitialized,
} from "@/lib/data-service"
import { AlertCircle, Calendar, ChevronDown, Database, Loader2, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"

import MatchOverview from "@/components/match-overview"
import BallByBallPredictions from "@/components/ball-by-ball-predictions"
import PlayerAnalysis from "@/components/player-analysis"
import TeamComparison from "@/components/team-comparison"
import VenueAnalysis from "@/components/venue-analysis"
import ModelInsights from "@/components/model-insights"
import LiveScoreboard from "@/components/live-scoreboard"
import { DataHealthMonitor } from "@/components/data-health-monitor"

export default function MatchAnalyticsDashboard() {
  const [teams, setTeams] = useState([])
  const [selectedTeam1, setSelectedTeam1] = useState("")
  const [selectedTeam2, setSelectedTeam2] = useState("")
  const [venue, setVenue] = useState("")
  const [date, setDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [predictions, setPredictions] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLive, setIsLive] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [dataSourcesExpanded, setDataSourcesExpanded] = useState(false)
  const [modelConfidence, setModelConfidence] = useState(85)
  const [error, setError] = useState(null)
  const [dbInitializing, setDbInitializing] = useState(false)
  const [dbStatus, setDbStatus] = useState<"checking" | "initializing" | "initialized" | "error">("checking")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const venues = [
    "M. A. Chidambaram Stadium, Chennai",
    "Wankhede Stadium, Mumbai",
    "Eden Gardens, Kolkata",
    "Arun Jaitley Stadium, Delhi",
    "M. Chinnaswamy Stadium, Bangalore",
    "Rajiv Gandhi International Stadium, Hyderabad",
    "Punjab Cricket Association Stadium, Mohali",
    "Sawai Mansingh Stadium, Jaipur",
    "Narendra Modi Stadium, Ahmedabad",
    "Barsapara Cricket Stadium, Guwahati",
  ]

  const dataSources = [
    { name: "ESPNCricinfo", status: "Connected", latency: "120ms" },
    { name: "CricBuzz", status: "Connected", latency: "150ms" },
    { name: "IPL Official", status: "Connected", latency: "200ms" },
    { name: "Cricket API", status: "Connected", latency: "180ms" },
    { name: "Weather API", status: "Connected", latency: "250ms" },
    { name: "Historical Database", status: "Connected", latency: "100ms" },
  ]

  // Check database status and initialize if needed
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        setDbStatus("checking")
        console.log("Checking database status...")

        // Check if database is initialized
        const isInitialized = await checkDbInitialized()
        console.log("Database initialized:", isInitialized)

        if (!isInitialized) {
          // Database not initialized, let's initialize it
          setDbStatus("initializing")
          console.log("Initializing database...")

          const result = await initializeDatabase()
          console.log("Database initialization result:", result)

          if (result.success) {
            setDbStatus("initialized")
          } else {
            setDbStatus("error")
            setError(result.message || "Failed to initialize database")
          }
        } else {
          setDbStatus("initialized")
        }

        // Now load the teams data
        console.log("Fetching teams data...")
        const teamsData = await fetchTeams()
        console.log("Teams data:", teamsData)

        setTeams(teamsData)
        setInitialLoading(false)
      } catch (error) {
        console.error("Database setup error:", error)
        setDbStatus("error")
        setError("Failed to setup database. Please try refreshing the page.")
        setInitialLoading(false)
      }
    }

    setupDatabase()
  }, [])

  useEffect(() => {
    let intervalId

    if (isLive) {
      if (predictions) {
        // If we have predictions, refresh them on interval
        intervalId = setInterval(() => {
          refreshPredictions()
        }, refreshInterval * 1000)
      } else if (selectedTeam1 && selectedTeam2 && venue) {
        // If we don't have predictions but have all required data, generate them
        handleGeneratePredictions()
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isLive, refreshInterval, predictions, selectedTeam1, selectedTeam2, venue])

  const refreshPredictions = async () => {
    if (!selectedTeam1 || !selectedTeam2 || !venue) return

    try {
      console.log("Refreshing predictions...")
      setLoading(true)
      const matchData = await fetchMatchData(selectedTeam1, selectedTeam2, venue)
      const newPredictions = await generatePredictions(matchData, true) // true for live update
      setPredictions(newPredictions)
      setError(null) // Clear any previous errors
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to refresh predictions:", error)
      setError(`Failed to refresh predictions: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePredictions = async () => {
    if (!selectedTeam1 || !selectedTeam2 || !venue) {
      setError("Please select both teams and a venue")
      return
    }

    if (selectedTeam1 === selectedTeam2) {
      setError("Please select different teams")
      return
    }

    setError(null)
    setLoading(true)

    // Simulate progress
    setAnalysisProgress(0)
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 500)

    try {
      console.log("Generating predictions for teams:", selectedTeam1, selectedTeam2, "at venue:", venue)

      // Fetch match data first
      const matchData = await fetchMatchData(selectedTeam1, selectedTeam2, venue, date)
      console.log("Match data fetched:", matchData)

      if (!matchData) {
        throw new Error("Failed to fetch match data")
      }

      // Generate predictions based on match data
      console.log("Generating predictions...")
      const predictionsData = await generatePredictions(matchData)
      console.log("Predictions generated:", predictionsData)

      if (!predictionsData) {
        throw new Error("Failed to generate predictions")
      }

      setPredictions(predictionsData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to generate predictions:", error)
      setError(`Failed to generate predictions: ${error.message}`)
    } finally {
      setLoading(false)
      // Reset progress after a delay
      setTimeout(() => setAnalysisProgress(0), 1000)
      clearInterval(progressInterval)
      setAnalysisProgress(100)
    }
  }

  const handleInitializeDatabase = async () => {
    setDbInitializing(true)
    setError(null)
    setDbStatus("initializing")

    try {
      console.log("Initializing database...")
      const result = await initializeDatabase()
      console.log("Database initialization result:", result)

      if (result.success) {
        // Reload teams after initialization
        console.log("Fetching teams after initialization...")
        const teamsData = await fetchTeams()
        console.log("Teams data:", teamsData)

        setTeams(teamsData)
        setError(null)
        setDbStatus("initialized")
      } else {
        setError(result.message || "Failed to initialize database")
        setDbStatus("error")
      }
    } catch (error) {
      console.error("Failed to initialize database:", error)
      setError(`Failed to initialize database: ${error.message}`)
      setDbStatus("error")
    } finally {
      setDbInitializing(false)
    }
  }

  // Show loading state while checking or initializing database
  if (dbStatus === "checking" || dbStatus === "initializing") {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Database Setup</CardTitle>
            <CardDescription className="text-gray-400">
              {dbStatus === "checking" ? "Checking database status..." : "Initializing database..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-700 p-3 mb-4">
              <Database className="h-8 w-8 text-purple-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {dbStatus === "checking" ? "Checking Database Status" : "Setting Up Database"}
            </h3>
            <p className="text-gray-400 max-w-md text-center">
              {dbStatus === "checking"
                ? "Checking if the database is ready for use..."
                : "Creating tables and initializing data. This may take a moment..."}
            </p>
            <div className="mt-6">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <CardTitle className="text-white">Match Setup</CardTitle>
              <CardDescription className="text-gray-400">Configure match parameters for analysis</CardDescription>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <Switch
                  id="live-mode"
                  checked={isLive}
                  onCheckedChange={(checked) => {
                    setIsLive(checked)
                    if (checked && !predictions && selectedTeam1 && selectedTeam2 && venue) {
                      // Auto-generate predictions when enabling live mode without existing predictions
                      handleGeneratePredictions()
                    }
                  }}
                />
                <Label htmlFor="live-mode" className="text-white">
                  Live Mode
                </Label>
                {isLive && (
                  <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-700 animate-pulse">
                    Active
                  </Badge>
                )}
              </div>
              {isLive && predictions && (
                <Select
                  value={refreshInterval.toString()}
                  onValueChange={(value) => setRefreshInterval(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-[130px] bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Refresh Rate" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {dbStatus === "error" && (
            <div className="mb-4">
              <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Database Error</AlertTitle>
                <AlertDescription>
                  There was an error with the database. Please try initializing it again.
                </AlertDescription>
              </Alert>
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={handleInitializeDatabase}
                  disabled={dbInitializing}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {dbInitializing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing Database...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Initialize Database
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Team 1</label>
              <Select value={selectedTeam1} onValueChange={setSelectedTeam1} disabled={initialLoading || loading}>
                <SelectTrigger
                  className={`bg-gray-700 border-gray-600 ${selectedTeam1 === selectedTeam2 && selectedTeam1 !== "" ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select Team 1" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTeam1 === selectedTeam2 && selectedTeam1 !== "" && (
                <p className="text-xs text-red-400 mt-1">Teams must be different</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Team 2</label>
              <Select value={selectedTeam2} onValueChange={setSelectedTeam2} disabled={initialLoading || loading}>
                <SelectTrigger
                  className={`bg-gray-700 border-gray-600 ${selectedTeam1 === selectedTeam2 && selectedTeam2 !== "" ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select Team 2" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Venue</label>
              <Select value={venue} onValueChange={setVenue} disabled={initialLoading}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select Venue" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {venues.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Match Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-gray-700 border-gray-600 hover:bg-gray-600"
                    disabled={initialLoading}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-700 border-gray-600">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="bg-gray-700"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col space-y-2 w-full md:w-auto">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-300">Model Confidence Threshold</span>
                <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700">
                  {modelConfidence}%
                </Badge>
              </div>
              <Slider
                value={[modelConfidence]}
                min={50}
                max={95}
                step={5}
                onValueChange={(value) => setModelConfidence(value[0])}
                className="w-full md:w-[200px]"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                className="border-gray-600 hover:bg-gray-700 text-gray-300"
                onClick={() => setDataSourcesExpanded(!dataSourcesExpanded)}
              >
                <Database className="mr-2 h-4 w-4" />
                Data Sources
                <ChevronDown
                  className={`ml-2 h-4 w-4 transition-transform ${dataSourcesExpanded ? "rotate-180" : ""}`}
                />
              </Button>

              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white relative overflow-hidden"
                onClick={handleGeneratePredictions}
                disabled={
                  loading ||
                  initialLoading ||
                  !selectedTeam1 ||
                  !selectedTeam2 ||
                  !venue ||
                  selectedTeam1 === selectedTeam2
                }
              >
                {loading && (
                  <div
                    className="absolute inset-0 bg-purple-800 opacity-80"
                    style={{ width: `${analysisProgress}%`, transition: "width 0.3s ease-in-out" }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...{" "}
                      {analysisProgress > 0 && analysisProgress < 100 ? `${Math.round(analysisProgress)}%` : ""}
                    </>
                  ) : (
                    "Generate Analysis"
                  )}
                </span>
              </Button>
            </div>
          </div>

          {dataSourcesExpanded && (
            <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Connected Data Sources</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {dataSources.map((source) => (
                  <div key={source.name} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-sm">{source.name}</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 mr-2">{source.latency}</span>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4 bg-red-900/20 border-red-800 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Health Monitor */}
      <DataHealthMonitor />

      {initialLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-lg bg-gray-800" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-[200px] w-full rounded-lg bg-gray-800" />
            <Skeleton className="h-[200px] w-full rounded-lg bg-gray-800" />
          </div>
        </div>
      ) : predictions ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {/* Real-time status indicator */}
            {isLive && predictions && (
              <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                  <span className="font-medium">LIVE Analysis</span>
                  {lastUpdated && (
                    <span className="text-xs ml-2 opacity-80">Last updated: {format(lastUpdated, "HH:mm:ss")}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshPredictions}
                    disabled={loading}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                    Refresh Now
                  </Button>
                  <div className="text-xs bg-white/20 px-2 py-1 rounded">Auto-refresh: {refreshInterval}s</div>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 bg-gray-800">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-700">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="ball-by-ball" className="data-[state=active]:bg-purple-700">
                  Ball-by-Ball
                </TabsTrigger>
                <TabsTrigger value="players" className="data-[state=active]:bg-purple-700">
                  Players
                </TabsTrigger>
                <TabsTrigger value="teams" className="data-[state=active]:bg-purple-700">
                  Teams
                </TabsTrigger>
                <TabsTrigger value="venue" className="data-[state=active]:bg-purple-700">
                  Venue
                </TabsTrigger>
                <TabsTrigger value="model" className="data-[state=active]:bg-purple-700">
                  Model
                </TabsTrigger>
              </TabsList>

              {/* Enhanced tab content with loading states */}
              {loading ? (
                <div className="mt-6 p-8 bg-gray-800 rounded-lg flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
                  <div className="text-white text-lg font-medium">Analyzing Match Data</div>
                  <div className="text-gray-400 mt-1">Generating advanced predictions...</div>
                  <div className="w-full max-w-md mt-4">
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${analysisProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>Collecting data</span>
                      <span>Processing</span>
                      <span>Finalizing</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <TabsContent value="overview" className="mt-6">
                    <MatchOverview predictions={predictions} />
                  </TabsContent>

                  <TabsContent value="ball-by-ball" className="mt-6">
                    <BallByBallPredictions predictions={predictions} isLive={isLive} />
                  </TabsContent>

                  <TabsContent value="players" className="mt-6">
                    <PlayerAnalysis predictions={predictions} />
                  </TabsContent>

                  <TabsContent value="teams" className="mt-6">
                    <TeamComparison predictions={predictions} />
                  </TabsContent>

                  <TabsContent value="venue" className="mt-6">
                    <VenueAnalysis predictions={predictions} venue={venue} />
                  </TabsContent>

                  <TabsContent value="model" className="mt-6">
                    <ModelInsights predictions={predictions} />
                  </TabsContent>
                </>
              )}
            </Tabs>

            {/* Advanced analytics insights panel */}
            {predictions && !loading && (
              <Card className="bg-gray-800 border-gray-700 mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Advanced Insights</CardTitle>
                  <CardDescription className="text-gray-400">AI-powered match analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-900/20 border border-purple-800 rounded-lg">
                      <h4 className="font-medium text-purple-300 mb-1">Key Match Factors</h4>
                      <p className="text-sm text-gray-300">
                        {predictions.teams.team1}'s recent form suggests a {predictions.winProbability.team1}% chance of
                        victory, with their bowling attack being particularly effective at this venue. Watch for the
                        powerplay phase which could be decisive.
                      </p>
                    </div>

                    <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                      <h4 className="font-medium text-blue-300 mb-1">Critical Matchups</h4>
                      <p className="text-sm text-gray-300">
                        The battle between pace bowlers and top-order batsmen will be crucial in the first 6 overs.
                        {predictions.teams.team2}'s spinners have a historical advantage in the middle overs at this
                        venue.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <LiveScoreboard predictions={predictions} isLive={isLive} />

            {/* Enhanced data sources panel */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Data Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Match Statistics</span>
                  <Badge className="bg-green-600">Connected</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Player Performance</span>
                  <Badge className="bg-green-600">Connected</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Historical Data</span>
                  <Badge className="bg-green-600">Connected</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Weather API</span>
                  <Badge className="bg-green-600">Connected</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">AI Prediction Engine</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Model confidence indicator */}
            {predictions && !loading && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Prediction Confidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Model Confidence</span>
                      <span className="text-xs font-medium text-white">{modelConfidence}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-700 rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          modelConfidence > 80 ? "bg-green-600" : modelConfidence > 60 ? "bg-amber-600" : "bg-red-600"
                        }`}
                        style={{ width: `${modelConfidence}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Based on {isLive ? "real-time" : "historical"} data analysis and machine learning algorithms
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-700 p-3 mb-4">
                <Database className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No Analysis Generated Yet</h3>
              <p className="text-gray-400 max-w-md">
                Select teams, venue, and date above, then click "Generate Analysis" to see comprehensive match insights
                and predictions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
