import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { symbols, timeframe } = await request.json()

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({ error: "Invalid symbols provided" }, { status: 400 })
    }

    // Limit the number of symbols to process
    const limitedSymbols = symbols.slice(0, 5)

    console.log("[v0] Generating mock financial data for symbols:", limitedSymbols)

    const results = limitedSymbols.map((symbol) => {
      // Generate realistic mock data
      const basePrice = Math.random() * 200 + 50 // Price between $50-$250
      const yearsOfData = timeframe === "weekly" ? 2 : 5
      const dataPoints = timeframe === "weekly" ? 104 : 60 // 2 years weekly or 5 years monthly

      const historicalData = []
      const startDate = new Date()
      startDate.setFullYear(startDate.getFullYear() - yearsOfData)

      let currentPrice = basePrice * 0.8 // Start 20% lower than current

      for (let i = 0; i < dataPoints; i++) {
        const date = new Date(startDate)
        if (timeframe === "weekly") {
          date.setDate(date.getDate() + i * 7)
        } else {
          date.setMonth(date.getMonth() + i)
        }

        // Simulate price movement with some volatility
        const volatility = (Math.random() - 0.5) * 0.1 // ±5% volatility
        currentPrice = currentPrice * (1 + volatility)

        const open = currentPrice * (0.98 + Math.random() * 0.04) // ±2% from current
        const close = currentPrice * (0.98 + Math.random() * 0.04)
        const high = Math.max(open, close) * (1 + Math.random() * 0.03) // Up to 3% higher
        const low = Math.min(open, close) * (1 - Math.random() * 0.03) // Up to 3% lower
        const volume = Math.floor(Math.random() * 10000000) + 1000000 // 1M-11M volume

        historicalData.push({
          date,
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          close: Number(close.toFixed(2)),
          low: Number(low.toFixed(2)),
          volume,
        })

        currentPrice = close
      }

      console.log(`[v0] Generated ${historicalData.length} data points for ${symbol}`)

      return {
        symbol,
        price: Number(currentPrice.toFixed(2)),
        historicalData: historicalData.sort((a, b) => a.date.getTime() - b.date.getTime()),
      }
    })

    console.log("[v0] Successfully generated mock data for all symbols")
    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Error processing request:", error)
    return NextResponse.json({ error: "Failed to process request", details: error.message }, { status: 500 })
  }
}
