import type { AssetData, AnalysisResult } from "./types"

export async function analyzeAsset(symbol: string): Promise<AssetData> {
  try {
    const response = await fetch("/api/yahoo-finance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbol }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)
    throw error
  }
}

export function calculateTechnicalIndicators(historicalData: any[]): AnalysisResult["technicalIndicators"] {
  const closes = historicalData.map((d) => d.close)

  // Simple RSI calculation (simplified)
  const rsi = calculateRSI(closes)

  // Simple Moving Averages
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length)
  const sma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, closes.length)

  // Simplified MACD
  const macd = sma20 - sma50

  return {
    rsi,
    macd,
    sma20,
    sma50,
  }
}

function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50 // Default neutral RSI

  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1]
    if (change > 0) gains += change
    else losses -= change
  }

  const avgGain = gains / period
  const avgLoss = losses / period

  if (avgLoss === 0) return 100

  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}
