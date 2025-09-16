import { type NextRequest, NextResponse } from "next/server"
import type { AssetData, HistoricalDataPoint, AnalysisResult } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    console.log(`[v0] Fetching data for symbol: ${symbol}`)

    // Generate realistic mock data for demonstration
    const mockData = generateMockData(symbol)

    console.log(`[v0] Generated mock data for ${symbol}:`, {
      currentPrice: mockData.currentPrice,
      change: mockData.change,
      volume: mockData.volume,
      historicalDataPoints: mockData.historicalData.length,
    })

    return NextResponse.json(mockData)
  } catch (error) {
    console.error(`[v0] Error in yahoo-finance API:`, error)
    return NextResponse.json({ error: "Failed to fetch asset data" }, { status: 500 })
  }
}

function generateMockData(symbol: string): AssetData {
  // Generate realistic base price based on symbol
  const basePrice = getBasePriceForSymbol(symbol)

  // Generate historical data (30 days)
  const historicalData: HistoricalDataPoint[] = []
  let currentPrice = basePrice

  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // Simulate price movement with some volatility
    const volatility = 0.02 + Math.random() * 0.03 // 2-5% daily volatility
    const change = (Math.random() - 0.5) * volatility
    currentPrice = currentPrice * (1 + change)

    const open = currentPrice * (0.98 + Math.random() * 0.04)
    const high = Math.max(open, currentPrice) * (1 + Math.random() * 0.02)
    const low = Math.min(open, currentPrice) * (0.98 + Math.random() * 0.02)
    const volume = Math.floor(1000000 + Math.random() * 10000000)

    historicalData.push({
      date: date.toISOString().split("T")[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(currentPrice.toFixed(2)),
      volume,
    })
  }

  // Calculate analysis metrics
  const prices = historicalData.map((d) => d.close)
  const volatility = calculateVolatility(prices)
  const change = ((currentPrice - historicalData[0].close) / historicalData[0].close) * 100

  // Generate analysis
  const analysis: AnalysisResult = {
    riskLevel: volatility > 25 ? "High" : volatility > 15 ? "Medium" : "Low",
    volatility,
    recommendation: change > 5 ? "Buy" : change < -5 ? "Sell" : "Hold",
    confidence: 70 + Math.random() * 25, // 70-95% confidence
    technicalIndicators: {
      rsi: 30 + Math.random() * 40, // 30-70 RSI
      macd: (Math.random() - 0.5) * 2,
      sma20: prices.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, prices.length),
      sma50: prices.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, prices.length),
    },
  }

  return {
    symbol,
    currentPrice: Number(currentPrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    volume: Math.floor(5000000 + Math.random() * 20000000),
    marketCap: Math.floor(currentPrice * (100000000 + Math.random() * 900000000)),
    historicalData,
    analysis,
  }
}

function getBasePriceForSymbol(symbol: string): number {
  // Generate consistent base prices for common symbols
  const symbolPrices: { [key: string]: number } = {
    AAPL: 175,
    GOOGL: 140,
    MSFT: 380,
    AMZN: 145,
    TSLA: 240,
    META: 320,
    NVDA: 450,
    NFLX: 420,
    AMD: 110,
    INTC: 45,
  }

  return symbolPrices[symbol] || 50 + Math.random() * 200
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0

  const returns = []
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length

  return Math.sqrt(variance) * Math.sqrt(252) * 100 // Annualized volatility as percentage
}
