import type { Asset, AnalyzedAsset } from "./types"

// Fetch data from our API endpoint with better error handling
export async function fetchAssetData(symbols: string[], timeframe: "weekly" | "monthly"): Promise<Asset[]> {
  try {
    console.log(`Fetching data for ${symbols.length} symbols with timeframe ${timeframe}`)

    const response = await fetch("/api/yahoo-finance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbols, timeframe }),
      cache: "no-store",
    })

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`

      try {
        const errorData = await response.json()
        console.error("API error details:", errorData)
        if (errorData && errorData.error) {
          errorMessage = `API error: ${errorData.error}`
        }
      } catch (e) {
        console.error("Failed to parse error response:", e)
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log(`Received data for ${data.length} symbols`)

    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received from API")
    }

    return data
  } catch (error) {
    console.error("Error fetching data:", error)
    throw new Error(`Failed to fetch financial data: ${error.message}`)
  }
}

// Calculate EMA (Exponential Moving Average) with improved accuracy
function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) {
    console.warn(`Not enough data points for EMA calculation. Need ${period}, got ${prices.length}`)
    return [prices[prices.length - 1]] // Return last price if not enough data
  }

  const ema = []
  const multiplier = 2 / (period + 1)

  // Start with SMA for the first EMA value
  const sma = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period
  ema.push(sma)

  // Calculate EMA for the rest of the prices
  for (let i = period; i < prices.length; i++) {
    const currentEMA = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]
    ema.push(currentEMA)
  }

  return ema
}

// Calculate RSI (Relative Strength Index) with improved accuracy
function calculateRSI(prices: number[], period = 14): number {
  if (prices.length <= period) {
    console.warn(`Not enough data points for RSI calculation. Need ${period + 1}, got ${prices.length}`)
    return 50 // Default value if not enough data
  }

  // Calculate price changes
  const changes = []
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1])
  }

  // Separate gains and losses
  const gains = changes.map((change) => (change > 0 ? change : 0))
  const losses = changes.map((change) => (change < 0 ? Math.abs(change) : 0))

  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period
  let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period

  // Calculate RSI using the smoothed method for the remaining periods
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
  }

  // Calculate RS and RSI
  if (avgLoss === 0) {
    return 100 // If no losses, RSI is 100
  }

  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

// Determine if there's a positive trendline using linear regression
function hasPositiveTrendline(prices: number[]): boolean {
  if (prices.length < 5) {
    console.warn(`Not enough data points for trendline calculation. Need at least 5, got ${prices.length}`)
    return false
  }

  // Simple linear regression to determine trend
  const n = prices.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += prices[i]
    sumXY += i * prices[i]
    sumXX += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  return slope > 0
}

export async function analyzeAssets(symbols: string[], timeframe: "weekly" | "monthly"): Promise<AnalyzedAsset[]> {
  const assets = await fetchAssetData(symbols, timeframe)

  return assets.map((asset) => {
    // Extract close prices from historical data
    const closePrices = asset.historicalData.map((d) => d.close)

    console.log(`Analyzing ${asset.symbol}: ${closePrices.length} data points available`)

    // Handle cases with insufficient data
    if (closePrices.length < 14) {
      console.warn(`Insufficient data for ${asset.symbol}: only ${closePrices.length} data points`)
      return {
        symbol: asset.symbol,
        price: asset.price,
        hasTrendline: false,
        isAboveEMA60: false,
        rsi: 50,
        ema60: asset.price,
      }
    }

    // Calculate EMA with available data
    // For EMA60, we need at least 60 data points, otherwise use a shorter period
    const emaPeriod = Math.min(60, Math.floor(closePrices.length / 2))
    const ema60Values = calculateEMA(closePrices, emaPeriod)
    const currentEMA60 = ema60Values[ema60Values.length - 1]

    // Calculate RSI with available data
    const rsiPeriod = Math.min(14, Math.floor(closePrices.length / 3))
    const rsiValue = calculateRSI(closePrices, rsiPeriod)

    // Determine if price is above EMA
    const isAboveEMA = asset.price > currentEMA60

    // Determine if there's a positive trendline
    const hasTrendline = hasPositiveTrendline(closePrices)

    console.log(`${asset.symbol} analysis results:`, {
      price: asset.price,
      ema60: currentEMA60,
      isAboveEMA: isAboveEMA,
      rsi: rsiValue,
      hasTrendline,
    })

    return {
      symbol: asset.symbol,
      price: asset.price,
      hasTrendline,
      isAboveEMA60: isAboveEMA,
      rsi: rsiValue,
      ema60: currentEMA60,
    }
  })
}
