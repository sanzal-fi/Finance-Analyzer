export interface AssetData {
  symbol: string
  currentPrice: number
  change: number
  volume: number
  marketCap: number
  historicalData: HistoricalDataPoint[]
  analysis: AnalysisResult
}

export interface HistoricalDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface AnalysisResult {
  riskLevel: "Low" | "Medium" | "High"
  volatility: number
  recommendation: "Buy" | "Hold" | "Sell"
  confidence: number
  technicalIndicators: {
    rsi: number
    macd: number
    sma20: number
    sma50: number
  }
}
