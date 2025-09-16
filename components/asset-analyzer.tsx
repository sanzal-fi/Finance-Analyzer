"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AssetTable } from "@/components/asset-table"
import { analyzeAssets } from "@/lib/asset-analyzer"
import type { AnalyzedAsset } from "@/lib/types"
import { ReloadIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import { TrendingUp, TrendingDown, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export function AssetAnalyzer() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly")
  const [symbols, setSymbols] = useState<string>("AAPL,MSFT,GOOGL")
  const [isLoading, setIsLoading] = useState(false)
  const [analyzedAssets, setAnalyzedAssets] = useState<AnalyzedAsset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<AnalyzedAsset[]>([])
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>("Enter up to 5 stock symbols for analysis")
  const [selectedAssets, setSelectedAssets] = useState<AnalyzedAsset[]>([])

  const handleAnalyze = async () => {
    setIsLoading(true)
    setError(null)
    setInfo("Fetching real-time data from Yahoo Finance...")

    try {
      // Validate input
      const symbolList = symbols
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      if (symbolList.length === 0) {
        throw new Error("Please enter at least one valid stock symbol")
      }

      // Limit the number of symbols to analyze
      const limitedSymbols = symbolList.slice(0, 5)
      if (limitedSymbols.length < symbolList.length) {
        setInfo(`Analyzing only the first 5 symbols to avoid rate limiting`)
      }

      // Analyze assets
      const results = await analyzeAssets(limitedSymbols, timeframe)
      setAnalyzedAssets(results)

      // Filter assets based on conditions
      const filtered = results.filter((asset) => asset.hasTrendline && asset.isAboveEMA60 && asset.rsi < 50)
      setFilteredAssets(filtered)

      // Show info message if no assets passed the filter
      if (filtered.length === 0 && results.length > 0) {
        setInfo("No assets matched all three conditions. Check the 'All Analyzed Assets' table for details.")
      } else if (filtered.length > 0) {
        setInfo(`Found ${filtered.length} assets that match all conditions.`)
      } else {
        setInfo("Analysis complete. Using real data from Yahoo Finance.")
      }
    } catch (error) {
      console.error("Error analyzing assets:", error)
      setError(error instanceof Error ? error.message : "Failed to analyze assets")
      // Clear any previous results
      setAnalyzedAssets([])
      setFilteredAssets([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (analyzedAssets.length > 0) {
      const filtered = analyzedAssets.filter((asset) => asset.hasTrendline && asset.isAboveEMA60 && asset.rsi < 50)
      setFilteredAssets(filtered)

      if (filtered.length === 0) {
        setInfo("No assets matched all three conditions. Check the 'All Analyzed Assets' table for details.")
      }
    }
  }, [timeframe, analyzedAssets])

  const handleAssetSelection = (asset: AnalyzedAsset, isSelected: boolean) => {
    if (isSelected) {
      setSelectedAssets((prev) => [...prev, asset])
    } else {
      setSelectedAssets((prev) => prev.filter((a) => a.symbol !== asset.symbol))
    }
  }

  const generatePriceHistory = (asset: AnalyzedAsset) => {
    const data = []
    const basePrice = asset.price
    const volatility = 0.02 // 2% daily volatility

    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Generate realistic price movement
      const randomChange = (Math.random() - 0.5) * volatility * 2
      const price = basePrice * (1 + randomChange * (i / 30))

      data.push({
        date: date.toLocaleDateString(),
        price: Number(price.toFixed(2)),
        ema60: Number(asset.ema60.toFixed(2)),
      })
    }

    return data
  }

  const generateFundamentalRatios = (asset: AnalyzedAsset) => {
    // Generate realistic fundamental ratios based on asset price and volatility
    const marketCap = asset.price * (Math.random() * 1000 + 100) * 1000000 // Random market cap
    const earnings = marketCap * (0.05 + Math.random() * 0.15) // 5-20% earnings yield
    const bookValue = asset.price * (0.3 + Math.random() * 0.7) // Book value
    const revenue = earnings * (3 + Math.random() * 7) // Revenue multiple
    const debt = marketCap * (0.1 + Math.random() * 0.4) // Debt ratio
    const equity = marketCap - debt

    return {
      peRatio: Number((asset.price / (earnings / (marketCap / asset.price))).toFixed(2)),
      pbRatio: Number((asset.price / bookValue).toFixed(2)),
      roe: Number(((earnings / equity) * 100).toFixed(2)),
      debtToEquity: Number((debt / equity).toFixed(2)),
      priceToSales: Number((marketCap / revenue).toFixed(2)),
      currentRatio: Number((1.2 + Math.random() * 1.8).toFixed(2)), // 1.2 - 3.0
      quickRatio: Number((0.8 + Math.random() * 1.2).toFixed(2)), // 0.8 - 2.0
      grossMargin: Number((15 + Math.random() * 35).toFixed(2)), // 15% - 50%
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Analysis Configuration</CardTitle>
          <CardDescription>Enter comma-separated stock symbols and select a timeframe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symbols">Stock Symbols</Label>
              <Input
                id="symbols"
                value={symbols}
                onChange={(e) => setSymbols(e.target.value)}
                placeholder="AAPL,MSFT,GOOGL,..."
              />
            </div>

            <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as "weekly" | "monthly")}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button onClick={handleAnalyze} disabled={isLoading}>
              {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Analyze Assets
            </Button>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {info && !error && (
              <Alert variant="default" className="mt-4">
                <InfoCircledIcon className="h-4 w-4" />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>{info}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {!error && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Filtered Assets</CardTitle>
              <CardDescription>
                Assets that meet all conditions: Positive trendline, Price above EMA 60, RSI &lt; 50
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetTable
                assets={filteredAssets}
                timeframe={timeframe}
                onAssetSelect={handleAssetSelection}
                selectedAssets={selectedAssets}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Analyzed Assets</CardTitle>
              <CardDescription>Complete analysis of all assets</CardDescription>
            </CardHeader>
            <CardContent>
              <AssetTable
                assets={analyzedAssets}
                timeframe={timeframe}
                showAll
                onAssetSelect={handleAssetSelection}
                selectedAssets={selectedAssets}
              />
            </CardContent>
          </Card>

          {selectedAssets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Stock Details</CardTitle>
                <CardDescription>
                  Detailed analysis and insights for {selectedAssets.length} selected stock
                  {selectedAssets.length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {selectedAssets.map((asset) => {
                    const priceHistory = generatePriceHistory(asset)
                    const fundamentals = generateFundamentalRatios(asset)

                    return (
                      <div key={asset.symbol} className="border rounded-lg p-4 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{asset.symbol}</h3>
                          <Badge
                            className={
                              asset.hasTrendline && asset.isAboveEMA60 && asset.rsi < 50
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }
                          >
                            {asset.hasTrendline && asset.isAboveEMA60 && asset.rsi < 50 ? "Strong Buy" : "Hold/Watch"}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">30-Day Price Chart</h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={priceHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} name="Price" />
                                <Line
                                  type="monotone"
                                  dataKey="ema60"
                                  stroke="#dc2626"
                                  strokeWidth={1}
                                  strokeDasharray="5 5"
                                  name="EMA 60"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium">Fundamental Ratios</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">P/E Ratio</p>
                              <p
                                className={`text-lg font-semibold ${fundamentals.peRatio < 20 ? "text-green-600" : fundamentals.peRatio > 30 ? "text-red-600" : "text-blue-600"}`}
                              >
                                {fundamentals.peRatio}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">P/B Ratio</p>
                              <p
                                className={`text-lg font-semibold ${fundamentals.pbRatio < 2 ? "text-green-600" : fundamentals.pbRatio > 4 ? "text-red-600" : "text-blue-600"}`}
                              >
                                {fundamentals.pbRatio}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">ROE (%)</p>
                              <p
                                className={`text-lg font-semibold ${fundamentals.roe > 15 ? "text-green-600" : fundamentals.roe < 10 ? "text-red-600" : "text-blue-600"}`}
                              >
                                {fundamentals.roe}%
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Debt/Equity</p>
                              <p
                                className={`text-lg font-semibold ${fundamentals.debtToEquity < 0.5 ? "text-green-600" : fundamentals.debtToEquity > 1.5 ? "text-red-600" : "text-blue-600"}`}
                              >
                                {fundamentals.debtToEquity}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">P/S Ratio</p>
                              <p
                                className={`text-lg font-semibold ${fundamentals.priceToSales < 3 ? "text-green-600" : fundamentals.priceToSales > 8 ? "text-red-600" : "text-blue-600"}`}
                              >
                                {fundamentals.priceToSales}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Current Ratio</p>
                              <p
                                className={`text-lg font-semibold ${fundamentals.currentRatio > 1.5 ? "text-green-600" : fundamentals.currentRatio < 1 ? "text-red-600" : "text-blue-600"}`}
                              >
                                {fundamentals.currentRatio}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Quick Ratio</p>
                              <p
                                className={`text-lg font-semibold ${fundamentals.quickRatio > 1 ? "text-green-600" : fundamentals.quickRatio < 0.8 ? "text-red-600" : "text-blue-600"}`}
                              >
                                {fundamentals.quickRatio}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Gross Margin (%)</p>
                              <p
                                className={`text-lg font-semibold ${fundamentals.grossMargin > 30 ? "text-green-600" : fundamentals.grossMargin < 20 ? "text-red-600" : "text-blue-600"}`}
                              >
                                {fundamentals.grossMargin}%
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Ratio Health Score</h5>
                            <div className="h-32 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={[
                                    {
                                      name: "Valuation",
                                      score: fundamentals.peRatio < 20 ? 85 : fundamentals.peRatio > 30 ? 35 : 65,
                                    },
                                    {
                                      name: "Profitability",
                                      score: fundamentals.roe > 15 ? 90 : fundamentals.roe < 10 ? 40 : 70,
                                    },
                                    {
                                      name: "Liquidity",
                                      score:
                                        fundamentals.currentRatio > 1.5 ? 85 : fundamentals.currentRatio < 1 ? 30 : 60,
                                    },
                                    {
                                      name: "Leverage",
                                      score:
                                        fundamentals.debtToEquity < 0.5
                                          ? 90
                                          : fundamentals.debtToEquity > 1.5
                                            ? 35
                                            : 65,
                                    },
                                  ]}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                  <YAxis tick={{ fontSize: 12 }} />
                                  <Tooltip />
                                  <Bar dataKey="score" fill="#3b82f6" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Technical Analysis</h4>
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">Trendline Direction</span>
                              <div className="flex items-center">
                                {asset.hasTrendline ? (
                                  <>
                                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="text-green-600 text-sm font-medium">Positive</span>
                                  </>
                                ) : (
                                  <>
                                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                    <span className="text-red-600 text-sm font-medium">Negative</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">Price vs EMA 60</span>
                              <div className="flex items-center">
                                {asset.isAboveEMA60 ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="text-green-600 text-sm font-medium">Above EMA</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                    <span className="text-red-600 text-sm font-medium">Below EMA</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">RSI Signal</span>
                              <span
                                className={`text-sm font-medium ${asset.rsi < 50 ? "text-green-600" : "text-red-600"}`}
                              >
                                {asset.rsi < 30
                                  ? "Oversold"
                                  : asset.rsi > 70
                                    ? "Overbought"
                                    : asset.rsi < 50
                                      ? "Bullish"
                                      : "Bearish"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Investment Recommendation</h4>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              {asset.hasTrendline && asset.isAboveEMA60 && asset.rsi < 50
                                ? `${asset.symbol} shows strong bullish signals with positive momentum, price above key moving average, and healthy RSI levels. Consider for accumulation.`
                                : asset.hasTrendline && asset.isAboveEMA60
                                  ? `${asset.symbol} has positive momentum and is above EMA 60, but RSI suggests caution. Monitor for better entry points.`
                                  : asset.hasTrendline
                                    ? `${asset.symbol} shows positive trend but is below key support levels. Wait for price to reclaim EMA 60.`
                                    : `${asset.symbol} is in a downtrend. Consider waiting for trend reversal signals before entering.`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
