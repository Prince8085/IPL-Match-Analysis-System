"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ChevronDown, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import PlayerPerformanceChart from "@/components/charts/player-performance-chart"
import PlayerMatchupChart from "@/components/charts/player-matchup-chart"

export default function PlayerAnalysis({ predictions }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [selectedRole, setSelectedRole] = useState("all")
  const [sortBy, setSortBy] = useState("impact")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(predictions.players?.[0]?.id || "")

  // Ensure players array exists
  const players = predictions.players || []

  // Filter players based on search term, team and role
  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTeam = selectedTeam === "all" || player.team === selectedTeam
    const matchesRole = selectedRole === "all" || player.role === selectedRole
    return matchesSearch && matchesTeam && matchesRole
  })

  // Sort players based on selected sort option
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === "impact") return b.matchImpact - a.matchImpact
    if (sortBy === "form") return b.formRating - a.formRating
    if (sortBy === "name") return a.name.localeCompare(b.name)
    return 0
  })

  // Get unique roles for filter dropdown
  const roles = [...new Set(players.map((player) => player.role))]

  // Get selected player details
  const playerDetails = players.find((player) => player.id === selectedPlayer) || null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <CardTitle className="text-white">Player Performance Analysis</CardTitle>
                <CardDescription className="text-gray-400">
                  Individual player statistics and projected performance
                </CardDescription>
              </div>
              <Button
                variant="outline"
                className="mt-2 md:mt-0 border-gray-600 hover:bg-gray-700 text-gray-300"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search players..."
                  className="pl-8 bg-gray-700 border-gray-600 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-700/30 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Team</label>
                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Select Team" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all">All Teams</SelectItem>
                        <SelectItem value={predictions.teams.team1}>{predictions.teams.team1}</SelectItem>
                        <SelectItem value={predictions.teams.team2}>{predictions.teams.team2}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Role</label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all">All Roles</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="impact">Match Impact</SelectItem>
                        <SelectItem value="form">Form Rating</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="rounded-md border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-700/50">
                        <th className="px-4 py-3 text-left font-medium text-gray-300">Player</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-300">Team</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-300">Role</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-300">Form</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-300">Match Impact</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-300">Key Stat</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-300"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {sortedPlayers.map((player) => (
                        <tr
                          key={player.id}
                          data-player-id={player.id}
                          className={`hover:bg-gray-700/30 ${selectedPlayer === player.id ? "bg-purple-900/20" : ""}`}
                        >
                          <td className="px-4 py-3 font-medium text-white">{player.name}</td>
                          <td className="px-4 py-3 text-gray-300">{player.team}</td>
                          <td className="px-4 py-3 text-gray-300">{player.role}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-700 rounded-full h-1.5 mr-2">
                                <div
                                  className="bg-purple-600 h-1.5 rounded-full"
                                  style={{ width: `${player.formRating * 10}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-300">{player.formRating}/10</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={`${
                                player.matchImpact >= 8
                                  ? "bg-green-600"
                                  : player.matchImpact >= 6
                                    ? "bg-blue-600"
                                    : "bg-gray-600"
                              } text-white border-0`}
                            >
                              {player.matchImpact}/10
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-300">{player.keyStat}</td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white hover:bg-gray-700"
                              onClick={() => setSelectedPlayer(player.id)}
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Player Details</CardTitle>
            <CardDescription className="text-gray-400">Detailed analysis and matchups</CardDescription>
          </CardHeader>
          <CardContent>
            {playerDetails ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {playerDetails.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{playerDetails.name}</h3>
                    <div className="flex items-center text-sm text-gray-400">
                      <span>{playerDetails.team}</span>
                      <span className="mx-2">•</span>
                      <span>{playerDetails.role}</span>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="performance" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                    <TabsTrigger value="performance" className="data-[state=active]:bg-purple-700">
                      Performance
                    </TabsTrigger>
                    <TabsTrigger value="matchups" className="data-[state=active]:bg-purple-700">
                      Matchups
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="performance" className="mt-4 space-y-4">
                    <PlayerPerformanceChart player={playerDetails} />

                    <div className="grid grid-cols-2 gap-2">
                      {(playerDetails.keyMetrics || []).map((metric, index) => (
                        <div key={index} className="p-2 bg-gray-700/30 rounded">
                          <p className="text-xs text-gray-400">{metric.name}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium">{metric.value}</p>
                            {metric.trend && (
                              <Badge
                                variant="outline"
                                className={`${
                                  metric.trend === "up"
                                    ? "bg-green-900/20 text-green-300 border-green-700"
                                    : "bg-red-900/20 text-red-300 border-red-700"
                                }`}
                              >
                                {metric.trend === "up" ? "↑" : "↓"} {metric.trendValue}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300">Recent Form</h4>
                      <div className="flex space-x-1">
                        {(playerDetails.recentForm || []).map((match, index) => (
                          <div
                            key={index}
                            className={`flex-1 p-2 rounded text-center ${
                              match.performance === "excellent"
                                ? "bg-green-900/30 text-green-300"
                                : match.performance === "good"
                                  ? "bg-blue-900/30 text-blue-300"
                                  : match.performance === "average"
                                    ? "bg-amber-900/30 text-amber-300"
                                    : "bg-red-900/30 text-red-300"
                            }`}
                          >
                            <div className="text-xs">{match.score}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Match Prediction</h4>
                      <div className="space-y-1">
                        {(playerDetails.matchPrediction || []).map((pred, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mt-1.5"></span>
                            <span className="text-gray-200 text-sm">{pred}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="matchups" className="mt-4 space-y-4">
                    <PlayerMatchupChart player={playerDetails} />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300">Key Matchups</h4>
                      {(playerDetails.keyMatchups || []).map((matchup, index) => (
                        <div key={index} className="p-3 bg-gray-700/30 rounded-lg mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-white">{matchup.against}</span>
                            <Badge
                              variant="outline"
                              className={`${
                                matchup.advantage === "favorable"
                                  ? "bg-green-900/20 text-green-300 border-green-700"
                                  : matchup.advantage === "neutral"
                                    ? "bg-blue-900/20 text-blue-300 border-blue-700"
                                    : "bg-red-900/20 text-red-300 border-red-700"
                              }`}
                            >
                              {matchup.advantage}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{matchup.insight}</p>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-1 bg-gray-700 rounded">
                              <p className="text-gray-400">Balls</p>
                              <p className="text-white">{matchup.stats.balls}</p>
                            </div>
                            <div className="p-1 bg-gray-700 rounded">
                              <p className="text-gray-400">Runs</p>
                              <p className="text-white">{matchup.stats.runs}</p>
                            </div>
                            <div className="p-1 bg-gray-700 rounded">
                              <p className="text-gray-400">Dismissals</p>
                              <p className="text-white">{matchup.stats.dismissals}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-center">
                <div>
                  <p className="text-gray-400 mb-2">Select a player to view detailed analysis</p>
                  <Button
                    variant="outline"
                    className="border-gray-600 hover:bg-gray-700 text-gray-300 relative transition-all duration-200 transform hover:scale-105 active:scale-95"
                    onClick={() => {
                      // Set loading state
                      const btn = document.activeElement as HTMLButtonElement
                      if (btn) {
                        btn.disabled = true
                        btn.innerHTML = '<span class="animate-pulse">Loading...</span>'
                      }

                      // Simulate a small delay for better UX
                      setTimeout(() => {
                        // Check if there are players available
                        if (predictions.players && predictions.players.length > 0) {
                          setSelectedPlayer(predictions.players[0].id)

                          // Add a highlight effect to the selected player row
                          const playerRow = document.querySelector(`tr[data-player-id="${predictions.players[0].id}"]`)
                          if (playerRow) {
                            playerRow.classList.add("bg-purple-900/40")
                            setTimeout(() => {
                              playerRow.classList.remove("bg-purple-900/40")
                            }, 1500)
                          }
                        } else {
                          // Handle case when no players are available
                          alert("No players available for analysis")
                        }

                        // Reset button state
                        if (btn) {
                          btn.disabled = false
                          btn.innerHTML = "View First Player"
                        }
                      }, 600)
                    }}
                  >
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View First Player
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Advanced Player Metrics</CardTitle>
          <CardDescription className="text-gray-400">
            Specialized performance indicators and situational analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(predictions.advancedMetrics || []).map((metric, index) => (
              <div key={index} className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-white">{metric.name}</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" className="h-6 w-6 p-0">
                          <Info className="h-3 w-3 text-gray-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 border-gray-700">
                        <p>{metric.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="space-y-2">
                  {(metric.leaders || []).map((leader, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                      <div className="flex items-center">
                        <Badge
                          className={`mr-2 ${
                            leader.team === predictions.teams.team1 ? "bg-purple-600" : "bg-blue-600"
                          } text-white border-0`}
                        >
                          {idx + 1}
                        </Badge>
                        <span className="text-gray-200">{leader.name}</span>
                      </div>
                      <span className="font-medium text-white">{leader.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
