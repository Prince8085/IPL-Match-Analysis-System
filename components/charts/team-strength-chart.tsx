"use client"

import { useEffect, useRef } from "react"

export default function TeamStrengthChart({ predictions }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!predictions || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions and margins
    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const width = canvas.width - margin.left - margin.right
    const height = canvas.height - margin.top - margin.bottom

    // Sample data (in a real app, this would come from the predictions)
    const metrics = [
      {
        name: "Batting",
        team1: predictions.teamComparison.battingStrength.team1 / 10,
        team2: predictions.teamComparison.battingStrength.team2 / 10,
      },
      {
        name: "Bowling",
        team1: predictions.teamComparison.bowlingAttack.team1 / 10,
        team2: predictions.teamComparison.bowlingAttack.team2 / 10,
      },
      {
        name: "Fielding",
        team1: predictions.teamComparison.fieldingQuality.team1 / 10,
        team2: predictions.teamComparison.fieldingQuality.team2 / 10,
      },
      {
        name: "Form",
        team1: predictions.teamComparison.recentForm.team1 / 10,
        team2: predictions.teamComparison.recentForm.team2 / 10,
      },
      {
        name: "Venue",
        team1: predictions.teamComparison.venueRecord.team1 / 10,
        team2: predictions.teamComparison.venueRecord.team2 / 10,
      },
    ]

    // Define scales
    const barHeight = (height / metrics.length) * 0.4
    const yScale = (i) => margin.top + (i + 0.5) * (height / metrics.length)
    const xScale = (x) => margin.left + x * width

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#4b5563" // Gray-600
    ctx.lineWidth = 1

    // X-axis
    ctx.moveTo(margin.left, margin.top + height)
    ctx.lineTo(margin.left + width, margin.top + height)

    // Y-axis
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, margin.top + height)
    ctx.stroke()

    // Draw X-axis labels
    ctx.fillStyle = "#9ca3af" // Gray-400
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    for (let i = 0; i <= 1; i += 0.2) {
      const x = xScale(i)
      ctx.fillText((i * 10).toFixed(0), x, margin.top + height + 5)
    }

    // Draw X-axis title
    ctx.fillText("Rating (0-10)", margin.left + width / 2, margin.top + height + 20)

    // Draw bars for each metric
    metrics.forEach((metric, i) => {
      const y = yScale(i) - barHeight

      // Team 1 bar
      const team1Width = metric.team1 * width
      ctx.fillStyle = "#9333ea" // Purple-600
      ctx.fillRect(margin.left, y - barHeight - 2, team1Width, barHeight)

      // Team 2 bar
      const team2Width = metric.team2 * width
      ctx.fillStyle = "#2563eb" // Blue-600
      ctx.fillRect(margin.left, y, team2Width, barHeight)

      // Add metric name
      ctx.fillStyle = "#9ca3af" // Gray-400
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillText(metric.name, margin.left - 5, y - barHeight / 2 - 2)

      // Add values
      ctx.textAlign = "left"
      ctx.fillStyle = "#fff"
      ctx.fillText((metric.team1 * 10).toFixed(1), margin.left + team1Width + 5, y - barHeight / 2 - 2)
      ctx.fillText((metric.team2 * 10).toFixed(1), margin.left + team2Width + 5, y + barHeight / 2)
    })

    // Add legend
    const legendX = margin.left + width - 100
    const legendY = margin.top + 15

    // Team 1
    ctx.fillStyle = "#9333ea" // Purple-600
    ctx.fillRect(legendX, legendY, 15, 10)
    ctx.fillStyle = "#9ca3af" // Gray-400
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillText(predictions.teams.team1, legendX + 20, legendY + 5)

    // Team 2
    ctx.fillStyle = "#2563eb" // Blue-600
    ctx.fillRect(legendX, legendY + 15, 15, 10)
    ctx.fillStyle = "#9ca3af" // Gray-400
    ctx.fillText(predictions.teams.team2, legendX + 20, legendY + 20)
  }, [predictions])

  return <canvas ref={canvasRef} width={600} height={250} className="w-full" />
}
