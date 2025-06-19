"use client"

import { useEffect, useRef } from "react"

export default function PhaseAnalysisChart({ predictions, team, type }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    // Add safety checks for all required properties
    if (!predictions || !canvasRef.current || !team || !type) return

    // Ensure predictions.teams and predictions.phaseAnalysis exist
    if (!predictions.teams || !predictions.phaseAnalysis) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions and margins
    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const width = canvas.width - margin.left - margin.right
    const height = canvas.height - margin.top - margin.bottom

    // Get data based on team and type with safety checks
    // First, determine which team key to use
    let teamKey = "team1" // Default to team1

    // Safely check if team matches team1 or team2
    if (predictions.teams.team1 && team === predictions.teams.team1) {
      teamKey = "team1"
    } else if (predictions.teams.team2 && team === predictions.teams.team2) {
      teamKey = "team2"
    }

    // Safely access phaseAnalysis data with fallbacks
    const phaseData = predictions.phaseAnalysis?.[teamKey]?.[type] || []

    // If no phase data, return early
    if (phaseData.length === 0) return

    // Define scales
    const barWidth = (width / phaseData.length) * 0.7
    const xScale = (i) => margin.left + (i + 0.5) * (width / phaseData.length) - barWidth / 2
    const yScale = (y) => margin.top + height - (y / 10) * height

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

    for (let i = 0; i <= 10; i += 2) {
      const y = yScale(i)
      ctx.fillText(i.toString(), margin.left - 5, y)
    }

    // Draw Y-axis title
    ctx.save()
    ctx.translate(margin.left - 25, margin.top + height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Rating", 0, 0)
    ctx.restore()

    // Draw bars
    phaseData.forEach((phase, i) => {
      const x = xScale(i)
      const y = yScale(phase.rating)
      const barHeight = margin.top + height - y

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)

      if (teamKey === "team1") {
        gradient.addColorStop(0, "#9333ea") // Purple-600
        gradient.addColorStop(1, "#7e22ce") // Purple-700
      } else {
        gradient.addColorStop(0, "#2563eb") // Blue-600
        gradient.addColorStop(1, "#1d4ed8") // Blue-700
      }

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // Add phase name below bar
      ctx.fillStyle = "#9ca3af" // Gray-400
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(phase.name, x + barWidth / 2, margin.top + height + 5)

      // Add rating on top of bar
      ctx.fillStyle = "#fff"
      ctx.textBaseline = "bottom"
      ctx.fillText(phase.rating.toString(), x + barWidth / 2, y - 2)
    })

    // Add title
    ctx.fillStyle = "#fff"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText(
      `${team} ${type.charAt(0).toUpperCase() + type.slice(1)} Phases`,
      margin.left + width / 2,
      margin.top - 10,
    )
  }, [predictions, team, type])

  return <canvas ref={canvasRef} width={300} height={200} className="w-full" />
}
