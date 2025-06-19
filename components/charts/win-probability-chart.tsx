"use client"

import { useEffect, useRef } from "react"

export default function WinProbabilityChart({ predictions }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!predictions || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Draw team 1 portion
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2 * (predictions.winProbability.team1 / 100))
    ctx.fillStyle = "#9333ea" // Purple
    ctx.fill()

    // Draw team 2 portion
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(
      centerX,
      centerY,
      radius,
      Math.PI * 2 * (predictions.winProbability.team1 / 100),
      Math.PI * 2 * ((predictions.winProbability.team1 + predictions.winProbability.team2) / 100),
    )
    ctx.fillStyle = "#2563eb" // Blue
    ctx.fill()

    // Draw tie portion if exists
    if (predictions.winProbability.tie && predictions.winProbability.tie > 0) {
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(
        centerX,
        centerY,
        radius,
        Math.PI * 2 * ((predictions.winProbability.team1 + predictions.winProbability.team2) / 100),
        Math.PI * 2,
      )
      ctx.fillStyle = "#d97706" // Amber
      ctx.fill()
    }

    // Add labels
    ctx.font = "14px Arial"
    ctx.fillStyle = "#fff"

    // Team 1 label
    const team1LabelAngle = Math.PI * 2 * (predictions.winProbability.team1 / 200)
    const team1LabelX = centerX + Math.cos(team1LabelAngle) * (radius / 2)
    const team1LabelY = centerY + Math.sin(team1LabelAngle) * (radius / 2)
    ctx.fillText(`${predictions.winProbability.team1}%`, team1LabelX - 15, team1LabelY)

    // Team 2 label
    const team2LabelAngle =
      Math.PI * 2 * ((predictions.winProbability.team1 + predictions.winProbability.team2 / 2) / 100)
    const team2LabelX = centerX + Math.cos(team2LabelAngle) * (radius / 2)
    const team2LabelY = centerY + Math.sin(team2LabelAngle) * (radius / 2)
    ctx.fillText(`${predictions.winProbability.team2}%`, team2LabelX - 15, team2LabelY)

    // Tie label if exists
    if (predictions.winProbability.tie && predictions.winProbability.tie > 0) {
      const tieLabelAngle =
        Math.PI *
        2 *
        ((predictions.winProbability.team1 + predictions.winProbability.team2 + predictions.winProbability.tie / 2) /
          100)
      const tieLabelX = centerX + Math.cos(tieLabelAngle) * (radius / 2)
      const tieLabelY = centerY + Math.sin(tieLabelAngle) * (radius / 2)
      ctx.fillText(`${predictions.winProbability.tie}%`, tieLabelX - 15, tieLabelY)
    }
  }, [predictions])

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-2">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-purple-600 mr-2"></span>
          <span className="text-sm font-medium text-white">{predictions?.teams?.team1 || "Team 1"}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-600 mr-2"></span>
          <span className="text-sm font-medium text-white">{predictions?.teams?.team2 || "Team 2"}</span>
        </div>
        {predictions?.winProbability?.tie > 0 && (
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-600 mr-2"></span>
            <span className="text-sm font-medium text-white">Tie/NR</span>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} width={300} height={300} className="mx-auto" />
    </div>
  )
}
