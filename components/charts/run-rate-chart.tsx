"use client"

import { useEffect, useRef } from "react"

export default function RunRateChart({ predictions }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!predictions || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions and margins
    const margin = { top: 20, right: 30, bottom: 40, left: 40 }
    const width = canvas.width - margin.left - margin.right
    const height = canvas.height - margin.top - margin.bottom

    // Sample data (in a real app, this would come from the predictions)
    const data = [
      { over: 1, team1RR: 6.0, team2RR: 7.0 },
      { over: 2, team1RR: 7.5, team2RR: 8.0 },
      { over: 3, team1RR: 8.0, team2RR: 7.5 },
      { over: 4, team1RR: 9.0, team2RR: 6.5 },
      { over: 5, team1RR: 10.0, team2RR: 7.0 },
      { over: 6, team1RR: 9.5, team2RR: 8.0 },
      { over: 7, team1RR: 8.5, team2RR: 7.5 },
      { over: 8, team1RR: 7.5, team2RR: 7.0 },
      { over: 9, team1RR: 7.0, team2RR: 8.0 },
      { over: 10, team1RR: 8.0, team2RR: 8.5 },
      { over: 11, team1RR: 7.5, team2RR: 9.0 },
      { over: 12, team1RR: 8.0, team2RR: 8.5 },
      { over: 13, team1RR: 8.5, team2RR: 8.0 },
      { over: 14, team1RR: 9.0, team2RR: 7.5 },
      { over: 15, team1RR: 10.0, team2RR: 8.0 },
      { over: 16, team1RR: 11.0, team2RR: 9.0 },
      { over: 17, team1RR: 12.0, team2RR: 10.0 },
      { over: 18, team1RR: 13.0, team2RR: 11.0 },
      { over: 19, team1RR: 12.0, team2RR: 12.0 },
      { over: 20, team1RR: 11.0, team2RR: 13.0 },
    ]

    // Define scales
    const xScale = (x) => margin.left + (x / 20) * width
    const yScale = (y) => margin.top + height - (y / 14) * height

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

    for (let i = 0; i <= 20; i += 5) {
      const x = xScale(i)
      ctx.fillText(i.toString(), x, margin.top + height + 15)
    }

    // Draw Y-axis labels
    ctx.textAlign = "right"
    for (let i = 0; i <= 14; i += 2) {
      const y = yScale(i)
      ctx.fillText(i.toString(), margin.left - 5, y + 3)
    }

    // Draw X-axis title
    ctx.fillText("Overs", margin.left + width / 2, margin.top + height + 30)

    // Draw Y-axis title
    ctx.save()
    ctx.translate(margin.left - 25, margin.top + height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Run Rate", 0, 0)
    ctx.restore()

    // Draw grid lines
    ctx.beginPath()
    ctx.strokeStyle = "#374151" // Gray-700
    ctx.lineWidth = 0.5

    for (let i = 0; i <= 20; i += 5) {
      const x = xScale(i)
      ctx.moveTo(x, margin.top)
      ctx.lineTo(x, margin.top + height)
    }

    for (let i = 0; i <= 14; i += 2) {
      const y = yScale(i)
      ctx.moveTo(margin.left, y)
      ctx.lineTo(margin.left + width, y)
    }

    ctx.stroke()

    // Draw team 1 line
    ctx.beginPath()
    ctx.strokeStyle = "#9333ea" // Purple-600
    ctx.lineWidth = 2

    data.forEach((d, i) => {
      const x = xScale(d.over)
      const y = yScale(d.team1RR)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw team 2 line
    ctx.beginPath()
    ctx.strokeStyle = "#2563eb" // Blue-600
    ctx.lineWidth = 2

    data.forEach((d, i) => {
      const x = xScale(d.over)
      const y = yScale(d.team2RR)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw data points for team 1
    data.forEach((d) => {
      const x = xScale(d.over)
      const y = yScale(d.team1RR)

      ctx.beginPath()
      ctx.fillStyle = "#9333ea" // Purple-600
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw data points for team 2
    data.forEach((d) => {
      const x = xScale(d.over)
      const y = yScale(d.team2RR)

      ctx.beginPath()
      ctx.fillStyle = "#2563eb" // Blue-600
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [predictions])

  return (
    <div className="flex flex-col">
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-purple-600 mr-2"></span>
          <span className="text-sm font-medium text-white">{predictions?.teams?.team1 || "Team 1"}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-600 mr-2"></span>
          <span className="text-sm font-medium text-white">{predictions?.teams?.team2 || "Team 2"}</span>
        </div>
      </div>
      <canvas ref={canvasRef} width={600} height={300} className="w-full" />
    </div>
  )
}
