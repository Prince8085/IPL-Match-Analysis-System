"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy } from "lucide-react"

export default function TeamComparison({ predictions }) {
  // Create safe data with default values
  const safeData = {
    teams: predictions?.teams || { team1: "Team 1", team2: "Team 2" },
    teamComparison: predictions?.teamComparison || {
      battingStrength: { team1: 5, team2: 5 },
      bowlingStrength: { team1: 5, team2: 5 },
      fieldingEfficiency: { team1: 5, team2: 5 },
      powerPlayPerformance: { team1: 5, team2: 5 },
      deathOverPerformance: { team1: 5, team2: 5 },
    },
    headToHead: predictions?.headToHead || {
      totalMatches: 0,
      team1Wins: 0,
      team2Wins: 0,
      noResults: 0,
      lastFiveEncounters: [],
    },
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Team Comparison</CardTitle>
        <CardDescription className="text-gray-400">Head-to-head stats and team strengths</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="strengths" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="strengths" className="data-[state=active]:bg-purple-700">
              Team Strengths
            </TabsTrigger>
            <TabsTrigger value="headtohead" className="data-[state=active]:bg-purple-700">
              Head to Head
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strengths" className="mt-4 space-y-4">
            <div className="space-y-3">
              {/* Batting Strength */}
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-400">Batting</span>
                  <div className="flex space-x-4">
                    <span className="text-purple-400">{safeData.teams.team1}</span>
                    <span className="text-blue-400">{safeData.teams.team2}</span>
                  </div>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="bg-purple-600"
                    style={{
                      width: `${
                        (safeData.teamComparison.battingStrength.team1 /
                          (safeData.teamComparison.battingStrength.team1 +
                            safeData.teamComparison.battingStrength.team2)) *
                        100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-blue-600"
                    style={{
                      width: `${
                        (safeData.teamComparison.battingStrength.team2 /
                          (safeData.teamComparison.battingStrength.team1 +
                            safeData.teamComparison.battingStrength.team2)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-purple-400">{safeData.teamComparison.battingStrength.team1.toFixed(1)}</span>
                  <span className="text-blue-400">{safeData.teamComparison.battingStrength.team2.toFixed(1)}</span>
                </div>
              </div>

              {/* Bowling Strength */}
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-400">Bowling</span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="bg-purple-600"
                    style={{
                      width: `${
                        (safeData.teamComparison.bowlingStrength.team1 /
                          (safeData.teamComparison.bowlingStrength.team1 +
                            safeData.teamComparison.bowlingStrength.team2)) *
                        100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-blue-600"
                    style={{
                      width: `${
                        (safeData.teamComparison.bowlingStrength.team2 /
                          (safeData.teamComparison.bowlingStrength.team1 +
                            safeData.teamComparison.bowlingStrength.team2)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-purple-400">{safeData.teamComparison.bowlingStrength.team1.toFixed(1)}</span>
                  <span className="text-blue-400">{safeData.teamComparison.bowlingStrength.team2.toFixed(1)}</span>
                </div>
              </div>

              {/* Fielding Efficiency */}
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-400">Fielding</span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="bg-purple-600"
                    style={{
                      width: `${
                        (safeData.teamComparison.fieldingEfficiency.team1 /
                          (safeData.teamComparison.fieldingEfficiency.team1 +
                            safeData.teamComparison.fieldingEfficiency.team2)) *
                        100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-blue-600"
                    style={{
                      width: `${
                        (safeData.teamComparison.fieldingEfficiency.team2 /
                          (safeData.teamComparison.fieldingEfficiency.team1 +
                            safeData.teamComparison.fieldingEfficiency.team2)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-purple-400">{safeData.teamComparison.fieldingEfficiency.team1.toFixed(1)}</span>
                  <span className="text-blue-400">{safeData.teamComparison.fieldingEfficiency.team2.toFixed(1)}</span>
                </div>
              </div>

              {/* PowerPlay Performance */}
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-400">PowerPlay</span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="bg-purple-600"
                    style={{
                      width: `${
                        (safeData.teamComparison.powerPlayPerformance.team1 /
                          (safeData.teamComparison.powerPlayPerformance.team1 +
                            safeData.teamComparison.powerPlayPerformance.team2)) *
                        100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-blue-600"
                    style={{
                      width: `${
                        (safeData.teamComparison.powerPlayPerformance.team2 /
                          (safeData.teamComparison.powerPlayPerformance.team1 +
                            safeData.teamComparison.powerPlayPerformance.team2)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-purple-400">
                    {safeData.teamComparison.powerPlayPerformance.team1.toFixed(1)}
                  </span>
                  <span className="text-blue-400">{safeData.teamComparison.powerPlayPerformance.team2.toFixed(1)}</span>
                </div>
              </div>

              {/* Death Over Performance */}
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-400">Death Overs</span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="bg-purple-600"
                    style={{
                      width: `${
                        (safeData.teamComparison.deathOverPerformance.team1 /
                          (safeData.teamComparison.deathOverPerformance.team1 +
                            safeData.teamComparison.deathOverPerformance.team2)) *
                        100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-blue-600"
                    style={{
                      width: `${
                        (safeData.teamComparison.deathOverPerformance.team2 /
                          (safeData.teamComparison.deathOverPerformance.team1 +
                            safeData.teamComparison.deathOverPerformance.team2)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-purple-400">
                    {safeData.teamComparison.deathOverPerformance.team1.toFixed(1)}
                  </span>
                  <span className="text-blue-400">{safeData.teamComparison.deathOverPerformance.team2.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="headtohead" className="mt-4 space-y-4">
            <div className="rounded-lg bg-gray-700/30 p-4">
              <div className="flex justify-between">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{safeData.headToHead.team1Wins}</div>
                  <div className="text-xs text-gray-400">{safeData.teams.team1} wins</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-400">{safeData.headToHead.noResults}</div>
                  <div className="text-xs text-gray-400">No results</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{safeData.headToHead.team2Wins}</div>
                  <div className="text-xs text-gray-400">{safeData.teams.team2} wins</div>
                </div>
              </div>
              <div className="mt-3 text-center text-xs text-gray-400">
                Total matches: {safeData.headToHead.totalMatches}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-300">Last 5 Encounters</h4>
              {safeData.headToHead.lastFiveEncounters && safeData.headToHead.lastFiveEncounters.length > 0 ? (
                <div className="space-y-2">
                  {safeData.headToHead.lastFiveEncounters.map((encounter, index) => (
                    <div key={index} className="flex items-center rounded-lg bg-gray-700/30 p-2">
                      <div
                        className={`mr-2 flex h-6 w-6 items-center justify-center rounded-full ${
                          encounter.winner === safeData.teams.team1
                            ? "bg-purple-600"
                            : encounter.winner === safeData.teams.team2
                              ? "bg-blue-600"
                              : "bg-gray-600"
                        }`}
                      >
                        <Trophy className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white">{encounter.winner || "No Result"}</div>
                        <div className="text-xs text-gray-400">
                          {encounter.margin ? `Won by ${encounter.margin}` : ""} ({encounter.year || "N/A"})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-gray-700/30 p-3 text-center text-sm text-gray-400">
                  No previous encounters
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
