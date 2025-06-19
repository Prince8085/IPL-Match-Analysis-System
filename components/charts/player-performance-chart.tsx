"use client"

import { useEffect, useRef } from "react"

export default function PlayerPerformanceChart({ player }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!player || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 30

    // Sample data (in a real app, this would come from the player data)
    const metrics = [
      { name: "Batting", value: 0.85 },
      { name: "Bowling", value: 0.65 },
      { name: "Fielding", value: 0.75 },
      { name: "Form", value: 0.9 },
      { name: "Consistency", value: 0.8 },
      { name: "Match-ups", value: 0.7 },
    ]

    const numMetrics = metrics.length
    const angleStep = (Math.PI * 2) / numMetrics

    // Draw radar background
    ctx.beginPath()
    for (let i = 0; i < numMetrics; i++) {
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fillStyle = "rgba(55, 65, 81, 0.3)" // Gray-700 with opacity
    ctx.fill()
    ctx.strokeStyle = "#4b5563" // Gray-600
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw radar grid lines
    for (let j = 1; j <= 4; j++) {
      const gridRadius = (radius * j) / 4

      ctx.beginPath()
      for (let i = 0; i < numMetrics; i++) {
        const angle = i * angleStep - Math.PI / 2
        const x = centerX + gridRadius * Math.cos(angle)
        const y = centerY + gridRadius * Math.sin(angle)

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.strokeStyle = "#374151" // Gray-700
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    // Draw radar axes
    for (let i = 0; i < numMetrics; i++) {
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = "#4b5563" // Gray-600
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Draw axis labels
      ctx.fillStyle = "#9ca3af" // Gray-400
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const labelRadius = radius + 15
      const labelX = centerX + labelRadius * Math.cos(angle)
      const labelY = centerY + labelRadius * Math.sin(angle)

      ctx.fillText(metrics[i].name, labelX, labelY)
    }

    // Draw player data
    ctx.beginPath()
    for (let i = 0; i < numMetrics; i++) {
      const angle = i * angleStep - Math.PI / 2
      const value = metrics[i].value
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fillStyle = "rgba(147, 51, 234, 0.3)" // Purple-600 with opacity
    ctx.fill()
    ctx.strokeStyle = "#9333ea" // Purple-600
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw data points
    for (let i = 0; i < numMetrics; i++) {
      const angle = i * angleStep - Math.PI / 2
      const value = metrics[i].value
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#9333ea" // Purple-600
      ctx.fill()
    }
  }, [player])

  return <canvas ref={canvasRef} width={300} height={250} className="w-full" />
}
