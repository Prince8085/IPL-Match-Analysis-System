"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react"

export default function LiveScoreboard({ predictions, isLive }) {
  const [showAllOvers, setShowAllOvers] = useState(false)
  const [currentInnings, setCurrentInnings] = useState("1")
  const [liveScore, setLiveScore] = useState(predictions?.liveScore || null)

  // Simulate live score updates when in live mode
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      // This would normally fetch the latest score from an API
      // For demo purposes, we're just simulating random updates
      const randomRuns = Math.floor(Math.random() * 2)

      setLiveScore((prev) => {
        if (!prev) return null

        const newScore = { ...prev }

        if (newScore.currentInnings === "1") {
          newScore.team1.runs += randomRuns

          // Occasionally update balls and wickets
          if (Math.random() > 0.7) {
            newScore.team1.balls += 1

            if (newScore.team1.balls >= 6) {
              newScore.team1.overs += 1
              newScore.team1.balls = 0
            }
          }

          if (Math.random() > 0.9 && newScore.team1.wickets < 9) {
            newScore.team1.wickets += 1
          }

          // Switch innings if completed
          if (newScore.team1.overs >= 20) {
            newScore.currentInnings = "2"
          }
        } else {
          newScore.team2.runs += randomRuns

          // Occasionally update balls and wickets
          if (Math.random() > 0.7) {
            newScore.team2.balls += 1

            if (newScore.team2.balls >= 6) {
              newScore.team2.overs += 1
              newScore.team2.balls = 0
            }
          }

          if (Math.random() > 0.9 && newScore.team2.wickets < 9) {
            newScore.team2.wickets += 1
          }
        }

        return newScore
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [isLive])

  // Use live score if available, otherwise use prediction
  const scoreData = liveScore ||
    predictions?.liveScore || {
      currentInnings: "1",
      team1: { runs: 0, wickets: 0, overs: 0, balls: 0, runRate: "0.00", projectedScore: "0" },
      team2: { runs: 0, wickets: 0, overs: 0, balls: 0, runRate: "0.00", projectedScore: "0" },
      recentOvers: [],
    }

  // Get recent overs
  const recentOvers = scoreData?.recentOvers || []
  const displayedOvers = showAllOvers ? recentOvers : recentOvers.slice(0, 3)

  // Ensure predictions.teams exists
  const teams = predictions?.teams || { team1: "Team 1", team2: "Team 2" }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white">Match Scoreboard</CardTitle>
            <CardDescription className="text-gray-400">
              {isLive ? "Live match status" : "Projected match status"}
            </CardDescription>
          </div>
          {isLive && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-red-400">LIVE</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Tabs value={currentInnings} onValueChange={setCurrentInnings} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="1" className="data-[state=active]:bg-purple-700">
                1st Innings
              </TabsTrigger>
              <TabsTrigger value="2" className="data-[state=active]:bg-purple-700">
                2nd Innings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="1" className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-white">{teams.team1}</h3>
                  <div className="text-2xl font-bold text-white">
                    {scoreData?.team1?.runs || 0}/{scoreData?.team1?.wickets || 0}
                  </div>
                  <div className="text-sm text-gray-400">
                    {scoreData?.team1?.overs || 0}.{scoreData?.team1?.balls || 0} overs
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-400">Run Rate</div>
                  <div className="text-lg font-medium text-white">{scoreData?.team1?.runRate || "0.00"}</div>
                  <div className="text-xs text-gray-400">Proj: {scoreData?.team1?.projectedScore || "0"}</div>
                </div>
              </div>

              {scoreData?.currentInnings === "1" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-300">Current Partnership</h4>
                    <div className="text-white">{scoreData?.currentPartnership || "0(0)"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gray-700/30 rounded">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{scoreData?.batsman1?.name || "Batsman 1"}</span>
                        <span className="font-medium text-white">
                          {scoreData?.batsman1?.runs || 0}({scoreData?.batsman1?.balls || 0})
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Progress
                          value={scoreData?.batsman1?.strikeRate || 0}
                          max={200}
                          className="h-1 flex-1 mr-2 bg-gray-700"
                        />
                        <span className="text-xs text-gray-400">SR: {scoreData?.batsman1?.strikeRate || 0}</span>
                      </div>
                    </div>

                    <div className="p-2 bg-gray-700/30 rounded">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{scoreData?.batsman2?.name || "Batsman 2"}</span>
                        <span className="font-medium text-white">
                          {scoreData?.batsman2?.runs || 0}({scoreData?.batsman2?.balls || 0})
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Progress
                          value={scoreData?.batsman2?.strikeRate || 0}
                          max={200}
                          className="h-1 flex-1 mr-2 bg-gray-700"
                        />
                        <span className="text-xs text-gray-400">SR: {scoreData?.batsman2?.strikeRate || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-gray-700/30 rounded">
                    <div className="flex justify-between">
                      <span className="text-gray-300">{scoreData?.bowler?.name || "Bowler"}</span>
                      <span className="font-medium text-white">
                        {scoreData?.bowler?.wickets || 0}/{scoreData?.bowler?.runs || 0}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Progress
                        value={scoreData?.bowler?.economyRate || 0}
                        max={15}
                        className="h-1 flex-1 mr-2 bg-gray-700"
                      />
                      <span className="text-xs text-gray-400">Econ: {scoreData?.bowler?.economyRate || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="2" className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-white">{teams.team2}</h3>
                  <div className="text-2xl font-bold text-white">
                    {scoreData?.team2?.runs || 0}/{scoreData?.team2?.wickets || 0}
                  </div>
                  <div className="text-sm text-gray-400">
                    {scoreData?.team2?.overs || 0}.{scoreData?.team2?.balls || 0} overs
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-400">Run Rate</div>
                  <div className="text-lg font-medium text-white">{scoreData?.team2?.runRate || "0.00"}</div>
                  <div className="text-xs text-gray-400">Req: {scoreData?.requiredRunRate || "0.00"} RPO</div>
                </div>
              </div>

              {scoreData?.currentInnings === "2" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-300">Target</h4>
                    <div className="text-white">{scoreData?.target || "0"}</div>
                  </div>

                  <div className="p-2 bg-gray-700/30 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">Equation</span>
                      <span className="font-medium text-white">
                        {scoreData?.toWin || "0"} runs from {scoreData?.ballsRemaining || "0"} balls
                      </span>
                    </div>
                    <Progress
                      value={scoreData?.team2?.runs || 0}
                      max={scoreData?.target || 100}
                      className="h-2 bg-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gray-700/30 rounded">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{scoreData?.batsman1?.name || "Batsman 1"}</span>
                        <span className="font-medium text-white">
                          {scoreData?.batsman1?.runs || 0}({scoreData?.batsman1?.balls || 0})
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Progress
                          value={scoreData?.batsman1?.strikeRate || 0}
                          max={200}
                          className="h-1 flex-1 mr-2 bg-gray-700"
                        />
                        <span className="text-xs text-gray-400">SR: {scoreData?.batsman1?.strikeRate || 0}</span>
                      </div>
                    </div>

                    <div className="p-2 bg-gray-700/30 rounded">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{scoreData?.batsman2?.name || "Batsman 2"}</span>
                        <span className="font-medium text-white">
                          {scoreData?.batsman2?.runs || 0}({scoreData?.batsman2?.balls || 0})
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Progress
                          value={scoreData?.batsman2?.strikeRate || 0}
                          max={200}
                          className="h-1 flex-1 mr-2 bg-gray-700"
                        />
                        <span className="text-xs text-gray-400">SR: {scoreData?.batsman2?.strikeRate || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-300">Recent Overs</h4>
              {isLive && <RefreshCw className="h-3 w-3 text-gray-400 animate-spin" />}
            </div>

            <div className="space-y-2">
              {displayedOvers.map((over, index) => (
                <div key={index} className="p-2 bg-gray-700/30 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Over {over.number}</span>
                    <span className="text-xs text-gray-400">{over.runs} runs</span>
                  </div>
                  <div className="flex space-x-1">
                    {over.balls.map((ball, idx) => (
                      <div
                        key={idx}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          ball === "W"
                            ? "bg-red-600 text-white"
                            : ball === "4"
                              ? "bg-green-600 text-white"
                              : ball === "6"
                                ? "bg-purple-600 text-white"
                                : ball === "0"
                                  ? "bg-gray-600 text-white"
                                  : "bg-blue-600 text-white"
                        }`}
                      >
                        {ball}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {recentOvers.length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => setShowAllOvers(!showAllOvers)}
                >
                  {showAllOvers ? (
                    <>
                      Show Less <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="p-3 bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Win Predictor</h4>
            <div className="flex h-4 rounded-full overflow-hidden">
              <div className="bg-purple-600" style={{ width: `${predictions?.winProbability?.team1 || 50}%` }}></div>
              <div className="bg-blue-600" style={{ width: `${predictions?.winProbability?.team2 || 50}%` }}></div>
              {(predictions?.winProbability?.tie || 0) > 0 && (
                <div className="bg-amber-600" style={{ width: `${predictions?.winProbability?.tie || 0}%` }}></div>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <div className="text-purple-400">
                {teams.team1}: {predictions?.winProbability?.team1 || 50}%
              </div>
              <div className="text-blue-400">
                {teams.team2}: {predictions?.winProbability?.team2 || 50}%
              </div>
            </div>
          </div>

          {scoreData?.matchStatus && (
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-1">Match Status</h4>
              <p className="text-gray-300">{scoreData.matchStatus}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
