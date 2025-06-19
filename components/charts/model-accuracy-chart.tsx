"use client"

import { useEffect, useRef } from "react"

export default function ModelAccuracyChart({ predictions }) {
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
      { month: "Jan", accuracy: 0.72 },
      { month: "Feb", accuracy: 0.75 },
      { month: "Mar", accuracy: 0.73 },
      { month: "Apr", accuracy: 0.78 },
      { month: "May", accuracy: 0.8 },
      { month: "Jun", accuracy: 0.82 },
      { month: "Jul", accuracy: 0.79 },
      { month: "Aug", accuracy: 0.83 },
      { month: "Sep", accuracy: 0.85 },
      { month: "Oct", accuracy: 0.84 },
      { month: "Nov", accuracy: 0.86 },
      { month: "Dec", accuracy: 0.88 },
    ]

    // Define scales
    const xScale = (i) => margin.left + (i + 0.5) * (width / data.length)
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

    data.forEach((d, i) => {
      const x = xScale(i)
      ctx.fillText(d.month, x, margin.top + height + 5)
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
    ctx.fillText("Accuracy", 0, 0)
    ctx.restore()

    // Draw line
    ctx.beginPath()
    data.forEach((d, i) => {
      const x = xScale(i)
      const y = yScale(d.accuracy)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.strokeStyle = "#9333ea" // Purple-600
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw area under the line
    ctx.beginPath()
    ctx.moveTo(xScale(0), yScale(0))
    data.forEach((d, i) => {
      const x = xScale(i)
      const y = yScale(d.accuracy)
      ctx.lineTo(x, y)
    })
    ctx.lineTo(xScale(data.length - 1), yScale(0))
    ctx.closePath()
    ctx.fillStyle = "rgba(147, 51, 234, 0.2)" // Purple-600 with opacity
    ctx.fill()

    // Draw data points
    data.forEach((d, i) => {
      const x = xScale(i)
      const y = yScale(d.accuracy)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#9333ea" // Purple-600
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Draw threshold line
    const thresholdY = yScale(0.75)
    ctx.beginPath()
    ctx.moveTo(margin.left, thresholdY)
    ctx.lineTo(margin.left + width, thresholdY)
    ctx.strokeStyle = "#f59e0b" // Amber-500
    ctx.lineWidth = 1
    ctx.setLineDash([5, 3])
    ctx.stroke()
    ctx.setLineDash([])

    // Add threshold label
    ctx.fillStyle = "#f59e0b" // Amber-500
    ctx.textAlign = "left"
    ctx.textBaseline = "bottom"
    ctx.fillText("Target: 75%", margin.left + 5, thresholdY - 2)
  }, [predictions])

  return <canvas ref={canvasRef} width={600} height={250} className="w-full" />
}
