"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import type { AnalyzedAsset } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"

interface AssetTableProps {
  assets: AnalyzedAsset[]
  timeframe: "weekly" | "monthly"
  showAll?: boolean
  onAssetSelect?: (asset: AnalyzedAsset, isSelected: boolean) => void
  selectedAssets?: AnalyzedAsset[]
}

export function AssetTable({
  assets,
  timeframe,
  showAll = false,
  onAssetSelect,
  selectedAssets = [],
}: AssetTableProps) {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No assets to display</h3>
        <p className="text-sm text-muted-foreground mt-2">
          {showAll ? "Run an analysis to see results" : "No assets match the filtering criteria"}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {onAssetSelect && <TableHead className="w-12">Select</TableHead>}
            <TableHead>Symbol</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Trendline</TableHead>
            <TableHead>EMA 60</TableHead>
            <TableHead>RSI</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => {
            const meetsAllCriteria = asset.hasTrendline && asset.isAboveEMA60 && asset.rsi < 50
            const isSelected = selectedAssets.some((selected) => selected.symbol === asset.symbol)

            return (
              <TableRow key={asset.symbol}>
                {onAssetSelect && (
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onAssetSelect(asset, checked as boolean)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{asset.symbol}</TableCell>
                <TableCell>${asset.price.toFixed(2)}</TableCell>
                <TableCell>
                  {asset.hasTrendline ? (
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">Positive</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-500">Negative</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          {asset.isAboveEMA60 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-1" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mr-1" />
                          )}
                          <span className="text-xs">${asset.ema60.toFixed(2)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Price: ${asset.price.toFixed(2)}</p>
                        <p>EMA 60: ${asset.ema60.toFixed(2)}</p>
                        <p>{asset.isAboveEMA60 ? "Price is above EMA" : "Price is below EMA"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={asset.rsi < 50 ? "text-green-500" : "text-red-500"}>
                          {asset.rsi.toFixed(2)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>RSI: {asset.rsi.toFixed(2)}</p>
                        <p>
                          {asset.rsi < 50
                            ? "RSI is below 50 (not overbought)"
                            : "RSI is above 50 (potentially overbought)"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  {meetsAllCriteria ? (
                    <Badge className="bg-green-500">Passed</Badge>
                  ) : (
                    <Badge variant="outline">Failed</Badge>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
