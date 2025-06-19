"use client"

import { useEffect, useRef } from "react"

export default function WeatherImpactChart({ predictions }) {
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
      { factor: "Swing", innings1: 0.7, innings2: 0.5 },
      { factor: "Bounce", innings1: 0.6, innings2: 0.4 },
      { factor: "Spin", innings1: 0.5, innings2: 0.7 },
      { factor: "Dew", innings1: 0.1, innings2: 0.8 },
    ]

    // Define scales
    const barWidth = (width / data.length / 2) * 0.8
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

    // Draw Y-axis labels
    ctx.fillStyle = "#9ca3af" // Gray-400
    ctx.font = "10px Arial"
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
    ctx.fillText("Impact", 0, 0)
    ctx.restore()

    // Draw bars
    data.forEach((d, i) => {
      const x = xScale(i)

      // 1st innings bar
      const innings1Y = yScale(d.innings1)
      const innings1Height = margin.top + height - innings1Y
      ctx.fillStyle = "#9333ea" // Purple-600
      ctx.fillRect(x - barWidth * 0.6, innings1Y, barWidth, innings1Height)

      // 2nd innings bar
      const innings2Y = yScale(d.innings2)
      const innings2Height = margin.top + height - innings2Y
      ctx.fillStyle = "#2563eb" // Blue-600
      ctx.fillRect(x + barWidth * 0.6, innings2Y, barWidth, innings2Height)

      // Add factor label
      ctx.fillStyle = "#9ca3af" // Gray-400
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(d.factor, x, margin.top + height + 5)
    })

    // Add impact values on top of bars
    ctx.textAlign = "center"
    ctx.textBaseline = "bottom"

    data.forEach((d, i) => {
      const x = xScale(i)

      // 1st innings value
      ctx.fillStyle = "#fff"
      ctx.fillText((d.innings1 * 100).toFixed(0) + "%", x - barWidth * 0.6 + barWidth / 2, yScale(d.innings1) - 2)

      // 2nd innings value
      ctx.fillStyle = "#fff"
      ctx.fillText((d.innings2 * 100).toFixed(0) + "%", x + barWidth * 0.6 + barWidth / 2, yScale(d.innings2) - 2)
    })

    // Add legend
    const legendY = margin.top

    // 1st innings
    ctx.fillStyle = "#9333ea" // Purple-600
    ctx.fillRect(margin.left, legendY, 12, 12)
    ctx.fillStyle = "#9ca3af" // Gray-400
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillText("1st Innings", margin.left + 15, legendY + 6)

    // 2nd innings
    ctx.fillStyle = "#2563eb" // Blue-600
    ctx.fillRect(margin.left + 100, legendY, 12, 12)
    ctx.fillStyle = "#9ca3af" // Gray-400
    ctx.fillText("2nd Innings", margin.left + 115, legendY + 6)
  }, [predictions])

  return <canvas ref={canvasRef} width={400} height={200} className="w-full" />
}
