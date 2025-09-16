import { AssetAnalyzer } from "@/components/asset-analyzer"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">Financial Asset Analyzer</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Analyze financial assets with advanced metrics, risk assessment, and performance tracking
          </p>
        </div>
        <AssetAnalyzer />
      </div>
    </main>
  )
}
