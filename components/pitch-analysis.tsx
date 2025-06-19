"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PitchAnalysis({ venue, prediction }) {
  // If we don't have prediction data yet, show placeholder
  if (!prediction) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Pitch analysis will appear here after analysis</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pitch">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pitch">Pitch Conditions</TabsTrigger>
          <TabsTrigger value="weather">Weather Impact</TabsTrigger>
          <TabsTrigger value="history">Historical Data</TabsTrigger>
        </TabsList>

        <TabsContent value="pitch" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Pitch Characteristics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Pace</h4>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${prediction.pitchAnalysis.pace}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm">
                      {prediction.pitchAnalysis.pace < 33
                        ? "Slow"
                        : prediction.pitchAnalysis.pace < 66
                          ? "Medium"
                          : "Fast"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Bounce</h4>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${prediction.pitchAnalysis.bounce}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm">
                      {prediction.pitchAnalysis.bounce < 33
                        ? "Low"
                        : prediction.pitchAnalysis.bounce < 66
                          ? "Medium"
                          : "High"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Spin</h4>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${prediction.pitchAnalysis.spin}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm">
                      {prediction.pitchAnalysis.spin < 33
                        ? "Little"
                        : prediction.pitchAnalysis.spin < 66
                          ? "Moderate"
                          : "Significant"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Dryness</h4>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${prediction.pitchAnalysis.dryness}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm">
                      {prediction.pitchAnalysis.dryness < 33
                        ? "Moist"
                        : prediction.pitchAnalysis.dryness < 66
                          ? "Balanced"
                          : "Dry"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Expected Behavior</h3>
              <ul className="space-y-2">
                {prediction.pitchAnalysis.expectedBehavior.map((behavior, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                    <span>{behavior}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Weather Forecast</h3>
                <div className="text-sm text-gray-500">{prediction.weatherImpact.date}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-2">
                    {prediction.weatherImpact.condition === "Sunny"
                      ? "☀️"
                      : prediction.weatherImpact.condition === "Cloudy"
                        ? "☁️"
                        : prediction.weatherImpact.condition === "Rainy"
                          ? "🌧️"
                          : "🌤️"}
                  </div>
                  <div className="text-lg font-medium">{prediction.weatherImpact.condition}</div>
                </div>

                <div className="flex flex-col justify-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Temperature</div>
                  <div className="text-2xl font-medium">{prediction.weatherImpact.temperature}°C</div>
                </div>

                <div className="flex flex-col justify-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Humidity</div>
                  <div className="text-2xl font-medium">{prediction.weatherImpact.humidity}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Impact on Play</h3>
              <ul className="space-y-2">
                {prediction.weatherImpact.impactOnPlay.map((impact, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                    <span>{impact}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Venue Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Average 1st Innings Score</p>
                  <p className="text-2xl font-medium">{prediction.venueStats.avgFirstInningsScore}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average 2nd Innings Score</p>
                  <p className="text-2xl font-medium">{prediction.venueStats.avgSecondInningsScore}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Batting First Win %</p>
                  <p className="text-2xl font-medium">{prediction.venueStats.battingFirstWinPercentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chasing Win %</p>
                  <p className="text-2xl font-medium">{prediction.venueStats.chasingWinPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Historical Performance at Venue</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{prediction.teams.team1}</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Matches</p>
                      <p className="font-medium">{prediction.venueStats.team1.matches}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Wins</p>
                      <p className="font-medium">{prediction.venueStats.team1.wins}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Win %</p>
                      <p className="font-medium">{prediction.venueStats.team1.winPercentage}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{prediction.teams.team2}</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Matches</p>
                      <p className="font-medium">{prediction.venueStats.team2.matches}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Wins</p>
                      <p className="font-medium">{prediction.venueStats.team2.wins}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Win %</p>
                      <p className="font-medium">{prediction.venueStats.team2.winPercentage}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
