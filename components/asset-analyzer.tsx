"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssetTable } from "./asset-table"
import type { AssetData, AnalysisResult } from "@/lib/types"
import { analyzeAsset } from "@/lib/asset-analyzer"
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, BarChart3, PieChart } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

export function AssetAnalyzer() {
  const [symbol, setSymbol] = useState("")
  const [assets, setAssets] = useState<AssetData[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!symbol.trim()) return

    setLoading(true)
    try {
      const result = await analyzeAsset(symbol.toUpperCase())
      setAssets((prev) => {
        const existing = prev.find((a) => a.symbol === result.symbol)
        if (existing) {
          return prev.map((a) => (a.symbol === result.symbol ? result : a))
        }
        return [...prev, result]
      })
      setAnalysis(result.analysis)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case "buy":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "sell":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "hold":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Asset Analysis
          </CardTitle>
          <CardDescription>Enter a stock symbol to analyze its financial performance and risk metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter stock symbol (e.g., AAPL, GOOGL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
              className="flex-1"
            />
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                  <Badge className={getRiskColor(analysis.riskLevel)}>{analysis.riskLevel}</Badge>
                </div>
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getRecommendationIcon(analysis.recommendation)}
                    <span className="font-semibold">{analysis.recommendation}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Volatility</p>
                  <p className="text-2xl font-bold">{analysis.volatility.toFixed(2)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                  <p className="text-2xl font-bold">{analysis.confidence.toFixed(1)}%</p>
                </div>
                <PieChart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {assets.length > 0 && (
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Asset Table</TabsTrigger>
            <TabsTrigger value="charts">Price Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <AssetTable assets={assets} />
          </TabsContent>

          <TabsContent value="charts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assets.map((asset) => (
                <Card key={asset.symbol}>
                  <CardHeader>
                    <CardTitle className="text-lg">{asset.symbol} Price History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={asset.historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="close" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
