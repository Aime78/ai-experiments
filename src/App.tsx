import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  Header,
  Footer,
  ImageRun,
  ShadingType,
  TableLayoutType,
  PageNumber,
  NumberFormat,
  convertInchesToTwip,
} from "docx"
import { saveAs } from "file-saver"

// ── Helper: create a simple bar chart as a PNG data URL via canvas ──
function createBarChartPng(
  labels: string[],
  values: number[],
  title: string,
  width = 560,
  height = 300,
): string {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!

  // Background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  // Title
  ctx.fillStyle = "#1a1a2e"
  ctx.font = "bold 14px Arial"
  ctx.textAlign = "center"
  ctx.fillText(title, width / 2, 24)

  const padding = { top: 40, right: 30, bottom: 50, left: 60 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const maxVal = Math.max(...values) * 1.15

  // Grid lines
  ctx.strokeStyle = "#e0e0e0"
  ctx.lineWidth = 0.5
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartH / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()

    ctx.fillStyle = "#666"
    ctx.font = "11px Arial"
    ctx.textAlign = "right"
    const val = Math.round(maxVal - (maxVal / 5) * i)
    ctx.fillText(val.toLocaleString(), padding.left - 8, y + 4)
  }

  // Bars
  const barWidth = chartW / labels.length - 12
  const colors = ["#0d47a1", "#1565c0", "#1976d2", "#1e88e5", "#2196f3", "#42a5f5"]
  labels.forEach((label, i) => {
    const barH = (values[i] / maxVal) * chartH
    const x = padding.left + i * (chartW / labels.length) + 6
    const y = padding.top + chartH - barH

    ctx.fillStyle = colors[i % colors.length]
    ctx.fillRect(x, y, barWidth, barH)

    // Label
    ctx.fillStyle = "#333"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(label, x + barWidth / 2, height - padding.bottom + 16)

    // Value on bar
    ctx.fillStyle = "#1a1a2e"
    ctx.font = "bold 10px Arial"
    ctx.fillText(values[i].toLocaleString(), x + barWidth / 2, y - 6)
  })

  return canvas.toDataURL("image/png")
}

function createPieChartPng(
  labels: string[],
  values: number[],
  title: string,
  width = 480,
  height = 300,
): string {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#1a1a2e"
  ctx.font = "bold 14px Arial"
  ctx.textAlign = "center"
  ctx.fillText(title, width / 2, 24)

  const total = values.reduce((a, b) => a + b, 0)
  const cx = width / 2 - 60
  const cy = height / 2 + 10
  const r = 100
  const colors = ["#0d47a1", "#1565c0", "#2196f3", "#42a5f5", "#90caf9", "#bbdefb"]

  let startAngle = -Math.PI / 2
  values.forEach((val, i) => {
    const sliceAngle = (val / total) * 2 * Math.PI
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = colors[i % colors.length]
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()
    startAngle += sliceAngle
  })

  // Legend
  const legendX = cx + r + 40
  labels.forEach((label, i) => {
    const y = 50 + i * 24
    ctx.fillStyle = colors[i % colors.length]
    ctx.fillRect(legendX, y, 14, 14)
    ctx.fillStyle = "#333"
    ctx.font = "11px Arial"
    ctx.textAlign = "left"
    const pct = ((values[i] / total) * 100).toFixed(1)
    ctx.fillText(`${label} (${pct}%)`, legendX + 20, y + 12)
  })

  return canvas.toDataURL("image/png")
}

// ── Helper: Line chart ──
function createLineChartPng(
  labels: string[],
  datasets: { name: string; values: number[]; color: string }[],
  title: string,
  width = 560,
  height = 300,
): string {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#1a1a2e"
  ctx.font = "bold 14px Arial"
  ctx.textAlign = "center"
  ctx.fillText(title, width / 2, 24)

  const padding = { top: 40, right: 30, bottom: 55, left: 65 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const allVals = datasets.flatMap((d) => d.values)
  const maxVal = Math.max(...allVals) * 1.15
  const minVal = Math.min(0, Math.min(...allVals))

  // Grid lines & Y-axis labels
  ctx.strokeStyle = "#e0e0e0"
  ctx.lineWidth = 0.5
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartH / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
    ctx.fillStyle = "#666"
    ctx.font = "11px Arial"
    ctx.textAlign = "right"
    const val = Math.round(maxVal - ((maxVal - minVal) / 5) * i)
    ctx.fillText(val.toLocaleString(), padding.left - 8, y + 4)
  }

  // X-axis labels
  labels.forEach((label, i) => {
    const x = padding.left + (i / (labels.length - 1)) * chartW
    ctx.fillStyle = "#333"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(label, x, height - padding.bottom + 18)
  })

  // Draw lines
  datasets.forEach((ds) => {
    ctx.beginPath()
    ctx.strokeStyle = ds.color
    ctx.lineWidth = 2.5
    ctx.lineJoin = "round"
    ds.values.forEach((val, i) => {
      const x = padding.left + (i / (labels.length - 1)) * chartW
      const y = padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Data points
    ds.values.forEach((val, i) => {
      const x = padding.left + (i / (labels.length - 1)) * chartW
      const y = padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = ds.color
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 1.5
      ctx.stroke()
    })
  })

  // Legend
  const legendY = height - 14
  let legendX = padding.left
  datasets.forEach((ds) => {
    ctx.fillStyle = ds.color
    ctx.fillRect(legendX, legendY - 8, 12, 12)
    ctx.fillStyle = "#333"
    ctx.font = "10px Arial"
    ctx.textAlign = "left"
    ctx.fillText(ds.name, legendX + 16, legendY + 2)
    legendX += ctx.measureText(ds.name).width + 36
  })

  return canvas.toDataURL("image/png")
}

// ── Helper: Horizontal bar chart ──
function createHorizontalBarChartPng(
  labels: string[],
  values: number[],
  title: string,
  unit = "",
  width = 560,
  height = 300,
): string {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#1a1a2e"
  ctx.font = "bold 14px Arial"
  ctx.textAlign = "center"
  ctx.fillText(title, width / 2, 24)

  const padding = { top: 40, right: 50, bottom: 30, left: 120 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const maxVal = Math.max(...values) * 1.15
  const barHeight = chartH / labels.length - 8
  const colors = ["#0d47a1", "#1565c0", "#1976d2", "#1e88e5", "#2196f3", "#42a5f5", "#64b5f6", "#90caf9"]

  // Grid lines
  ctx.strokeStyle = "#e8e8e8"
  ctx.lineWidth = 0.5
  for (let i = 0; i <= 5; i++) {
    const x = padding.left + (chartW / 5) * i
    ctx.beginPath()
    ctx.moveTo(x, padding.top)
    ctx.lineTo(x, height - padding.bottom)
    ctx.stroke()
    ctx.fillStyle = "#666"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(Math.round((maxVal / 5) * i).toLocaleString() + unit, x, height - padding.bottom + 16)
  }

  labels.forEach((label, i) => {
    const barW = (values[i] / maxVal) * chartW
    const y = padding.top + i * (chartH / labels.length) + 4

    // Bar with rounded right end
    ctx.fillStyle = colors[i % colors.length]
    ctx.beginPath()
    ctx.roundRect(padding.left, y, barW, barHeight, [0, 6, 6, 0])
    ctx.fill()

    // Label
    ctx.fillStyle = "#333"
    ctx.font = "11px Arial"
    ctx.textAlign = "right"
    ctx.fillText(label, padding.left - 8, y + barHeight / 2 + 4)

    // Value
    ctx.fillStyle = "#1a1a2e"
    ctx.font = "bold 10px Arial"
    ctx.textAlign = "left"
    ctx.fillText(values[i].toLocaleString() + unit, padding.left + barW + 6, y + barHeight / 2 + 4)
  })

  return canvas.toDataURL("image/png")
}

// ── Helper: Doughnut chart ──
function createDoughnutChartPng(
  labels: string[],
  values: number[],
  title: string,
  centerLabel: string,
  width = 480,
  height = 300,
): string {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#1a1a2e"
  ctx.font = "bold 14px Arial"
  ctx.textAlign = "center"
  ctx.fillText(title, width / 2, 24)

  const total = values.reduce((a, b) => a + b, 0)
  const cx = width / 2 - 70
  const cy = height / 2 + 10
  const outerR = 95
  const innerR = 55
  const colors = ["#0d47a1", "#1565c0", "#1976d2", "#42a5f5", "#90caf9", "#bbdefb", "#e3f2fd"]

  let startAngle = -Math.PI / 2
  values.forEach((val, i) => {
    const sliceAngle = (val / total) * 2 * Math.PI
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle)
    ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true)
    ctx.closePath()
    ctx.fillStyle = colors[i % colors.length]
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()
    startAngle += sliceAngle
  })

  // Center text
  ctx.fillStyle = "#1a1a2e"
  ctx.font = "bold 16px Arial"
  ctx.textAlign = "center"
  ctx.fillText(centerLabel, cx, cy + 6)

  // Legend
  const legendX = cx + outerR + 40
  labels.forEach((label, i) => {
    const y = 50 + i * 22
    ctx.fillStyle = colors[i % colors.length]
    ctx.fillRect(legendX, y, 12, 12)
    ctx.fillStyle = "#333"
    ctx.font = "11px Arial"
    ctx.textAlign = "left"
    const pct = ((values[i] / total) * 100).toFixed(1)
    ctx.fillText(`${label} (${pct}%)`, legendX + 18, y + 11)
  })

  return canvas.toDataURL("image/png")
}

// ── Helper: Area chart ──
function createAreaChartPng(
  labels: string[],
  values: number[],
  title: string,
  color = "#1976d2",
  width = 560,
  height = 300,
): string {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#1a1a2e"
  ctx.font = "bold 14px Arial"
  ctx.textAlign = "center"
  ctx.fillText(title, width / 2, 24)

  const padding = { top: 40, right: 30, bottom: 50, left: 65 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const maxVal = Math.max(...values) * 1.15

  // Grid + Y-axis
  ctx.strokeStyle = "#e0e0e0"
  ctx.lineWidth = 0.5
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartH / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
    ctx.fillStyle = "#666"
    ctx.font = "11px Arial"
    ctx.textAlign = "right"
    ctx.fillText(Math.round(maxVal - (maxVal / 5) * i).toLocaleString(), padding.left - 8, y + 4)
  }

  // Area fill
  const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH)
  gradient.addColorStop(0, color + "55")
  gradient.addColorStop(1, color + "08")

  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top + chartH)
  values.forEach((val, i) => {
    const x = padding.left + (i / (labels.length - 1)) * chartW
    const y = padding.top + chartH - (val / maxVal) * chartH
    ctx.lineTo(x, y)
  })
  ctx.lineTo(padding.left + chartW, padding.top + chartH)
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  // Line
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  values.forEach((val, i) => {
    const x = padding.left + (i / (labels.length - 1)) * chartW
    const y = padding.top + chartH - (val / maxVal) * chartH
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  // Points + values
  values.forEach((val, i) => {
    const x = padding.left + (i / (labels.length - 1)) * chartW
    const y = padding.top + chartH - (val / maxVal) * chartH
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = "#1a1a2e"
    ctx.font = "bold 9px Arial"
    ctx.textAlign = "center"
    ctx.fillText(val.toLocaleString(), x, y - 10)
  })

  // X-axis labels
  labels.forEach((label, i) => {
    const x = padding.left + (i / (labels.length - 1)) * chartW
    ctx.fillStyle = "#333"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(label, x, height - padding.bottom + 18)
  })

  return canvas.toDataURL("image/png")
}

// ── Helper: Grouped bar chart ──
function createGroupedBarChartPng(
  labels: string[],
  datasets: { name: string; values: number[]; color: string }[],
  title: string,
  width = 560,
  height = 320,
): string {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#1a1a2e"
  ctx.font = "bold 14px Arial"
  ctx.textAlign = "center"
  ctx.fillText(title, width / 2, 24)

  const padding = { top: 40, right: 30, bottom: 60, left: 60 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const allVals = datasets.flatMap((d) => d.values)
  const maxVal = Math.max(...allVals) * 1.15
  const groupCount = labels.length
  const barCount = datasets.length
  const groupWidth = chartW / groupCount
  const barWidth = (groupWidth - 16) / barCount

  // Grid
  ctx.strokeStyle = "#e0e0e0"
  ctx.lineWidth = 0.5
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartH / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
    ctx.fillStyle = "#666"
    ctx.font = "11px Arial"
    ctx.textAlign = "right"
    ctx.fillText(Math.round(maxVal - (maxVal / 5) * i).toLocaleString(), padding.left - 8, y + 4)
  }

  // Bars
  labels.forEach((label, gi) => {
    datasets.forEach((ds, di) => {
      const barH = (ds.values[gi] / maxVal) * chartH
      const x = padding.left + gi * groupWidth + 8 + di * barWidth
      const y = padding.top + chartH - barH
      ctx.fillStyle = ds.color
      ctx.fillRect(x, y, barWidth - 2, barH)
    })
    // X label
    ctx.fillStyle = "#333"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(label, padding.left + gi * groupWidth + groupWidth / 2, height - padding.bottom + 18)
  })

  // Legend
  const legendY = height - 16
  let legendX = padding.left
  datasets.forEach((ds) => {
    ctx.fillStyle = ds.color
    ctx.fillRect(legendX, legendY - 8, 12, 12)
    ctx.fillStyle = "#333"
    ctx.font = "10px Arial"
    ctx.textAlign = "left"
    ctx.fillText(ds.name, legendX + 16, legendY + 2)
    legendX += ctx.measureText(ds.name).width + 36
  })

  return canvas.toDataURL("image/png")
}

function dataUrlToBuffer(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// ── Table helpers ──
const HEADER_SHADING = { type: ShadingType.SOLID, color: "0d47a1" } as const
const ALT_ROW_SHADING = { type: ShadingType.SOLID, color: "e3f2fd" } as const

function headerCell(text: string, widthPct?: number): TableCell {
  return new TableCell({
    shading: HEADER_SHADING,
    width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
    children: [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, color: "ffffff", size: 20, font: "Calibri" })],
      }),
    ],
  })
}

function dataCell(text: string, shaded = false): TableCell {
  return new TableCell({
    shading: shaded ? ALT_ROW_SHADING : undefined,
    children: [
      new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [new TextRun({ text, size: 20, font: "Calibri" })],
      }),
    ],
  })
}

// ── Build the document ──
async function generateCaseStudy() {
  // Generate charts
  const growthChart = createBarChartPng(
    ["2019", "2020", "2021", "2022", "2023", "2024"],
    [1200, 3400, 8500, 15200, 28000, 42000],
    "Client Growth Over Time (Number of Active Clients)",
  )

  const portfolioChart = createBarChartPng(
    ["Agri", "Retail", "Education", "Housing", "SME", "Emergency"],
    [35, 25, 15, 12, 8, 5],
    "Loan Portfolio Distribution by Sector (%)",
  )

  const impactPie = createPieChartPng(
    ["Repaid on time", "Early repayment", "Restructured", "Defaulted", "In progress"],
    [62, 18, 9, 3, 8],
    "Loan Repayment Outcomes (%)",
  )

  // New charts
  const revenueLineChart = createLineChartPng(
    ["Q1'23", "Q2'23", "Q3'23", "Q4'23", "Q1'24", "Q2'24", "Q3'24", "Q4'24"],
    [
      { name: "Disbursements ($K)", values: [320, 410, 480, 520, 610, 750, 880, 1020], color: "#0d47a1" },
      { name: "Collections ($K)", values: [280, 370, 440, 500, 580, 700, 830, 960], color: "#43a047" },
    ],
    "Quarterly Disbursements vs Collections (USD Thousands)",
  )

  const branchPerformanceChart = createHorizontalBarChartPng(
    ["Kampala HQ", "Jinja", "Mbale", "Gulu", "Mbarara", "Lira", "Fort Portal", "Soroti"],
    [8400, 6200, 5800, 4900, 4600, 3800, 3200, 2700],
    "Active Clients by Branch Office",
  )

  const costDoughnut = createDoughnutChartPng(
    ["Staff Salaries", "Technology", "Branch Operations", "Marketing", "Compliance", "Training"],
    [38, 22, 18, 10, 7, 5],
    "Operational Cost Breakdown (%)",
    "Total\n$1.18M",
  )

  const savingsAreaChart = createAreaChartPng(
    ["2020", "2021", "2022", "2023", "2024", "2025"],
    [180, 420, 890, 1650, 2800, 4200],
    "Total Client Savings Growth (USD Thousands)",
    "#2e7d32",
  )

  const loanTypeGroupedChart = createGroupedBarChartPng(
    ["Q1'24", "Q2'24", "Q3'24", "Q4'24"],
    [
      { name: "Agriculture", values: [280, 310, 350, 390], color: "#0d47a1" },
      { name: "Retail/Trade", values: [180, 210, 240, 280], color: "#1976d2" },
      { name: "Education", values: [90, 120, 150, 180], color: "#42a5f5" },
      { name: "Housing", values: [60, 80, 100, 130], color: "#90caf9" },
    ],
    "Loan Disbursements by Sector per Quarter (USD Thousands)",
  )

  const growthBuf = dataUrlToBuffer(growthChart)
  const portfolioBuf = dataUrlToBuffer(portfolioChart)
  const impactBuf = dataUrlToBuffer(impactPie)
  const revenueLineBuf = dataUrlToBuffer(revenueLineChart)
  const branchPerfBuf = dataUrlToBuffer(branchPerformanceChart)
  const costDoughnutBuf = dataUrlToBuffer(costDoughnut)
  const savingsAreaBuf = dataUrlToBuffer(savingsAreaChart)
  const loanTypeGroupedBuf = dataUrlToBuffer(loanTypeGroupedChart)

  const doc = new Document({
    creator: "Microfinance Solutions Ltd.",
    title: "Case Study: Microfinance Management System",
    description: "Investor & Stakeholder Report",
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
          paragraph: { spacing: { after: 120, line: 276 } },
        },
        heading1: {
          run: { font: "Calibri", size: 32, bold: true, color: "0d47a1" },
          paragraph: { spacing: { before: 360, after: 160 } },
        },
        heading2: {
          run: { font: "Calibri", size: 26, bold: true, color: "1565c0" },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
      },
    },
    sections: [
      // ═══════════════════════════════════════════
      // COVER PAGE
      // ═══════════════════════════════════════════
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.2),
              right: convertInchesToTwip(1.2),
            },
            pageNumbers: { start: 0 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "CONFIDENTIAL – For Authorized Distribution Only",
                    italics: true,
                    size: 16,
                    color: "999999",
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Spacer
          ...Array.from({ length: 6 }, () => new Paragraph({ text: "" })),
          // Blue accent line
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                color: "0d47a1",
                size: 24,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "CASE STUDY",
                bold: true,
                size: 52,
                color: "0d47a1",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "Microfinance Management System",
                bold: true,
                size: 36,
                color: "1a1a2e",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                color: "0d47a1",
                size: 24,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: "Investor & Stakeholder Report",
                italics: true,
                size: 26,
                color: "555555",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: "Prepared by: Microfinance Solutions Ltd.",
                size: 22,
                color: "333333",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: "Date: March 2026",
                size: 22,
                color: "333333",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Version 2.1 | Classification: Confidential",
                size: 18,
                color: "888888",
                font: "Calibri",
              }),
            ],
          }),
        ],
      },

      // ═══════════════════════════════════════════
      // CONTENT PAGES
      // ═══════════════════════════════════════════
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.2),
              right: convertInchesToTwip(1.2),
            },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Case Study: Microfinance Management System",
                    italics: true,
                    size: 16,
                    color: "0d47a1",
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Microfinance Solutions Ltd. | Confidential | Page ",
                    size: 16,
                    color: "888888",
                    font: "Calibri",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: "888888",
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ── TABLE OF CONTENTS ──
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Table of Contents", font: "Calibri" })] }),
          ...[
            "1. Executive Summary",
            "2. Background & Problem Statement",
            "3. Objectives",
            "4. Proposed Solution",
            "5. System Architecture & Methodology",
            "6. Implementation",
            "7. Results & Impact",
            "8. Challenges",
            "9. Lessons Learned",
            "10. Conclusion & Recommendations",
          ].map(
            (item) =>
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: item,
                    size: 22,
                    color: "1565c0",
                    font: "Calibri",
                  }),
                ],
              }),
          ),

          new Paragraph({ children: [new TextRun({ break: 1 })] }),

          // ── 1. EXECUTIVE SUMMARY ──
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "1. Executive Summary", font: "Calibri" })] }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This case study documents the design, development, and deployment of a comprehensive Microfinance Management System (MMS) built to transform the operational capabilities of microfinance institutions (MFIs) serving underbanked communities. The platform addresses critical inefficiencies in loan origination, client management, portfolio tracking, and regulatory reporting that have historically limited the growth and impact of micro-lending operations.",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Deployed across 12 branch offices and serving over 42,000 active clients, the MMS has delivered measurable improvements: loan processing time reduced by 68%, operational costs lowered by 41%, portfolio-at-risk decreased from 8.2% to 3.1%, and client satisfaction scores increased by 54%. The system processes an average of 2,800 transactions daily with 99.7% uptime, demonstrating enterprise-grade reliability in resource-constrained environments.",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This report provides investors and stakeholders with a transparent account of the project's objectives, methodology, outcomes, challenges encountered, and strategic recommendations for scaling the solution to new markets.",
                font: "Calibri",
              }),
            ],
          }),

          // Key Metrics Summary Table
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "Key Performance Metrics at a Glance", font: "Calibri" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [headerCell("Metric", 40), headerCell("Before MMS", 30), headerCell("After MMS", 30)],
              }),
              ...([
                ["Loan Processing Time", "14 days", "4.5 days"],
                ["Operational Cost per Client", "$48/year", "$28/year"],
                ["Portfolio at Risk (>30 days)", "8.2%", "3.1%"],
                ["Active Clients Served", "8,500", "42,000"],
                ["Client Satisfaction Score", "3.1/5", "4.8/5"],
                ["Monthly Reports Generated", "Manual (3 days)", "Automated (<1 hr)"],
                ["System Uptime", "N/A", "99.7%"],
              ] as const).map(
                ([metric, before, after], i) =>
                  new TableRow({
                    children: [dataCell(metric, i % 2 === 0), dataCell(before, i % 2 === 0), dataCell(after, i % 2 === 0)],
                  }),
              ),
            ],
          }),

          // ── 2. BACKGROUND & PROBLEM ──
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "2. Background & Problem Statement", font: "Calibri" })] }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Microfinance institutions play a vital role in financial inclusion across Sub-Saharan Africa, South Asia, and Latin America. Despite serving over 140 million borrowers globally, many MFIs continue to rely on paper-based processes, fragmented spreadsheets, and legacy systems that cannot scale with demand. Our partner institution, operating in East Africa since 2011, experienced the following critical challenges:",
                font: "Calibri",
              }),
            ],
          }),
          ...[
            "Manual loan origination requiring physical paperwork across 12 branch offices, leading to a 14-day average turnaround and frequent data entry errors affecting 12% of applications.",
            "Fragmented client records stored in disconnected Excel spreadsheets with no centralized database, making cross-branch visibility impossible and creating duplicate accounts for ~8% of clients.",
            "Inability to generate real-time portfolio analytics, leaving management reliant on monthly manual reports that were typically 2–3 weeks outdated by the time of delivery.",
            "Regulatory compliance gaps resulting in two formal warnings from the national banking authority, threatening the institution's operating license.",
            "High staff turnover (32% annually) partly attributed to frustration with inefficient tools and repetitive manual processes.",
          ].map(
            (text) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [new TextRun({ text, font: "Calibri" })],
              }),
          ),
          new Paragraph({
            children: [
              new TextRun({
                text: "These systemic issues directly impacted the institution's ability to grow its loan portfolio, manage risk effectively, attract investment, and fulfill its social mission of poverty alleviation through financial access.",
                font: "Calibri",
              }),
            ],
          }),

          // ── 3. OBJECTIVES ──
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "3. Objectives", font: "Calibri" })] }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The project was guided by the following strategic and operational objectives, aligned with the institution's 5-year growth plan:",
                font: "Calibri",
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [headerCell("#", 8), headerCell("Objective", 52), headerCell("Success Criteria", 40)],
              }),
              ...([
                ["1", "Digitize end-to-end loan lifecycle", "100% paperless loan processing"],
                ["2", "Centralize client data management", "Single source of truth across all branches"],
                ["3", "Enable real-time portfolio monitoring", "Dashboard updated within 5 minutes of transaction"],
                ["4", "Automate regulatory reporting", "Reports generated in <1 hour, zero compliance gaps"],
                ["5", "Reduce operational costs by ≥35%", "Cost per client reduced to ≤$30/year"],
                ["6", "Improve client experience", "Satisfaction score ≥4.5/5"],
                ["7", "Support offline-first operation", "Full functionality without internet for ≥48 hours"],
              ] as const).map(
                ([num, obj, criteria], i) =>
                  new TableRow({
                    children: [dataCell(num, i % 2 === 0), dataCell(obj, i % 2 === 0), dataCell(criteria, i % 2 === 0)],
                  }),
              ),
            ],
          }),

          // ── 4. PROPOSED SOLUTION ──
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "4. Proposed Solution", font: "Calibri" })] }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The Microfinance Management System (MMS) was designed as a cloud-native, modular platform with offline-first capabilities tailored for environments with unreliable internet connectivity. The solution comprises six integrated modules:",
                font: "Calibri",
              }),
            ],
          }),
          ...[
            "Client Enrollment & KYC Module – Digital onboarding with biometric verification (fingerprint + facial recognition), automated ID validation via national registry APIs, and risk profiling based on socioeconomic data.",
            "Loan Origination & Management – End-to-end loan lifecycle from application through disbursement, repayment tracking, and closure. Includes configurable loan products, automated credit scoring, and group lending workflows.",
            "Savings & Deposits Module – Manages voluntary and compulsory savings accounts, fixed deposits, and interest calculations with support for multiple currencies and flexible withdrawal policies.",
            "Accounting & Financial Management – Double-entry bookkeeping engine with automated journal entries, chart of accounts management, trial balance, and financial statement generation compliant with IFRS for SMEs.",
            "Reporting & Analytics Dashboard – Real-time portfolio analytics, PAR aging reports, disbursement trends, collection efficiency metrics, and customizable KPI dashboards for management and board-level reporting.",
            "Regulatory Compliance Engine – Automated generation of central bank reports, anti-money laundering (AML) screening, suspicious transaction monitoring, and audit trail management.",
          ].map(
            (text) =>
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 80 },
                children: [new TextRun({ text, font: "Calibri" })],
              }),
          ),

          // ── 5. SYSTEM ARCHITECTURE ──
          new Paragraph({
            children: [new TextRun({ break: 1 })],
          }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "5. System Architecture & Methodology", font: "Calibri" })] }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "5.1 Technical Architecture", font: "Calibri" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [headerCell("Layer", 25), headerCell("Technology", 35), headerCell("Purpose", 40)],
              }),
              ...([
                ["Frontend", "React.js + TypeScript", "Responsive web & mobile-optimized progressive web app (PWA)"],
                ["Mobile", "React Native", "Offline-capable mobile app for field officers"],
                ["API Gateway", "Kong / NGINX", "Rate limiting, authentication, request routing"],
                ["Backend", "Node.js + Express / NestJS", "RESTful & GraphQL APIs, business logic"],
                ["Database", "PostgreSQL + Redis", "Primary relational store + caching layer"],
                ["Offline Sync", "PouchDB ↔ CouchDB", "Bidirectional sync with conflict resolution"],
                ["Message Queue", "RabbitMQ", "Async processing for reports, notifications, AML checks"],
                ["Infrastructure", "AWS (ECS, RDS, S3)", "Cloud hosting with multi-AZ redundancy"],
                ["Monitoring", "Prometheus + Grafana", "Real-time system health and performance monitoring"],
                ["CI/CD", "GitHub Actions + ArgoCD", "Automated testing, build, and deployment pipeline"],
              ] as const).map(
                ([layer, tech, purpose], i) =>
                  new TableRow({
                    children: [dataCell(layer, i % 2 === 0), dataCell(tech, i % 2 === 0), dataCell(purpose, i % 2 === 0)],
                  }),
              ),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "5.2 Architecture Diagram", font: "Calibri" })],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "The system follows a microservices architecture with the following high-level data flow:",
                font: "Calibri",
              }),
            ],
          }),

          // Text-based architecture diagram
          ...[
            "┌─────────────────────────────────────────────────────────────────────┐",
            "│                        CLIENT LAYER                                │",
            "│   ┌──────────────┐   ┌──────────────┐   ┌───────────────┐         │",
            "│   │  Web App      │   │  Mobile App   │   │  Admin Portal  │        │",
            "│   │  (React PWA)  │   │ (React Native)│   │  (React)       │        │",
            "│   └──────┬───────┘   └──────┬────────┘   └──────┬────────┘         │",
            "└──────────┼──────────────────┼───────────────────┼──────────────────┘",
            "           └──────────────────┼───────────────────┘                   ",
            "                              ▼                                       ",
            "┌─────────────────────────────────────────────────────────────────────┐",
            "│              API GATEWAY (Kong / NGINX)                             │",
            "│         Auth · Rate Limiting · Load Balancing · SSL                 │",
            "└─────────────────────────┬───────────────────────────────────────────┘",
            "                          ▼                                            ",
            "┌─────────────────────────────────────────────────────────────────────┐",
            "│                     MICROSERVICES LAYER                             │",
            "│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌────────────┐           │",
            "│  │ Client   │ │ Loan      │ │ Savings  │ │ Reporting  │           │",
            "│  │ Service  │ │ Service   │ │ Service  │ │ Service    │           │",
            "│  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └─────┬──────┘          │",
            "│       └─────────────┼────────────┼─────────────┘                  │",
            "└─────────────────────┼────────────┼─────────────────────────────────┘",
            "                      ▼            ▼                                  ",
            "┌──────────────────────────────────────────────────────────────────── ┐",
            "│                       DATA LAYER                                    │",
            "│   ┌────────────┐  ┌─────────┐  ┌───────────┐  ┌──────────────┐    │",
            "│   │ PostgreSQL │  │  Redis   │  │ CouchDB   │  │ RabbitMQ     │    │",
            "│   │ (Primary)  │  │ (Cache)  │  │ (Sync)    │  │ (Queue)      │    │",
            "│   └────────────┘  └─────────┘  └───────────┘  └──────────────┘    │",
            "└────────────────────────────────────────────────────────────────────┘",
          ].map(
            (line) =>
              new Paragraph({
                spacing: { after: 0, line: 220 },
                children: [
                  new TextRun({
                    text: line,
                    font: "Consolas",
                    size: 16,
                    color: "333333",
                  }),
                ],
              }),
          ),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "5.3 Development Methodology", font: "Calibri" })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The project followed an Agile Scrum methodology with 2-week sprints, complemented by DevOps practices for continuous integration and deployment. Key methodological elements included:",
                font: "Calibri",
              }),
            ],
          }),
          ...[
            "Stakeholder workshops conducted bi-weekly with branch managers, loan officers, and compliance staff to ensure alignment with field-level requirements.",
            "Test-driven development (TDD) with >85% code coverage across all modules, supplemented by integration and end-to-end testing.",
            "Incremental rollout strategy: pilot in 2 branches → regional expansion (6 branches) → full deployment (12 branches) over 9 months.",
            "User acceptance testing (UAT) at each phase with feedback loops informing subsequent sprint backlogs.",
          ].map(
            (text) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [new TextRun({ text, font: "Calibri" })],
              }),
          ),

          // ── 6. IMPLEMENTATION ──
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "6. Implementation", font: "Calibri" })] }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Implementation was executed in four distinct phases over 14 months, from initial discovery through full production deployment:",
                font: "Calibri",
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [
                  headerCell("Phase", 20),
                  headerCell("Duration", 15),
                  headerCell("Key Activities", 40),
                  headerCell("Deliverables", 25),
                ],
              }),
              ...([
                [
                  "Phase 1: Discovery & Design",
                  "Months 1–3",
                  "Stakeholder interviews, process mapping, requirements specification, UX research, architecture design",
                  "SRS document, wireframes, architecture blueprint",
                ],
                [
                  "Phase 2: Core Development",
                  "Months 4–8",
                  "Module development (Client, Loan, Savings, Accounting), API development, database design, offline sync engine",
                  "Functional modules, API documentation, test suites",
                ],
                [
                  "Phase 3: Pilot & Iteration",
                  "Months 9–11",
                  "Pilot deployment in 2 branches, UAT, performance optimization, bug fixes, training material creation",
                  "Pilot report, training manuals, v1.0 release",
                ],
                [
                  "Phase 4: Scale & Optimize",
                  "Months 12–14",
                  "Full rollout to 12 branches, data migration, staff training (180 users), monitoring setup, handover",
                  "Production system, ops runbooks, SLA documentation",
                ],
              ] as const).map(
                ([phase, dur, activities, deliverables], i) =>
                  new TableRow({
                    children: [
                      dataCell(phase, i % 2 === 0),
                      dataCell(dur, i % 2 === 0),
                      dataCell(activities, i % 2 === 0),
                      dataCell(deliverables, i % 2 === 0),
                    ],
                  }),
              ),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: "A dedicated change management program accompanied the technical deployment, including 40 hours of hands-on training per staff member, a network of 24 'digital champions' across branches, and a 3-month hypercare support period with on-site technical assistance.",
                font: "Calibri",
              }),
            ],
          }),

          // ── 7. RESULTS & IMPACT ──
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "7. Results & Impact", font: "Calibri" })] }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The MMS has been fully operational for 18 months. The following results reflect verified data from system analytics, independent audits, and client satisfaction surveys conducted quarterly:",
                font: "Calibri",
              }),
            ],
          }),

          // Chart 1 - Client Growth
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "7.1 Client Growth Trajectory", font: "Calibri" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new ImageRun({
                data: growthBuf,
                transformation: { width: 480, height: 260 },
                type: "png",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Client acquisition accelerated significantly post-deployment, growing from 8,500 active clients in early 2021 to 42,000 by end of 2024—a 394% increase. The digital onboarding process reduced enrollment time from 45 minutes to under 10 minutes, enabling field officers to register clients directly during community outreach events.",
                font: "Calibri",
              }),
            ],
          }),

          // Chart 2 - Portfolio Distribution
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "7.2 Loan Portfolio Distribution", font: "Calibri" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new ImageRun({
                data: portfolioBuf,
                transformation: { width: 480, height: 260 },
                type: "png",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Agriculture remains the dominant sector at 35% of the portfolio, reflecting the rural focus of operations. Notably, the education and housing segments have grown by 120% and 85% respectively since MMS deployment, driven by the system's ability to offer tailored loan products with flexible repayment schedules aligned to seasonal income patterns.",
                font: "Calibri",
              }),
            ],
          }),

          // Chart 3 - Repayment Outcomes
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "7.3 Repayment Outcomes", font: "Calibri" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new ImageRun({
                data: impactBuf,
                transformation: { width: 420, height: 260 },
                type: "png",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The automated credit scoring and proactive SMS reminder system contributed to 80% of loans being repaid on time or early, while the default rate fell to just 3%—well below the industry average of 5.7% for similar markets. The restructuring rate of 9% reflects the system's capacity for flexible loan modification when clients face genuine hardship.",
                font: "Calibri",
              }),
            ],
          }),

          // Financial Impact Table
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "7.4 Financial Impact Summary", font: "Calibri" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [headerCell("Indicator", 40), headerCell("Value", 30), headerCell("Change", 30)],
              }),
              ...([
                ["Total Loan Portfolio (outstanding)", "$12.8M", "+285% from baseline"],
                ["Average Loan Size", "$305", "+18% (enabling larger productive loans)"],
                ["Cost-to-Income Ratio", "52%", "Improved from 78%"],
                ["Return on Assets (ROA)", "3.8%", "Up from 1.2%"],
                ["Operational Self-Sufficiency", "138%", "Up from 96%"],
                ["Annual Savings (operational)", "$840,000", "Realized in Year 1"],
              ] as const).map(
                ([indicator, value, change], i) =>
                  new TableRow({
                    children: [dataCell(indicator, i % 2 === 0), dataCell(value, i % 2 === 0), dataCell(change, i % 2 === 0)],
                  }),
              ),
            ],
          }),

          // Chart 4 - Revenue Line Chart
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "7.5 Disbursements vs Collections Trend", font: "Calibri" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new ImageRun({
                data: revenueLineBuf,
                transformation: { width: 480, height: 260 },
                type: "png",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The trend line demonstrates consistent growth in both disbursement volumes and collection efficiency over the past two years. Collections have maintained a healthy ratio of 92–94% of disbursements, indicating strong portfolio quality. Q4 2024 marked a milestone with over $1M in quarterly disbursements for the first time, reflecting growing institutional capacity and market demand.",
                font: "Calibri",
              }),
            ],
          }),

          // Chart 5 - Branch Performance
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "7.6 Branch-Level Client Distribution", font: "Calibri" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new ImageRun({
                data: branchPerfBuf,
                transformation: { width: 480, height: 260 },
                type: "png",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Kampala HQ leads in client volume with 8,400 active accounts, while newer branches like Soroti and Fort Portal show strong growth potential. The MMS enabled real-time visibility into branch-level performance for the first time, allowing management to allocate resources strategically—branches with lower client counts received targeted marketing support, resulting in 35% faster growth in Q3–Q4 2024.",
                font: "Calibri",
              }),
            ],
          }),

          // Chart 6 - Cost Doughnut
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "7.7 Operational Cost Structure", font: "Calibri" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new ImageRun({
                data: costDoughnutBuf,
                transformation: { width: 420, height: 260 },
                type: "png",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Technology now represents 22% of total operational costs—an investment that has yielded a 3.2x return through automation of manual processes. Staff salaries remain the largest cost component at 38%, but per-employee productivity has doubled since deployment. The training allocation of 5% reflects the institution's ongoing commitment to digital upskilling, a key factor in the system's high adoption rates.",
                font: "Calibri",
              }),
            ],
          }),

          // Chart 7 - Savings Area Chart
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "7.8 Client Savings Growth", font: "Calibri" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new ImageRun({
                data: savingsAreaBuf,
                transformation: { width: 480, height: 260 },
                type: "png",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Total client savings have grown from $180K in 2020 to $4.2M in 2025—a 23x increase that underscores the platform's role in promoting financial inclusion beyond credit. The savings module's automated interest calculation, SMS balance notifications, and goal-tracking features have driven voluntary savings growth of 68% year-over-year, with 74% of borrowers now maintaining active savings accounts alongside their loan products.",
                font: "Calibri",
              }),
            ],
          }),

          // Chart 8 - Grouped Bar Chart
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "7.9 Sectoral Lending Trends", font: "Calibri" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new ImageRun({
                data: loanTypeGroupedBuf,
                transformation: { width: 480, height: 275 },
                type: "png",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Quarterly sector analysis reveals sustained growth across all four major lending categories. Agriculture lending grew 39% through the year as the MMS enabled seasonal loan products with harvest-aligned repayment schedules. The education sector showed the fastest growth rate at 100%, driven by the system's new school-fee loan product launched in Q1 2024. Housing loans also accelerated with the introduction of incremental building finance products tailored for low-income clients.",
                font: "Calibri",
              }),
            ],
          }),

          // ── 8. CHALLENGES ──
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "8. Challenges", font: "Calibri" })] }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Despite the project's overall success, several significant challenges were encountered during implementation:",
                font: "Calibri",
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [headerCell("Challenge", 30), headerCell("Impact", 35), headerCell("Mitigation", 35)],
              }),
              ...([
                [
                  "Internet Connectivity",
                  "Rural branches experienced frequent outages lasting 4–12 hours, disrupting real-time sync",
                  "Implemented robust offline-first architecture with PouchDB; conflict resolution engine handles 99.4% of sync conflicts automatically",
                ],
                [
                  "Data Migration",
                  "Legacy data (120,000+ records) had inconsistencies, duplicates, and missing fields across spreadsheets",
                  "Built custom ETL pipeline with fuzzy matching for deduplication; 3-week manual verification by data stewards",
                ],
                [
                  "Change Resistance",
                  "28% of staff initially resisted digital workflows, preferring familiar paper-based processes",
                  "Peer-led training program with digital champions; gamified adoption with monthly recognition; 94% adoption within 4 months",
                ],
                [
                  "Regulatory Changes",
                  "New central bank reporting requirements introduced mid-project, requiring additional compliance features",
                  "Modular architecture allowed rapid addition of new report templates without disrupting existing functionality",
                ],
                [
                  "Hardware Constraints",
                  "Some branches had outdated devices unable to run the full application efficiently",
                  "Optimized PWA with progressive enhancement; lightweight mode for low-spec devices; phased hardware refresh program",
                ],
              ] as const).map(
                ([challenge, impact, mitigation], i) =>
                  new TableRow({
                    children: [
                      dataCell(challenge, i % 2 === 0),
                      dataCell(impact, i % 2 === 0),
                      dataCell(mitigation, i % 2 === 0),
                    ],
                  }),
              ),
            ],
          }),

          // ── 9. LESSONS LEARNED ──
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "9. Lessons Learned", font: "Calibri" })] }),
          ...[
            {
              title: "Offline-First is Non-Negotiable: ",
              body: "In markets with unreliable infrastructure, offline capability is not a 'nice-to-have'—it is foundational. Designing for offline from day one, rather than retrofitting, saved approximately 3 months of development time and ensured consistent user experience regardless of connectivity.",
            },
            {
              title: "Change Management Equals Technical Investment: ",
              body: "We allocated 20% of the total budget to training and change management—matching our original technical development budget. This investment proved critical: branches with the most intensive training achieved 40% faster adoption and reported 60% fewer support tickets.",
            },
            {
              title: "Regulatory Agility Requires Modular Design: ",
              body: "Microfinance regulations evolve rapidly. Our decision to decouple the compliance engine from core business logic proved prescient when new reporting requirements emerged mid-project, enabling a 2-week turnaround versus what would have been a 3-month refactor.",
            },
            {
              title: "Field-Level Input Drives Adoption: ",
              body: "Features designed in collaboration with loan officers (such as the quick-disbursement workflow and group meeting attendance tracker) achieved 95%+ adoption within the first month, while features designed without field input averaged only 60% adoption.",
            },
            {
              title: "Data Quality is a Precondition, Not an Afterthought: ",
              body: "The most underestimated task was data cleansing. Future deployments should budget 15–20% of implementation time for data preparation, validation, and migration testing.",
            },
          ].map(
            ({ title, body }) =>
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 100 },
                children: [
                  new TextRun({ text: title, bold: true, font: "Calibri" }),
                  new TextRun({ text: body, font: "Calibri" }),
                ],
              }),
          ),

          // ── 10. CONCLUSION & RECOMMENDATIONS ──
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: "10. Conclusion & Recommendations", font: "Calibri" })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The Microfinance Management System has fundamentally transformed our partner institution's operational capacity, financial performance, and social impact. By replacing fragmented manual processes with an integrated digital platform, the institution has achieved a 394% increase in clients served, a 41% reduction in operational costs, and a significant improvement in portfolio quality—all while maintaining 99.7% system uptime.",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "More importantly, the system has amplified the institution's mission: over 42,000 individuals and small businesses now have access to financial services that were previously out of reach, contributing to measurable improvements in household income, educational enrollment, and small business creation in served communities.",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "Strategic Recommendations", font: "Calibri" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [headerCell("#", 8), headerCell("Recommendation", 45), headerCell("Expected Impact", 30), headerCell("Timeline", 17)],
              }),
              ...([
                ["1", "Scale to 3 additional countries in East Africa using the existing multi-tenant architecture", "150,000+ new clients; 3x revenue growth", "12–18 months"],
                ["2", "Integrate mobile money APIs (M-Pesa, MTN MoMo) for instant disbursement and repayment", "30% reduction in cash handling; improved client convenience", "3–6 months"],
                ["3", "Deploy AI-powered credit scoring using alternative data (mobile usage, utility payments)", "20% improvement in default prediction accuracy", "6–9 months"],
                ["4", "Launch a client-facing mobile app with self-service loan applications and savings tracking", "Reduce branch workload by 40%; improve client engagement", "6–12 months"],
                ["5", "Pursue ISO 27001 certification to strengthen data security posture for institutional investors", "Enhanced investor confidence; prerequisite for DFI funding", "9–12 months"],
              ] as const).map(
                ([num, rec, impact, timeline], i) =>
                  new TableRow({
                    children: [
                      dataCell(num, i % 2 === 0),
                      dataCell(rec, i % 2 === 0),
                      dataCell(impact, i % 2 === 0),
                      dataCell(timeline, i % 2 === 0),
                    ],
                  }),
              ),
            ],
          }),

          new Paragraph({ spacing: { before: 300 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                color: "0d47a1",
                size: 24,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "End of Report",
                bold: true,
                size: 22,
                color: "0d47a1",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: "For inquiries, contact: reports@microfinancesolutions.com",
                size: 18,
                color: "888888",
                font: "Calibri",
              }),
            ],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, "Microfinance_Management_System_Case_Study.docx")
}

// ── UI Component ──
export function App() {
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    setDone(false)
    try {
      await generateCaseStudy()
      setDone(true)
    } catch (err) {
      console.error("Failed to generate case study:", err)
      alert("Failed to generate document. Check console for details.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Microfinance Management System
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Case Study &mdash; Investor &amp; Stakeholder Report
          </p>
        </div>

        {/* Document info */}
        <div className="mb-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          <p className="mb-2 font-medium text-slate-700">Document includes:</p>
          <ul className="space-y-1 pl-4">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">&#9679;</span>
              Professional cover page with branding
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">&#9679;</span>
              10 comprehensive sections (Executive Summary through Recommendations)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">&#9679;</span>
              7 data tables with alternating row colors
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">&#9679;</span>
              8 charts (bar, line, area, doughnut &amp; grouped charts)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">&#9679;</span>
              System architecture diagram
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">&#9679;</span>
              Headers, footers &amp; page numbers
            </li>
          </ul>
        </div>

        {/* Button */}
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-blue-600 py-5 text-base font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating Document...
            </span>
          ) : (
            "Download Case Study (.docx)"
          )}
        </Button>

        {/* Success message */}
        {done && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm text-green-700">
            Document downloaded successfully! Open it in Microsoft Word.
          </div>
        )}

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-slate-400">
          Prepared by Microfinance Solutions Ltd. &bull; March 2026
        </p>
      </div>
    </div>
  )
}

export default App
