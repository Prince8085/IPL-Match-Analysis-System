"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ModelInsights({ predictions }) {
  // Create safe data with default values
  const safeData = {
    modelInsights: predictions?.modelInsights || {
      modelName: "Unknown Model",
      accuracy: 0,
      confidenceScore: 0,
      keyFactors: [],
      featureImportance: [],
      modelComparison: [],
    },
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Model Insights</CardTitle>
        <CardDescription className="text-gray-400">
          {safeData.modelInsights.modelName} - Accuracy: {safeData.modelInsights.accuracy}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="features" className="data-[state=active]:bg-purple-700">
              Features
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-purple-700">
              Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="mt-4 space-y-4">
            <div className="rounded-lg bg-gray-700/30 p-3">
              <div className="mb-1 flex justify-between">
                <span className="text-sm font-medium text-white">Confidence Score</span>
                <span className="text-sm font-medium text-white">{safeData.modelInsights.confidenceScore}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                <div className="bg-purple-600" style={{ width: `${safeData.modelInsights.confidenceScore}%` }}></div>
              </div>
            </div>

            {safeData.modelInsights.keyFactors && safeData.modelInsights.keyFactors.length > 0 ? (
              <div className="rounded-lg bg-gray-700/30 p-3">
                <h4 className="mb-2 text-sm font-medium text-white">Key Factors</h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  {safeData.modelInsights.keyFactors.map((factor, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-700/30 p-3 text-center text-sm text-gray-400">
                No key factors available
              </div>
            )}

            {safeData.modelInsights.featureImportance && safeData.modelInsights.featureImportance.length > 0 ? (
              <div className="rounded-lg bg-gray-700/30 p-3">
                <h4 className="mb-2 text-sm font-medium text-white">Feature Importance</h4>
                <div className="space-y-2">
                  {safeData.modelInsights.featureImportance.map((feature, index) => (
                    <div key={index}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-gray-400">{feature.feature}</span>
                        <span className="text-gray-400">{feature.importance}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                        <div className="bg-blue-600" style={{ width: `${feature.importance}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-700/30 p-3 text-center text-sm text-gray-400">
                No feature importance data available
              </div>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="mt-4">
            {safeData.modelInsights.modelComparison && safeData.modelInsights.modelComparison.length > 0 ? (
              <div className="rounded-lg bg-gray-700/30 p-3">
                <h4 className="mb-3 text-sm font-medium text-white">Model Comparison</h4>
                <div className="space-y-3">
                  {safeData.modelInsights.modelComparison.map((model, index) => (
                    <div key={index}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-gray-400">{model.model}</span>
                        <span className="text-gray-400">{model.accuracy}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                        <div
                          className={`${index === 0 ? "bg-green-600" : index === 1 ? "bg-blue-600" : "bg-amber-600"}`}
                          style={{ width: `${model.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-700/30 p-3 text-center text-sm text-gray-400">
                No model comparison data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
