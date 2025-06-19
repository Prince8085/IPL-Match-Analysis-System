"use client"

import { useEffect, useRef } from "react"

export default function WicketProbabilityChart({ predictions, selectedOver }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!predictions || !canvasRef.current || !selectedOver) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions and margins
    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const width = canvas.width - margin.left - margin.right
    const height = canvas.height - margin.top - margin.bottom

    // Sample data (in a real app, this would come from the predictions)
    // Probability of wicket for each ball in the over
    const data = [
      { ball: 1, probability: 0.08 },
      { ball: 2, probability: 0.12 },
      { ball: 3, probability: 0.15 },
      { ball: 4, probability: 0.1 },
      { ball: 5, probability: 0.18 },
      { ball: 6, probability: 0.22 },
    ]

    // Define scales
    const barWidth = (width / data.length) * 0.8
    const xScale = (i) => margin.left + (i + 0.5) * (width / data.length) - barWidth / 2
    const yScale = (y) => margin.top + height - y * height * 2 // Scale up for better visibility

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

    data.forEach((d, i) => {
      const x = xScale(i) + barWidth / 2
      ctx.fillText(d.ball.toString(), x, margin.top + height + 15)
    })

    // Draw Y-axis labels
    ctx.textAlign = "right"
    for (let i = 0; i <= 0.5; i += 0.1) {
      const y = yScale(i)
      ctx.fillText((i * 100).toFixed(0) + "%", margin.left - 5, y + 3)
    }

    // Draw X-axis title
    ctx.fillText("Ball", margin.left + width / 2, margin.top + height + 25)

    // Draw Y-axis title
    ctx.save()
    ctx.translate(margin.left - 25, margin.top + height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Wicket Probability", 0, 0)
    ctx.restore()

    // Draw bars
    data.forEach((d, i) => {
      const x = xScale(i)
      const y = yScale(d.probability)
      const height = margin.top + canvas.height - margin.bottom - y

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + height)
      gradient.addColorStop(0, "#dc2626") // Red-600
      gradient.addColorStop(1, "#b91c1c") // Red-700

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, height)

      // Add probability text on top of bars
      ctx.fillStyle = "#fff"
      ctx.textAlign = "center"
      ctx.fillText((d.probability * 100).toFixed(0) + "%", x + barWidth / 2, y - 5)
    })
  }, [predictions, selectedOver])

  return <canvas ref={canvasRef} width={300} height={200} className="w-full" />
}
