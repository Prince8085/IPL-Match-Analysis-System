"use client"

import { useEffect, useRef } from "react"

export default function BallPredictionChart({ prediction }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!prediction || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    // Draw cricket field
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fillStyle = "#065f46" // Green-800
    ctx.fill()

    // Draw pitch
    const pitchWidth = radius * 0.2
    const pitchLength = radius * 1.2
    ctx.beginPath()
    ctx.rect(centerX - pitchWidth / 2, centerY - pitchLength / 2, pitchWidth, pitchLength)
    ctx.fillStyle = "#d97706" // Amber-600
    ctx.fill()

    // Draw crease lines
    ctx.beginPath()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2

    // Batting crease
    ctx.moveTo(centerX - pitchWidth * 1.5, centerY + pitchLength / 2 - 10)
    ctx.lineTo(centerX + pitchWidth * 1.5, centerY + pitchLength / 2 - 10)

    // Bowling crease
    ctx.moveTo(centerX - pitchWidth * 1.5, centerY - pitchLength / 2 + 10)
    ctx.lineTo(centerX + pitchWidth * 1.5, centerY - pitchLength / 2 + 10)

    // Stumps
    ctx.moveTo(centerX - pitchWidth / 4, centerY + pitchLength / 2)
    ctx.lineTo(centerX + pitchWidth / 4, centerY + pitchLength / 2)
    ctx.moveTo(centerX - pitchWidth / 4, centerY - pitchLength / 2)
    ctx.lineTo(centerX + pitchWidth / 4, centerY - pitchLength / 2)

    ctx.stroke()

    // Draw boundary
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 5, 0, Math.PI * 2)
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw 30-yard circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2)
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw predicted shot zones
    // This would normally come from the prediction data
    const shotZones = [
      { direction: 0, probability: 0.15, label: "Straight" },
      { direction: 45, probability: 0.25, label: "Mid-wicket" },
      { direction: 90, probability: 0.2, label: "Square Leg" },
      { direction: 135, probability: 0.05, label: "Fine Leg" },
      { direction: 180, probability: 0.05, label: "Third Man" },
      { direction: 225, probability: 0.1, label: "Point" },
      { direction: 270, probability: 0.15, label: "Cover" },
      { direction: 315, probability: 0.05, label: "Mid-off" },
    ]

    shotZones.forEach((zone) => {
      const angle = (zone.direction * Math.PI) / 180
      const distance = radius * 0.8 * zone.probability * 3 // Scale for visibility

      const x = centerX + Math.cos(angle) * distance
      const y = centerY - Math.sin(angle) * distance

      // Draw shot probability indicator
      ctx.beginPath()
      ctx.arc(x, y, 10 * zone.probability * 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(147, 51, 234, ${zone.probability * 2})` // Purple with opacity based on probability
      ctx.fill()

      // Draw line from center to zone
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = `rgba(255, 255, 255, ${zone.probability})`
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw zone label
      ctx.fillStyle = "#fff"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(zone.label, x, y - 15)
    })

    // Draw batsman
    ctx.beginPath()
    ctx.arc(centerX, centerY + pitchLength / 2 - 20, 5, 0, Math.PI * 2)
    ctx.fillStyle = "#fff"
    ctx.fill()

    // Draw bowler
    ctx.beginPath()
    ctx.arc(centerX, centerY - pitchLength / 2 + 20, 5, 0, Math.PI * 2)
    ctx.fillStyle = "#fff"
    ctx.fill()
  }, [prediction])

  return <canvas ref={canvasRef} width={400} height={300} className="w-full" />
}
