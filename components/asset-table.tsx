"use client"

import type { AssetData } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown } from "lucide-react"

interface AssetTableProps {
  assets: AssetData[]
}

export function AssetTable({ assets }: AssetTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Analysis Results</CardTitle>
        <CardDescription>Comprehensive analysis of your selected financial assets</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Volatility</TableHead>
              <TableHead>Recommendation</TableHead>
              <TableHead>Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.symbol}>
                <TableCell className="font-medium">{asset.symbol}</TableCell>
                <TableCell>{formatCurrency(asset.currentPrice)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {asset.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={asset.change >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatPercentage(asset.change)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{asset.volume.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={getRiskColor(asset.analysis.riskLevel)}>{asset.analysis.riskLevel}</Badge>
                </TableCell>
                <TableCell>{asset.analysis.volatility.toFixed(2)}%</TableCell>
                <TableCell>
                  <Badge variant="outline">{asset.analysis.recommendation}</Badge>
                </TableCell>
                <TableCell>{asset.analysis.confidence.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
