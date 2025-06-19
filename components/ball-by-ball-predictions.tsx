"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Info, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import BallPredictionChart from "@/components/charts/ball-prediction-chart"
import OverPredictionChart from "@/components/charts/over-prediction-chart"
import WicketProbabilityChart from "@/components/charts/wicket-probability-chart"

// Define default prediction data structure to prevent undefined errors
const defaultPredictions = {
  ballByBall: [],
  overAnalysis: Array(20)
    .fill(null)
    .map((_, i) => ({
      over: i + 1,
      expectedRuns: "0",
      runRange: "0-0",
      boundaryProbability: "0%",
      dotBallProbability: "0%",
      wicketProbability: "0%",
      likelyDismissal: "None",
      atRiskBatters: [],
    })),
  turningPoints: [],
  teams: {
    team1: "Team 1",
    team2: "Team 2",
  },
}

export default function BallByBallPredictions({ predictions = defaultPredictions, isLive = false }) {
  const [selectedOver, setSelectedOver] = useState("1")
  const [selectedBall, setSelectedBall] = useState("1")
  const [confidenceThreshold, setConfidenceThreshold] = useState(70)
  const [showAllOutcomes, setShowAllOutcomes] = useState(false)

  // Ensure predictions has the expected structure
  const safeData = {
    ...defaultPredictions,
    ...predictions,
    ballByBall: predictions?.ballByBall || defaultPredictions.ballByBall,
    overAnalysis: predictions?.overAnalysis || defaultPredictions.overAnalysis,
    turningPoints: predictions?.turningPoints || defaultPredictions.turningPoints,
    teams: predictions?.teams || defaultPredictions.teams,
  }

  // Generate array of overs (1-20)
  const overs = Array.from({ length: 20 }, (_, i) => (i + 1).toString())

  // Generate array of balls (1-6)
  const balls = Array.from({ length: 6 }, (_, i) => (i + 1).toString())

  // Get current ball prediction with null check
  const currentBallPrediction = safeData.ballByBall.find(
    (prediction) => prediction?.over?.toString() === selectedOver && prediction?.ball?.toString() === selectedBall,
  ) || {
    over: Number(selectedOver),
    ball: Number(selectedBall),
    outcomes: [],
    keyMatchup: {
      bowler: { name: "Bowler", initials: "BL" },
      batter: { name: "Batter", initials: "BT" },
      insight: "No data available for this matchup",
      stats: { balls: 0, runs: 0, wickets: 0 },
    },
  }

  // Filter outcomes by confidence threshold with null check
  const filteredOutcomes =
    currentBallPrediction?.outcomes?.filter((outcome) => (outcome?.probability || 0) * 100 >= confidenceThreshold) || []

  // Determine which outcomes to display
  const displayedOutcomes = showAllOutcomes ? filteredOutcomes : filteredOutcomes.slice(0, 5)

  // Get the selected over index safely
  const selectedOverIndex = Number.parseInt(selectedOver) - 1
  const overAnalysis = safeData.overAnalysis[selectedOverIndex] || defaultPredictions.overAnalysis[0]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <CardTitle className="text-white">Ball-by-Ball Prediction</CardTitle>
                <CardDescription className="text-gray-400">
                  Detailed outcome probabilities for each delivery
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <span className="text-sm text-gray-400">Confidence:</span>
                <Slider
                  value={[confidenceThreshold]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => setConfidenceThreshold(value[0])}
                  className="w-[100px]"
                />
                <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700">
                  {confidenceThreshold}%+
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Over:</span>
                <Select value={selectedOver} onValueChange={setSelectedOver}>
                  <SelectTrigger className="w-[80px] bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Over" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {overs.map((over) => (
                      <SelectItem key={over} value={over}>
                        {over}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Ball:</span>
                <Select value={selectedBall} onValueChange={setSelectedBall}>
                  <SelectTrigger className="w-[80px] bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Ball" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {balls.map((ball) => (
                      <SelectItem key={ball} value={ball}>
                        {ball}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLive && <Badge className="bg-red-600 text-white border-0 h-6">LIVE Prediction</Badge>}
            </div>

            {currentBallPrediction ? (
              <>
                <div className="mb-6">
                  <BallPredictionChart prediction={currentBallPrediction} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-300">Likely Outcomes</h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0">
                            <Info className="h-4 w-4 text-gray-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 border-gray-700">
                          <p>Probabilities based on historical data, player matchups, and current match context</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {displayedOutcomes.length > 0 ? (
                    <>
                      {displayedOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                              <span className="text-sm font-medium">{outcome.runs || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-200">{outcome.description || "Unknown outcome"}</span>
                              {outcome.insight && <p className="text-xs text-gray-400 mt-1">{outcome.insight}</p>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-white">
                              {((outcome.probability || 0) * 100).toFixed(1)}%
                            </span>
                            <Progress
                              value={(outcome.probability || 0) * 100}
                              className="h-1 w-[80px] mt-1 bg-gray-700"
                              indicatorClassName="bg-purple-600"
                            />
                          </div>
                        </div>
                      ))}

                      {filteredOutcomes.length > 5 && (
                        <Button
                          variant="ghost"
                          className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
                          onClick={() => setShowAllOutcomes(!showAllOutcomes)}
                        >
                          {showAllOutcomes ? (
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
                    </>
                  ) : (
                    <div className="flex items-center justify-center p-4 bg-gray-700/30 rounded">
                      <AlertTriangle className="h-4 w-4 text-amber-400 mr-2" />
                      <span className="text-gray-300">No outcomes meet the confidence threshold</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-3 bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Key Matchup</h4>
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-700/30 flex items-center justify-center mr-2">
                        <span className="text-sm font-medium text-purple-300">
                          {currentBallPrediction.keyMatchup?.bowler?.initials || "BL"}
                        </span>
                      </div>
                      <div>
                        <p className="text-white">{currentBallPrediction.keyMatchup?.bowler?.name || "Bowler"}</p>
                        <p className="text-xs text-gray-400">Bowler</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div>
                        <p className="text-white text-right">
                          {currentBallPrediction.keyMatchup?.batter?.name || "Batter"}
                        </p>
                        <p className="text-xs text-gray-400 text-right">Batter</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-700/30 flex items-center justify-center ml-2">
                        <span className="text-sm font-medium text-blue-300">
                          {currentBallPrediction.keyMatchup?.batter?.initials || "BT"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-300">
                    <p>{currentBallPrediction.keyMatchup?.insight || "No insight available for this matchup"}</p>
                    {currentBallPrediction.keyMatchup?.stats && (
                      <div className="mt-1 grid grid-cols-3 gap-2 text-center">
                        <div className="p-1 bg-gray-700 rounded">
                          <p className="text-gray-400">H2H Balls</p>
                          <p className="text-white">{currentBallPrediction.keyMatchup.stats.balls || 0}</p>
                        </div>
                        <div className="p-1 bg-gray-700 rounded">
                          <p className="text-gray-400">Runs</p>
                          <p className="text-white">{currentBallPrediction.keyMatchup.stats.runs || 0}</p>
                        </div>
                        <div className="p-1 bg-gray-700 rounded">
                          <p className="text-gray-400">Wickets</p>
                          <p className="text-white">{currentBallPrediction.keyMatchup.stats.wickets || 0}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center p-8 bg-gray-700/30 rounded">
                <span className="text-gray-300">No prediction data available for this ball</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Over Analysis</CardTitle>
            <CardDescription className="text-gray-400">Projected runs and wicket probability</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="runs" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="runs" className="data-[state=active]:bg-purple-700">
                  Runs
                </TabsTrigger>
                <TabsTrigger value="wickets" className="data-[state=active]:bg-purple-700">
                  Wickets
                </TabsTrigger>
              </TabsList>
              <TabsContent value="runs" className="mt-4">
                <OverPredictionChart predictions={safeData} selectedOver={selectedOver} />

                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Over {selectedOver} Projection</h4>
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Expected Runs</span>
                      <span className="text-xl font-bold text-white">{overAnalysis.expectedRuns || "0"}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Range: {overAnalysis.runRange || "0-0"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gray-700/30 rounded">
                      <p className="text-xs text-gray-400">Boundary Probability</p>
                      <p className="text-white font-medium">{overAnalysis.boundaryProbability || "0%"}</p>
                    </div>
                    <div className="p-2 bg-gray-700/30 rounded">
                      <p className="text-xs text-gray-400">Dot Ball Probability</p>
                      <p className="text-white font-medium">{overAnalysis.dotBallProbability || "0%"}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="wickets" className="mt-4">
                <WicketProbabilityChart predictions={safeData} selectedOver={selectedOver} />

                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Wicket Probability</h4>
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Wicket in Over {selectedOver}</span>
                      <span className="text-xl font-bold text-white">{overAnalysis.wicketProbability || "0%"}</span>
                    </div>

                    {overAnalysis.likelyDismissal && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400">Most Likely Dismissal</p>
                        <p className="text-white text-sm">{overAnalysis.likelyDismissal}</p>
                      </div>
                    )}
                  </div>

                  {overAnalysis.atRiskBatters && overAnalysis.atRiskBatters.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-300 mb-1">Batters at Risk</h4>
                      {overAnalysis.atRiskBatters.map((batter, index) => (
                        <div key={index} className="flex justify-between p-2 bg-gray-700/30 rounded mb-1">
                          <span className="text-gray-200">{batter.name}</span>
                          <Badge variant="outline" className="bg-red-900/20 text-red-300 border-red-800">
                            {batter.dismissalProbability}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Match Turning Points</CardTitle>
          <CardDescription className="text-gray-400">
            Critical moments that could significantly impact the match outcome
          </CardDescription>
        </CardHeader>
        <CardContent>
          {safeData.turningPoints && safeData.turningPoints.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {safeData.turningPoints.map((point, index) => (
                <div key={index} className="p-3 bg-gray-700/50 rounded-lg border-l-4 border-purple-600">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-700">
                      {point.phase || "Unknown phase"}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      Over {point.over || "?"}.{point.ball || "?"}
                    </span>
                  </div>
                  <h4 className="font-medium text-white mb-1">{point.title || "Turning Point"}</h4>
                  <p className="text-sm text-gray-300">{point.description || "No description available"}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-xs text-gray-400 mr-2">Win impact:</span>
                    <Badge
                      className={`${
                        point.team === safeData.teams.team1 ? "bg-purple-600" : "bg-blue-600"
                      } text-white border-0`}
                    >
                      {point.team || "Team"} {(point.winImpact || 0) > 0 ? "+" : ""}
                      {point.winImpact || 0}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 bg-gray-700/30 rounded">
              <span className="text-gray-300">No turning points data available</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
