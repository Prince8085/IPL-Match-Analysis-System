"use client"

import { useEffect, useRef } from "react"

export default function FeatureImportanceChart({ predictions }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!predictions || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions and margins
    const margin = { top: 20, right: 20, bottom: 30, left: 150 }
    const width = canvas.width - margin.left - margin.right
    const height = canvas.height - margin.top - margin.bottom

    // Get top 5 features
    const features = predictions.modelInsights.featureImportance.slice(0, 5)

    // Define scales
    const barHeight = (height / features.length) * 0.7
    const yScale = (i) => margin.top + (i + 0.5) * (height / features.length) - barHeight / 2
    const xScale = (x) => margin.left + (x / 100) * width

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

    for (let i = 0; i <= 100; i += 20) {
      const x = xScale(i)
      ctx.fillText(i + "%", x, margin.top + height + 5)
    }

    // Draw X-axis title
    ctx.fillText("Importance", margin.left + width / 2, margin.top + height + 20)

    // Draw bars
    features.forEach((feature, i) => {
      const y = yScale(i)
      const barWidth = (feature.importance / 100) * width

      // Create gradient
      const gradient = ctx.createLinearGradient(margin.left, 0, margin.left + width, 0)
      gradient.addColorStop(0, "#9333ea") // Purple-600
      gradient.addColorStop(1, "#7e22ce") // Purple-700

      ctx.fillStyle = gradient
      ctx.fillRect(margin.left, y, barWidth, barHeight)

      // Add feature name
      ctx.fillStyle = "#9ca3af" // Gray-400
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillText(feature.name, margin.left - 5, y + barHeight / 2)

      // Add importance value
      ctx.fillStyle = "#fff"
      ctx.textAlign = "left"
      ctx.fillText(feature.importance + "%", margin.left + barWidth + 5, y + barHeight / 2)
    })
  }, [predictions])

  return <canvas ref={canvasRef} width={600} height={200} className="w-full" />
}
