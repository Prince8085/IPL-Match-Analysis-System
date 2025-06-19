"use client"

import { useEffect, useRef } from "react"

export default function PitchHeatmapChart({ predictions, type }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!predictions || !canvasRef.current || !type) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const margin = 20
    const fieldRadius = Math.min(width, height) / 2 - margin

    // Draw cricket field
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, fieldRadius, 0, Math.PI * 2)
    ctx.fillStyle = "#065f46" // Green-800
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw 30-yard circle
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, fieldRadius * 0.7, 0, Math.PI * 2)
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw pitch
    const pitchWidth = fieldRadius * 0.15
    const pitchLength = fieldRadius * 0.8
    ctx.beginPath()
    ctx.rect(width / 2 - pitchWidth / 2, height / 2 - pitchLength / 2, pitchWidth, pitchLength)
    ctx.fillStyle = "#d97706" // Amber-600
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw heatmap zones
    const zones = [
      // Offside zones
      {
        x: width / 2 - fieldRadius * 0.5,
        y: height / 2 - fieldRadius * 0.3,
        value: type === "scoring" ? 0.8 : 0.4,
        label: "Cover",
      },
      { x: width / 2 - fieldRadius * 0.6, y: height / 2, value: type === "scoring" ? 0.6 : 0.7, label: "Point" },
      {
        x: width / 2 - fieldRadius * 0.5,
        y: height / 2 + fieldRadius * 0.3,
        value: type === "scoring" ? 0.4 : 0.8,
        label: "Third Man",
      },

      // Onside zones
      {
        x: width / 2 + fieldRadius * 0.5,
        y: height / 2 - fieldRadius * 0.3,
        value: type === "scoring" ? 0.7 : 0.5,
        label: "Mid-wicket",
      },
      { x: width / 2 + fieldRadius * 0.6, y: height / 2, value: type === "scoring" ? 0.9 : 0.3, label: "Square Leg" },
      {
        x: width / 2 + fieldRadius * 0.5,
        y: height / 2 + fieldRadius * 0.3,
        value: type === "scoring" ? 0.5 : 0.6,
        label: "Fine Leg",
      },

      // Straight zones
      { x: width / 2, y: height / 2 - fieldRadius * 0.5, value: type === "scoring" ? 0.7 : 0.5, label: "Long-off" },
      { x: width / 2, y: height / 2 + fieldRadius * 0.5, value: type === "scoring" ? 0.6 : 0.7, label: "Long-on" },
    ]

    // Draw zones
    zones.forEach((zone) => {
      // Draw heat circle
      const radius = fieldRadius * 0.2 * zone.value
      const gradient = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, radius)

      if (type === "scoring") {
        gradient.addColorStop(0, "rgba(239, 68, 68, 0.8)") // Red-500 with opacity
        gradient.addColorStop(1, "rgba(239, 68, 68, 0)")
      } else {
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.8)") // Green-500 with opacity
        gradient.addColorStop(1, "rgba(16, 185, 129, 0)")
      }

      ctx.beginPath()
      ctx.arc(zone.x, zone.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Add zone label
      ctx.fillStyle = "#fff"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(zone.label, zone.x, zone.y)
    })

    // Add legend
    const legendY = height - 30
    const legendX = width / 2 - 100

    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    if (type === "scoring") {
      ctx.fillStyle = "rgba(239, 68, 68, 0.8)" // Red-500 with opacity
      ctx.fillRect(legendX, legendY, 15, 15)
      ctx.fillStyle = "#fff"
      ctx.fillText("High Scoring Zone", legendX + 70, legendY + 7)
    } else {
      ctx.fillStyle = "rgba(16, 185, 129, 0.8)" // Green-500 with opacity
      ctx.fillRect(legendX, legendY, 15, 15)
      ctx.fillStyle = "#fff"
      ctx.fillText("Effective Bowling Zone", legendX + 80, legendY + 7)
    }
  }, [predictions, type])

  return <canvas ref={canvasRef} width={300} height={250} className="w-full" />
}
