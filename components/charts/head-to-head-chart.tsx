"use client"

import { useEffect, useRef } from "react"

export default function HeadToHeadChart({ predictions }) {
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
    const radius = Math.min(centerX, centerY) - 20

    // Calculate angles
    const team1Wins = predictions.headToHead.team1Wins
    const team2Wins = predictions.headToHead.team2Wins
    const noResults = predictions.headToHead.noResults
    const totalMatches = team1Wins + team2Wins + noResults

    const team1Angle = (team1Wins / totalMatches) * Math.PI * 2
    const team2Angle = (team2Wins / totalMatches) * Math.PI * 2
    const noResultsAngle = (noResults / totalMatches) * Math.PI * 2

    // Draw team 1 portion
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, 0, team1Angle)
    ctx.fillStyle = "#9333ea" // Purple-600
    ctx.fill()

    // Draw team 2 portion
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, team1Angle, team1Angle + team2Angle)
    ctx.fillStyle = "#2563eb" // Blue-600
    ctx.fill()

    // Draw no results portion if exists
    if (noResults > 0) {
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, team1Angle + team2Angle, Math.PI * 2)
      ctx.fillStyle = "#6b7280" // Gray-500
      ctx.fill()
    }

    // Add labels
    ctx.font = "12px Arial"
    ctx.fillStyle = "#fff"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Team 1 label
    const team1LabelAngle = team1Angle / 2
    const team1LabelX = centerX + Math.cos(team1LabelAngle) * (radius * 0.7)
    const team1LabelY = centerY + Math.sin(team1LabelAngle) * (radius * 0.7)
    if (team1Wins / totalMatches > 0.1) {
      // Only show label if segment is large enough
      ctx.fillText(`${team1Wins} (${Math.round((team1Wins / totalMatches) * 100)}%)`, team1LabelX, team1LabelY)
    }

    // Team 2 label
    const team2LabelAngle = team1Angle + team2Angle / 2
    const team2LabelX = centerX + Math.cos(team2LabelAngle) * (radius * 0.7)
    const team2LabelY = centerY + Math.sin(team2LabelAngle) * (radius * 0.7)
    if (team2Wins / totalMatches > 0.1) {
      // Only show label if segment is large enough
      ctx.fillText(`${team2Wins} (${Math.round((team2Wins / totalMatches) * 100)}%)`, team2LabelX, team2LabelY)
    }

    // No results label
    if (noResults > 0 && noResults / totalMatches > 0.05) {
      const noResultsLabelAngle = team1Angle + team2Angle + noResultsAngle / 2
      const noResultsLabelX = centerX + Math.cos(noResultsLabelAngle) * (radius * 0.7)
      const noResultsLabelY = centerY + Math.sin(noResultsLabelAngle) * (radius * 0.7)
      ctx.fillText(`${noResults} (${Math.round((noResults / totalMatches) * 100)}%)`, noResultsLabelX, noResultsLabelY)
    }

    // Add legend
    const legendY = canvas.height - 30

    // Team 1
    ctx.fillStyle = "#9333ea" // Purple-600
    ctx.fillRect(centerX - 100, legendY, 12, 12)
    ctx.fillStyle = "#9ca3af" // Gray-400
    ctx.textAlign = "left"
    ctx.fillText(predictions.teams.team1, centerX - 85, legendY + 6)

    // Team 2
    ctx.fillStyle = "#2563eb" // Blue-600
    ctx.fillRect(centerX + 10, legendY, 12, 12)
    ctx.fillStyle = "#9ca3af" // Gray-400
    ctx.fillText(predictions.teams.team2, centerX + 25, legendY + 6)

    // No results (if any)
    if (noResults > 0) {
      ctx.fillStyle = "#6b7280" // Gray-500
      ctx.fillRect(centerX - 45, legendY + 20, 12, 12)
      ctx.fillStyle = "#9ca3af" // Gray-400
      ctx.fillText("No Result", centerX - 30, legendY + 26)
    }
  }, [predictions])

  return <canvas ref={canvasRef} width={300} height={200} className="w-full" />
}
