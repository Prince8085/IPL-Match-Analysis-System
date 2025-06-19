"use client"

import { useEffect, useRef } from "react"

export default function PlayerMatchupChart({ player }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!player || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions and margins
    const margin = { top: 20, right: 20, bottom: 60, left: 40 }
    const width = canvas.width - margin.left - margin.right
    const height = canvas.height - margin.top - margin.bottom

    // Sample data (in a real app, this would come from the player data)
    const matchups = [
      { opponent: "B Kumar", success: 0.85 },
      { opponent: "J Bumrah", success: 0.45 },
      { opponent: "R Jadeja", success: 0.65 },
      { opponent: "Y Chahal", success: 0.75 },
      { opponent: "R Khan", success: 0.55 },
    ]

    // Define scales
    const barWidth = (width / matchups.length) * 0.7
    const xScale = (i) => margin.left + (i + 0.5) * (width / matchups.length) - barWidth / 2
    const yScale = (y) => margin.top + height - y * height

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

    matchups.forEach((matchup, i) => {
      const x = xScale(i) + barWidth / 2
      ctx.save()
      ctx.translate(x, margin.top + height + 5)
      ctx.rotate(Math.PI / 4) // Rotate labels for better fit
      ctx.fillText(matchup.opponent, 0, 0)
      ctx.restore()
    })

    // Draw Y-axis labels
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    for (let i = 0; i <= 1; i += 0.2) {
      const y = yScale(i)
      ctx.fillText((i * 100).toFixed(0) + "%", margin.left - 5, y)
    }

    // Draw Y-axis title
    ctx.save()
    ctx.translate(margin.left - 25, margin.top + height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Success Rate", 0, 0)
    ctx.restore()

    // Draw bars
    matchups.forEach((matchup, i) => {
      const x = xScale(i)
      const y = yScale(matchup.success)
      const barHeight = margin.top + height - y

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)

      if (matchup.success >= 0.7) {
        gradient.addColorStop(0, "#10b981") // Green-500
        gradient.addColorStop(1, "#059669") // Green-600
      } else if (matchup.success >= 0.5) {
        gradient.addColorStop(0, "#3b82f6") // Blue-500
        gradient.addColorStop(1, "#2563eb") // Blue-600
      } else {
        gradient.addColorStop(0, "#ef4444") // Red-500
        gradient.addColorStop(1, "#dc2626") // Red-600
      }

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // Add success rate text on top of bars
      ctx.fillStyle = "#fff"
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.fillText((matchup.success * 100).toFixed(0) + "%", x + barWidth / 2, y - 5)
    })

    // Draw threshold line for average
    const avgSuccess = matchups.reduce((sum, m) => sum + m.success, 0) / matchups.length
    const avgY = yScale(avgSuccess)

    ctx.beginPath()
    ctx.moveTo(margin.left, avgY)
    ctx.lineTo(margin.left + width, avgY)
    ctx.strokeStyle = "#f59e0b" // Amber-500
    ctx.lineWidth = 1
    ctx.setLineDash([5, 3])
    ctx.stroke()
    ctx.setLineDash([])

    // Add average label
    ctx.fillStyle = "#f59e0b" // Amber-500
    ctx.textAlign = "left"
    ctx.textBaseline = "bottom"
    ctx.fillText(`Avg: ${(avgSuccess * 100).toFixed(0)}%`, margin.left + 5, avgY - 2)
  }, [player])

  return <canvas ref={canvasRef} width={300} height={250} className="w-full" />
}
