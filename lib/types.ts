export interface Asset {
  symbol: string
  price: number
  historicalData: {
    date: Date
    open: number
    high: number
    close: number
    low: number
    volume: number
  }[]
}

export interface AnalyzedAsset {
  symbol: string
  price: number
  hasTrendline: boolean
  isAboveEMA60: boolean
  rsi: number
  ema60: number
}
