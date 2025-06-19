"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw, WifiOff } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DataSource {
  name: string
  status: "online" | "offline" | "degraded" | "checking"
  latency: number | null
  lastChecked: Date | null
}

export function DataHealthMonitor() {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    { name: "ESPNCricinfo API", status: "checking", latency: null, lastChecked: null },
    { name: "CricBuzz API", status: "checking", latency: null, lastChecked: null },
    { name: "IPL Official API", status: "checking", latency: null, lastChecked: null },
    { name: "Cricket Stats API", status: "checking", latency: null, lastChecked: null },
    { name: "Weather API", status: "checking", latency: null, lastChecked: null },
    { name: "Main Database", status: "checking", latency: null, lastChecked: null },
  ])
  const [isChecking, setIsChecking] = useState(false)
  const [overallHealth, setOverallHealth] = useState<"healthy" | "degraded" | "offline" | "checking">("checking")

  // Simulate checking data sources
  const checkDataSources = async () => {
    setIsChecking(true)

    // Reset all to checking
    setDataSources((prev) => prev.map((source) => ({ ...source, status: "checking" as const, latency: null })))

    // Simulate API calls with random delays
    for (let i = 0; i < dataSources.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700))

      setDataSources((prev) => {
        const newSources = [...prev]
        const randomStatus = Math.random()
        let status: "online" | "offline" | "degraded"

        if (randomStatus > 0.8) {
          status = "degraded"
        } else if (randomStatus > 0.95) {
          status = "offline"
        } else {
          status = "online"
        }

        // Make database more likely to be online
        if (newSources[i].name === "Main Database" && status !== "online") {
          status = Math.random() > 0.5 ? "online" : "degraded"
        }

        newSources[i] = {
          ...newSources[i],
          status,
          latency: status === "offline" ? null : Math.floor(50 + Math.random() * 200),
          lastChecked: new Date(),
        }
        return newSources
      })
    }

    setIsChecking(false)
  }

  // Calculate overall health based on data sources
  useEffect(() => {
    if (dataSources.some((source) => source.status === "checking")) {
      setOverallHealth("checking")
      return
    }

    if (dataSources.some((source) => source.status === "offline")) {
      setOverallHealth("offline")
      return
    }

    if (dataSources.some((source) => source.status === "degraded")) {
      setOverallHealth("degraded")
      return
    }

    setOverallHealth("healthy")
  }, [dataSources])

  // Initial check
  useEffect(() => {
    checkDataSources()
  }, [])

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Data Sources Health</CardTitle>
            <CardDescription className="text-gray-400">
              Status of all data sources used for match analysis
            </CardDescription>
          </div>
          <Badge
            variant={
              overallHealth === "healthy"
                ? "default"
                : overallHealth === "degraded"
                  ? "outline"
                  : overallHealth === "offline"
                    ? "destructive"
                    : "secondary"
            }
            className={
              overallHealth === "healthy"
                ? "bg-green-600"
                : overallHealth === "degraded"
                  ? "bg-yellow-600/20 text-yellow-300 border-yellow-500"
                  : overallHealth === "offline"
                    ? "bg-red-600"
                    : "bg-gray-600"
            }
          >
            {overallHealth === "healthy" && "All Systems Operational"}
            {overallHealth === "degraded" && "Degraded Performance"}
            {overallHealth === "offline" && "Service Disruption"}
            {overallHealth === "checking" && "Checking Status..."}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dataSources.map((source) => (
            <div
              key={source.name}
              className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600"
            >
              <div className="flex items-center">
                {source.status === "online" && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
                {source.status === "degraded" && <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />}
                {source.status === "offline" && <WifiOff className="h-4 w-4 text-red-500 mr-2" />}
                {source.status === "checking" && <RefreshCw className="h-4 w-4 text-gray-400 mr-2 animate-spin" />}

                <div>
                  <div className="text-sm font-medium">{source.name}</div>
                  <div className="text-xs text-gray-400">
                    {source.status === "checking"
                      ? "Checking..."
                      : source.status === "offline"
                        ? "Offline"
                        : source.latency
                          ? `${source.latency}ms`
                          : "Unknown"}
                  </div>
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        source.status === "online"
                          ? "bg-green-500"
                          : source.status === "degraded"
                            ? "bg-yellow-500"
                            : source.status === "offline"
                              ? "bg-red-500"
                              : "bg-gray-500"
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>
                      {source.status === "online"
                        ? "Online"
                        : source.status === "degraded"
                          ? "Degraded Performance"
                          : source.status === "offline"
                            ? "Offline"
                            : "Checking Status"}
                    </p>
                    {source.lastChecked && (
                      <p className="text-xs text-gray-400">Last checked: {source.lastChecked.toLocaleTimeString()}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-gray-700 pt-4">
        <div className="text-xs text-gray-400">
          {dataSources.some((source) => source.lastChecked) &&
            `Last checked: ${new Date(
              Math.max(
                ...dataSources.filter((source) => source.lastChecked).map((source) => source.lastChecked!.getTime()),
              ),
            ).toLocaleTimeString()}`}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkDataSources}
          disabled={isChecking}
          className="border-gray-600 hover:bg-gray-700 text-gray-300"
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Status
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
