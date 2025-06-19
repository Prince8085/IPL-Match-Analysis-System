"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Clock, Star } from "lucide-react"

export default function KeyMomentsTimeline({ predictions }) {
  const [showAll, setShowAll] = useState(false)

  // Create a safe version of predictions with default values
  const safeData = {
    keyMoments: predictions?.keyMoments || [],
    turningPoints: predictions?.turningPoints || [],
  }

  // Combine key moments and turning points
  const allMoments = [
    ...(safeData.keyMoments || []).map((moment) => ({
      ...moment,
      type: "key",
      phase: moment.phase || "Unknown Phase",
      description: moment.description || "No description available",
      probability: moment.probability || 0,
    })),
    ...(safeData.turningPoints || []).map((point) => ({
      ...point,
      type: "turning",
      phase: point.phase || "Unknown Phase",
      description: point.description || "No description available",
      impactScore: point.impactScore || 0,
    })),
  ]

  // Sort by phase (assuming phases are in order: Powerplay, Middle Overs, Death Overs)
  const sortedMoments = allMoments.sort((a, b) => {
    const phaseOrder = { Powerplay: 1, "Middle Overs": 2, "Death Overs": 3 }
    return (phaseOrder[a.phase] || 99) - (phaseOrder[b.phase] || 99)
  })

  // Limit displayed moments if not showing all
  const displayedMoments = showAll ? sortedMoments : sortedMoments.slice(0, 3)

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Key Moments</CardTitle>
        <CardDescription className="text-gray-400">Predicted turning points and critical phases</CardDescription>
      </CardHeader>
      <CardContent>
        {displayedMoments.length > 0 ? (
          <div className="space-y-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-700"></div>

              {/* Timeline items */}
              <div className="space-y-6">
                {displayedMoments.map((moment, index) => (
                  <div key={index} className="relative pl-10">
                    {/* Timeline icon */}
                    <div className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-gray-700">
                      {moment.type === "turning" ? (
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="rounded-lg bg-gray-700/30 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-300">{moment.phase}</h4>
                        {moment.type === "turning" ? (
                          <span className="text-xs font-medium text-amber-500">
                            Impact: {moment.impactScore.toFixed(1)}/10
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-blue-500">Probability: {moment.probability}%</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{moment.description}</p>
                      {moment.type === "turning" && moment.over && (
                        <div className="mt-1 text-xs text-gray-500">Around over {moment.over}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {sortedMoments.length > 3 && (
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
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
        ) : (
          <div className="py-8 text-center text-gray-400">
            <p>No key moments available for this match</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
