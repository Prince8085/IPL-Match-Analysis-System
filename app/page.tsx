import MatchAnalyticsDashboard from "@/components/match-analytics-dashboard"

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6 text-white">IPL Match Analysis System</h1>
      <MatchAnalyticsDashboard />
    </main>
  )
}
