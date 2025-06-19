"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cloud, Droplets, Thermometer, Wind } from "lucide-react"

export default function VenueAnalysis({ predictions }) {
  // Create safe data with default values
  const safeData = {
    venueStats: predictions?.venueStats || {
      name: "Unknown Venue",
      city: "Unknown City",
      avgFirstInningsScore: 160,
      avgSecondInningsScore: 150,
      highestTotal: 200,
      lowestTotal: 100,
      avgRunRate: 8.0,
      boundaryPercentage: 50,
      winPercentageBattingFirst: 50,
    },
    pitchAnalysis: predictions?.pitchAnalysis || {
      pitchType: "Unknown",
      paceBowlingImpact: 5,
      spinBowlingImpact: 5,
      battingDifficulty: 5,
      averageBoundariesPerMatch: 30,
      chaseSuccessRate: 50,
    },
    pitchHeatmap: predictions?.pitchHeatmap || {
      zones: [],
    },
    weatherImpact: predictions?.weatherImpact || {
      condition: "Unknown",
      temperature: 25,
      humidity: 50,
      windSpeed: 10,
      impactOnSwing: 5,
      impactOnSpin: 5,
      overallImpact: "Unknown",
    },
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Venue Analysis</CardTitle>
        <CardDescription className="text-gray-400">
          {safeData.venueStats.name}, {safeData.venueStats.city}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-700">
              Stats
            </TabsTrigger>
            <TabsTrigger value="pitch" className="data-[state=active]:bg-purple-700">
              Pitch
            </TabsTrigger>
            <TabsTrigger value="weather" className="data-[state=active]:bg-purple-700">
              Weather
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="text-xs text-gray-400">Avg 1st Innings</div>
                <div className="text-xl font-bold text-white">{safeData.venueStats.avgFirstInningsScore}</div>
              </div>
              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="text-xs text-gray-400">Avg 2nd Innings</div>
                <div className="text-xl font-bold text-white">{safeData.venueStats.avgSecondInningsScore}</div>
              </div>
              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="text-xs text-gray-400">Highest Total</div>
                <div className="text-xl font-bold text-white">{safeData.venueStats.highestTotal}</div>
              </div>
              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="text-xs text-gray-400">Lowest Total</div>
                <div className="text-xl font-bold text-white">{safeData.venueStats.lowestTotal}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="mb-1 flex justify-between">
                  <span className="text-xs text-gray-400">Avg Run Rate</span>
                  <span className="text-xs font-medium text-white">{safeData.venueStats.avgRunRate}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="bg-purple-600"
                    style={{ width: `${(safeData.venueStats.avgRunRate / 12) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="mb-1 flex justify-between">
                  <span className="text-xs text-gray-400">Boundary %</span>
                  <span className="text-xs font-medium text-white">{safeData.venueStats.boundaryPercentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div className="bg-purple-600" style={{ width: `${safeData.venueStats.boundaryPercentage}%` }}></div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="mb-1 flex justify-between">
                  <span className="text-xs text-gray-400">Win % Batting First</span>
                  <span className="text-xs font-medium text-white">
                    {safeData.venueStats.winPercentageBattingFirst}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="bg-purple-600"
                    style={{ width: `${safeData.venueStats.winPercentageBattingFirst}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pitch" className="mt-4 space-y-4">
            <div className="rounded-lg bg-gray-700/30 p-3">
              <div className="text-sm font-medium text-white">Pitch Type: {safeData.pitchAnalysis.pitchType}</div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="mb-1 flex justify-between">
                  <span className="text-xs text-gray-400">Pace Bowling Impact</span>
                  <span className="text-xs font-medium text-white">{safeData.pitchAnalysis.paceBowlingImpact}/10</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="bg-blue-600"
                    style={{ width: `${(safeData.pitchAnalysis.paceBowlingImpact / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="mb-1 flex justify-between">
                  <span className="text-xs text-gray-400">Spin Bowling Impact</span>
                  <span className="text-xs font-medium text-white">{safeData.pitchAnalysis.spinBowlingImpact}/10</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="bg-amber-600"
                    style={{ width: `${(safeData.pitchAnalysis.spinBowlingImpact / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="mb-1 flex justify-between">
                  <span className="text-xs text-gray-400">Batting Difficulty</span>
                  <span className="text-xs font-medium text-white">{safeData.pitchAnalysis.battingDifficulty}/10</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="bg-red-600"
                    style={{ width: `${(safeData.pitchAnalysis.battingDifficulty / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="mb-1 flex justify-between">
                  <span className="text-xs text-gray-400">Chase Success Rate</span>
                  <span className="text-xs font-medium text-white">{safeData.pitchAnalysis.chaseSuccessRate}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div className="bg-green-600" style={{ width: `${safeData.pitchAnalysis.chaseSuccessRate}%` }}></div>
                </div>
              </div>
            </div>

            {safeData.pitchHeatmap.zones && safeData.pitchHeatmap.zones.length > 0 ? (
              <div className="rounded-lg bg-gray-700/30 p-3">
                <h4 className="mb-2 text-sm font-medium text-white">Pitch Zones</h4>
                <div className="space-y-2">
                  {safeData.pitchHeatmap.zones.map((zone, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{zone.zone}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-blue-400">{zone.averageRunRate} RPO</span>
                        <span className="text-xs text-red-400">{zone.wicketProbability}% W</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-700/30 p-3 text-center text-sm text-gray-400">
                No pitch zone data available
              </div>
            )}
          </TabsContent>

          <TabsContent value="weather" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center rounded-lg bg-gray-700/30 p-3">
                <div className="mr-3 rounded-full bg-gray-700 p-2">
                  <Cloud className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Condition</div>
                  <div className="text-sm font-medium text-white">{safeData.weatherImpact.condition}</div>
                </div>
              </div>

              <div className="flex items-center rounded-lg bg-gray-700/30 p-3">
                <div className="mr-3 rounded-full bg-gray-700 p-2">
                  <Thermometer className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Temperature</div>
                  <div className="text-sm font-medium text-white">{safeData.weatherImpact.temperature}°C</div>
                </div>
              </div>

              <div className="flex items-center rounded-lg bg-gray-700/30 p-3">
                <div className="mr-3 rounded-full bg-gray-700 p-2">
                  <Droplets className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Humidity</div>
                  <div className="text-sm font-medium text-white">{safeData.weatherImpact.humidity}%</div>
                </div>
              </div>

              <div className="flex items-center rounded-lg bg-gray-700/30 p-3">
                <div className="mr-3 rounded-full bg-gray-700 p-2">
                  <Wind className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Wind Speed</div>
                  <div className="text-sm font-medium text-white">{safeData.weatherImpact.windSpeed} km/h</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="mb-1 flex justify-between">
                  <span className="text-xs text-gray-400">Impact on Swing</span>
                  <span className="text-xs font-medium text-white">{safeData.weatherImpact.impactOnSwing}/10</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="bg-blue-600"
                    style={{ width: `${(safeData.weatherImpact.impactOnSwing / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-700/30 p-3">
                <div className="mb-1 flex justify-between">
                  <span className="text-xs text-gray-400">Impact on Spin</span>
                  <span className="text-xs font-medium text-white">{safeData.weatherImpact.impactOnSpin}/10</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="bg-amber-600"
                    style={{ width: `${(safeData.weatherImpact.impactOnSpin / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-700/30 p-3">
              <div className="text-sm font-medium text-white">Overall Impact</div>
              <div className="mt-1 text-sm text-gray-400">{safeData.weatherImpact.overallImpact}</div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
