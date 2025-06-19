"use client"

import { useEffect, useRef } from "react"

export default function VenueStatsChart({ predictions }) {
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
    const data = [
      {
        innings: "1st",
        avgScore: predictions.venueStats.avgFirstInningsScore,
        team1: predictions.venueStats.team1.avgScore,
        team2: predictions.venueStats.team2.avgScore,
      },
      {
        innings: "2nd",
        avgScore: predictions.venueStats.avgSecondInningsScore,
        team1: predictions.venueStats.team1.avgScore - 10,
        team2: predictions.venueStats.team2.avgScore - 5,
      },
    ]

    // Define scales
    const barWidth = (width / data.length / 3) * 0.8
    const xScale = (i) => margin.left + (i + 0.5) * (width / data.length) - barWidth * 1.5
    const yScale = (y) => margin.top + height - (y / 220) * height // Assuming max score around 220

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

    // Draw Y-axis labels
    ctx.fillStyle = "#9ca3af" // Gray-400
    ctx.font = "10px Arial"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    for (let i = 0; i <= 200; i += 50) {
      const y = yScale(i)
      ctx.fillText(i.toString(), margin.left - 5, y)
    }

    // Draw Y-axis title
    ctx.save()
    ctx.translate(margin.left - 25, margin.top + height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Score", 0, 0)
    ctx.restore()

    // Draw bars
    data.forEach((d, i) => {
      const x = xScale(i)

      // Venue average bar
      const avgY = yScale(d.avgScore)
      const avgHeight = margin.top + height - avgY
      ctx.fillStyle = "#6b7280" // Gray-500
      ctx.fillRect(x, avgY, barWidth, avgHeight)

      // Team 1 bar
      const team1Y = yScale(d.team1)
      const team1Height = margin.top + height - team1Y
      ctx.fillStyle = "#9333ea" // Purple-600
      ctx.fillRect(x + barWidth * 1.1, team1Y, barWidth, team1Height)

      // Team 2 bar
      const team2Y = yScale(d.team2)
      const team2Height = margin.top + height - team2Y
      ctx.fillStyle = "#2563eb" // Blue-600
      ctx.fillRect(x + barWidth * 2.2, team2Y, barWidth, team2Height)

      // Add innings label
      ctx.fillStyle = "#9ca3af" // Gray-400
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(d.innings + " Innings", x + barWidth * 1.1, margin.top + height + 5)
    })

    // Add score labels on top of bars
    ctx.fillStyle = "#fff"
    ctx.textAlign = "center"
    ctx.textBaseline = "bottom"

    data.forEach((d, i) => {
      const x = xScale(i)

      ctx.fillText(d.avgScore.toString(), x + barWidth / 2, yScale(d.avgScore) - 2)
      ctx.fillText(d.team1.toString(), x + barWidth * 1.1 + barWidth / 2, yScale(d.team1) - 2)
      ctx.fillText(d.team2.toString(), x + barWidth * 2.2 + barWidth / 2, yScale(d.team2) - 2)
    })

    // Add legend
    const legendY = margin.top

    // Venue average
    ctx.fillStyle = "#6b7280" // Gray-500
    ctx.fillRect(margin.left, legendY, 12, 12)
    ctx.fillStyle = "#9ca3af" // Gray-400
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillText("Venue Average", margin.left + 15, legendY + 6)

    // Team 1
    ctx.fillStyle = "#9333ea" // Purple-600
    ctx.fillRect(margin.left + 100, legendY, 12, 12)
    ctx.fillStyle = "#9ca3af" // Gray-400
    ctx.fillText(predictions.teams.team1, margin.left + 115, legendY + 6)

    // Team 2
    ctx.fillStyle = "#2563eb" // Blue-600
    ctx.fillRect(margin.left + 200, legendY, 12, 12)
    ctx.fillStyle = "#9ca3af" // Gray-400
    ctx.fillText(predictions.teams.team2, margin.left + 215, legendY + 6)
  }, [predictions])

  return <canvas ref={canvasRef} width={600} height={250} className="w-full" />
}
