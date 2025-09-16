import { AssetAnalyzer } from "@/components/asset-analyzer"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Financial Asset Analyzer</h1>
      <p className="text-muted-foreground mb-8">
        Analyze assets based on technical indicators across different timeframes
      </p>
      <AssetAnalyzer />
    </main>
  )
}
