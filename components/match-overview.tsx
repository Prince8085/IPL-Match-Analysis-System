"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import WinProbabilityChart from "@/components/charts/win-probability-chart"
import RunRateChart from "@/components/charts/run-rate-chart"
import KeyMomentsTimeline from "@/components/key-moments-timeline"

export default function MatchOverview({ predictions }) {
  const [showAllInsights, setShowAllInsights] = useState(false)
  const [showAllFactors, setShowAllFactors] = useState(false)

  const displayedInsights = showAllInsights ? predictions.insights || [] : (predictions.insights || []).slice(0, 3)

  const displayedFactors = showAllFactors ? predictions.keyFactors || [] : (predictions.keyFactors || []).slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Match Prediction</CardTitle>
            <CardDescription className="text-gray-400">Win probability based on comprehensive analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <WinProbabilityChart predictions={predictions} />

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <span className="font-medium text-white">{predictions.teams.team1}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0 ml-1">
                            <Info className="h-3 w-3 text-gray-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 border-gray-700">
                          <p>Based on 10,000 match simulations</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-purple-400">{predictions.winProbability.team1}%</span>
                </div>
                <Progress
                  value={predictions.winProbability.team1}
                  className="h-2 bg-gray-700"
                  indicatorClassName="bg-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <span className="font-medium text-white">{predictions.teams.team2}</span>
                  </div>
                  <span className="text-blue-400">{predictions.winProbability.team2}%</span>
                </div>
                <Progress
                  value={predictions.winProbability.team2}
                  className="h-2 bg-gray-700"
                  indicatorClassName="bg-blue-600"
                />
              </div>

              {predictions.winProbability.tie > 0 && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-white">Tie/No Result</span>
                    <span className="text-amber-400">{predictions.winProbability.tie}%</span>
                  </div>
                  <Progress
                    value={predictions.winProbability.tie}
                    className="h-2 bg-gray-700"
                    indicatorClassName="bg-amber-600"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Key Insights</CardTitle>
            <CardDescription className="text-gray-400">Critical factors affecting match outcome</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(displayedInsights || []).map((insight, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 rounded bg-gray-700/50">
                  <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-purple-600/20 text-purple-400 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-gray-200">{insight.text}</p>
                    <div className="flex items-center mt-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          insight.confidence >= 80
                            ? "bg-green-900/20 text-green-400 border-green-800"
                            : insight.confidence >= 60
                              ? "bg-amber-900/20 text-amber-400 border-amber-800"
                              : "bg-red-900/20 text-red-400 border-red-800"
                        }`}
                      >
                        {insight.confidence}% confidence
                      </Badge>
                      {insight.impact && (
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-900/20 text-blue-400 border-blue-800">
                          {insight.impact} impact
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {(predictions.insights || []).length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => setShowAllInsights(!showAllInsights)}
                >
                  {showAllInsights ? (
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
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Match Progression Forecast</CardTitle>
          <CardDescription className="text-gray-400">Projected run rates and key moments</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="runrate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="runrate" className="data-[state=active]:bg-purple-700">
                Run Rate Projection
              </TabsTrigger>
              <TabsTrigger value="keymoments" className="data-[state=active]:bg-purple-700">
                Key Moments
              </TabsTrigger>
            </TabsList>
            <TabsContent value="runrate" className="mt-4">
              <RunRateChart predictions={predictions} />
            </TabsContent>
            <TabsContent value="keymoments" className="mt-4">
              <KeyMomentsTimeline predictions={predictions} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">First Innings Projection</CardTitle>
            <CardDescription className="text-gray-400">Expected scoring patterns and key phases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Projected Score</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{predictions.firstInnings?.projectedScore}</span>
                  <div className="text-xs text-gray-400 mt-1">Range: {predictions.firstInnings?.scoreRange}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Key Phases</h4>
                {(predictions.firstInnings?.keyPhases || []).map((phase, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-700/30 rounded">
                    <span className="text-gray-300">{phase.name}</span>
                    <span className="font-medium text-white">{phase.runs} runs</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Critical Overs</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(predictions.firstInnings?.criticalOvers || []).map((over, index) => (
                    <div key={index} className="p-2 bg-gray-700/30 rounded">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Over {over.over}</span>
                        <Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-700">
                          {over.importance}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{over.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Second Innings Projection</CardTitle>
            <CardDescription className="text-gray-400">Chase dynamics and success probability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Chase Success Probability</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">
                    {predictions.secondInnings?.chaseSuccessProbability}
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    Based on {predictions.secondInnings?.simulationCount} simulations
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Critical Factors</h4>
                {(displayedFactors || []).map((factor, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 rounded bg-gray-700/30">
                    <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-gray-200">{factor.text}</p>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="text-xs bg-blue-900/20 text-blue-400 border-blue-800">
                          {factor.weight}% weight
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}

                {(predictions.keyFactors || []).length > 3 && (
                  <Button
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
                    onClick={() => setShowAllFactors(!showAllFactors)}
                  >
                    {showAllFactors ? (
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

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Required Run Rate Scenarios</h4>
                {(predictions.secondInnings?.runRateScenarios || []).map((scenario, index) => (
                  <div key={index} className="p-2 bg-gray-700/30 rounded">
                    <div className="flex justify-between">
                      <span className="text-gray-300">
                        {scenario.target} in {scenario.overs} overs
                      </span>
                      <span className="font-medium text-white">RRR: {scenario.requiredRate}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">Success probability</span>
                      <span className="text-xs font-medium text-gray-300">{scenario.successProbability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
