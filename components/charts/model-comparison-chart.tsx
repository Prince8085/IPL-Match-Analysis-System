"use client"

import { useEffect, useRef } from "react"

export default function ModelComparisonChart({ predictions }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!predictions || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions and margins
    const margin = { top: 20, right: 20, bottom: 60, left: 40 }
    const width = canvas.width - margin.left - margin.right
    const height = canvas.height - margin.top - margin.bottom

    // Sample data (in a real app, this would come from the predictions)
    const models = predictions.modelInsights.modelComparison

    // Define scales
    const barWidth = (width / models.length) * 0.7
    const xScale = (i) => margin.left + (i + 0.5) * (width / models.length) - barWidth / 2
    const yScale = (y) => margin.top + height - (y / 100) * height

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

    for (let i = 0; i <= 100; i += 20) {
      const y = yScale(i)
      ctx.fillText(i + "%", margin.left - 5, y)
    }

    // Draw Y-axis title
    ctx.save()
    ctx.translate(margin.left - 25, margin.top + height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Accuracy", 0, 0)
    ctx.restore()

    // Draw bars
    models.forEach((model, i) => {
      const x = xScale(i)
      const y = yScale(model.accuracy)
      const barHeight = margin.top + height - y

      // Create gradient based on accuracy
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)

      if (model.accuracy >= 80) {
        gradient.addColorStop(0, "#10b981") // Green-500
        gradient.addColorStop(1, "#059669") // Green-600
      } else if (model.accuracy >= 70) {
        gradient.addColorStop(0, "#3b82f6") // Blue-500
        gradient.addColorStop(1, "#2563eb") // Blue-600
      } else {
        gradient.addColorStop(0, "#f59e0b") // Amber-500
        gradient.addColorStop(1, "#d97706") // Amber-600
      }

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // Add model name
      ctx.fillStyle = "#9ca3af" // Gray-400
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.save()
      ctx.translate(x + barWidth / 2, margin.top + height + 5)
      ctx.rotate(Math.PI / 4) // Rotate labels for better fit
      ctx.fillText(model.name, 0, 0)
      ctx.restore()

      // Add accuracy value
      ctx.fillStyle = "#fff"
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.fillText(model.accuracy + "%", x + barWidth / 2, y - 2)
    })

    // Draw threshold line
    const thresholdY = yScale(75)
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
    ctx.fillText("Minimum Threshold", margin.left + 5, thresholdY - 2)
  }, [predictions])

  return <canvas ref={canvasRef} width={500} height={300} className="w-full" />
}
