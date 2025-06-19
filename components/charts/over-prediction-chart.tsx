"use client"

import { useEffect, useRef } from "react"

export default function OverPredictionChart({ predictions, selectedOver }) {
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
    // Probability distribution of runs per ball in the selected over
    const data = [
      { runs: 0, probability: 0.3 },
      { runs: 1, probability: 0.25 },
      { runs: 2, probability: 0.15 },
      { runs: 3, probability: 0.05 },
      { runs: 4, probability: 0.15 },
      { runs: 6, probability: 0.1 },
    ]

    // Define scales
    const barWidth = (width / data.length) * 0.8
    const xScale = (i) => margin.left + (i + 0.5) * (width / data.length) - barWidth / 2
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

    data.forEach((d, i) => {
      const x = xScale(i) + barWidth / 2
      ctx.fillText(d.runs.toString(), x, margin.top + height + 15)
    })

    // Draw Y-axis labels
    ctx.textAlign = "right"
    for (let i = 0; i <= 1; i += 0.2) {
      const y = yScale(i)
      ctx.fillText((i * 100).toFixed(0) + "%", margin.left - 5, y + 3)
    }

    // Draw X-axis title
    ctx.fillText("Runs", margin.left + width / 2, margin.top + height + 25)

    // Draw Y-axis title
    ctx.save()
    ctx.translate(margin.left - 25, margin.top + height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Probability", 0, 0)
    ctx.restore()

    // Draw bars
    data.forEach((d, i) => {
      const x = xScale(i)
      const y = yScale(d.probability)
      const height = margin.top + canvas.height - margin.bottom - y

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + height)
      gradient.addColorStop(0, "#9333ea") // Purple-600
      gradient.addColorStop(1, "#7e22ce") // Purple-700

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
