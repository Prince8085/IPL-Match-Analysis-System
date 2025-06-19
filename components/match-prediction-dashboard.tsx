"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import MatchPredictionChart from "@/components/match-prediction-chart"
import PlayerPerformanceTable from "@/components/player-performance-table"
import PitchAnalysis from "@/components/pitch-analysis"

// Import only the essential functions from data-service
import { fetchTeams, fetchVenues, fetchPlayers, generatePrediction } from "@/lib/data-service"

export default function MatchPredictionDashboard() {
  const [teams, setTeams] = useState([])
  const [venues, setVenues] = useState([])
  const [players, setPlayers] = useState([])
  const [selectedTeam1, setSelectedTeam1] = useState("")
  const [selectedTeam2, setSelectedTeam2] = useState("")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [error, setError] = useState(null)
  const { toast } = useToast()

  // Load teams and venues on component mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load teams
        const teamsData = await fetchTeams()
        if (teamsData && teamsData.length > 0) {
          console.log("Teams loaded:", teamsData.length)
          setTeams(teamsData)
        } else {
          console.error("No teams data returned")
          setError("Failed to load teams data")
        }

        // Load venues
        const venuesData = await fetchVenues()
        if (venuesData && venuesData.length > 0) {
          console.log("Venues loaded:", venuesData.length)
          setVenues(venuesData)
        } else {
          console.error("No venues data returned")
          setError("Failed to load venues data")
        }
      } catch (err) {
        console.error("Error loading initial data:", err)
        setError("Failed to load initial data: " + (err.message || "Unknown error"))
        toast({
          title: "Error",
          description: "Failed to load initial data",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [toast])

  // Load players when teams are selected
  useEffect(() => {
    async function loadPlayers() {
      if (!selectedTeam1 || !selectedTeam2) return

      try {
        const teamIds = [selectedTeam1, selectedTeam2]
        console.log("Fetching players for teams:", teamIds)
        const playersData = await fetchPlayers(teamIds)

        if (playersData && playersData.length > 0) {
          console.log("Players loaded:", playersData.length)
          setPlayers(playersData)
        } else {
          console.log("No players found for selected teams")
          setPlayers([])
        }
      } catch (err) {
        console.error("Error loading players:", err)
        toast({
          title: "Warning",
          description: "Could not load players data",
          variant: "destructive",
        })
      }
    }

    loadPlayers()
  }, [selectedTeam1, selectedTeam2, toast])

  // Generate prediction
  const handleGeneratePrediction = async () => {
    if (!selectedTeam1 || !selectedTeam2 || !selectedVenue) {
      setError("Please select both teams and a venue")
      return
    }

    if (selectedTeam1 === selectedTeam2) {
      setError("Please select different teams")
      return
    }

    setError(null)
    setLoading(true)

    try {
      console.log("Generating prediction for:", {
        team1Id: selectedTeam1,
        team2Id: selectedTeam2,
        venue: selectedVenue,
      })

      // Simple match data object
      const matchData = {
        team1Id: selectedTeam1,
        team2Id: selectedTeam2,
        venue: selectedVenue,
      }

      // Generate prediction directly
      const result = await generatePrediction(matchData)
      console.log("Prediction result:", result)

      if (result) {
        setPrediction(result)
        toast({
          title: "Success",
          description: "Match prediction generated successfully",
        })
      } else {
        throw new Error("No prediction data returned")
      }
    } catch (err) {
      console.error("Error generating prediction:", err)
      setError("Failed to generate prediction: " + (err.message || "Unknown error"))
      toast({
        title: "Error",
        description: "Failed to generate prediction",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Match Setup</CardTitle>
          <CardDescription>Select teams and venue to analyze the match</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Team 1</label>
              <Select value={selectedTeam1} onValueChange={setSelectedTeam1}>
                <SelectTrigger className="bg-white dark:bg-gray-700">
                  <SelectValue placeholder="Select Team 1" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700">
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Team 2</label>
              <Select value={selectedTeam2} onValueChange={setSelectedTeam2}>
                <SelectTrigger className="bg-white dark:bg-gray-700">
                  <SelectValue placeholder="Select Team 2" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700">
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTeam1 === selectedTeam2 && selectedTeam1 && (
                <p className="text-xs text-red-500">Teams must be different</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Venue</label>
              <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                <SelectTrigger className="bg-white dark:bg-gray-700">
                  <SelectValue placeholder="Select Venue" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700">
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleGeneratePrediction}
            disabled={loading || !selectedTeam1 || !selectedTeam2 || !selectedVenue || selectedTeam1 === selectedTeam2}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Prediction"
            )}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="pitch">Pitch Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Match Prediction</CardTitle>
                <CardDescription>Win probability and key insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Win Probability</h3>
                    <MatchPredictionChart prediction={prediction} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Key Insights</h3>
                    <ul className="space-y-2">
                      {prediction.insights &&
                        prediction.insights.map((insight, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                            <span>{typeof insight === "string" ? insight : insight.text}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="players" className="mt-4">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Player Analysis</CardTitle>
                <CardDescription>Player performance projections</CardDescription>
              </CardHeader>
              <CardContent>
                <PlayerPerformanceTable players={players} prediction={prediction} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pitch" className="mt-4">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Pitch Analysis</CardTitle>
                <CardDescription>Venue conditions and impact</CardDescription>
              </CardHeader>
              <CardContent>
                <PitchAnalysis venue={selectedVenue} prediction={prediction} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
