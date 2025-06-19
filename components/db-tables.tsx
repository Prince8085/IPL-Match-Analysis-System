"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Database, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DatabaseTables() {
  const [activeTab, setActiveTab] = useState("teams")
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any>({
    teams: [],
    players: [],
    venues: [],
    matches: [],
    predictions: [],
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData(activeTab)
  }, [activeTab])

  const fetchData = async (table: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/${table}`)
      const result = await response.json()

      if (result.success) {
        setData((prev: any) => ({ ...prev, [table]: result.data }))
      } else {
        toast({
          title: "Error",
          description: `Failed to fetch ${table} data`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error fetching ${table} data:`, error)
      toast({
        title: "Error",
        description: `Failed to fetch ${table} data`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = () => {
    fetchData(activeTab)
  }

  const renderTableContent = (table: string) => {
    const tableData = data[table] || []

    if (tableData.length === 0) {
      return <div className="py-8 text-center text-gray-400">No data available in this table</div>
    }

    // Get column names from the first row
    const columns = Object.keys(tableData[0]).filter((col) => !["createdAt", "updatedAt"].includes(col))

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="text-gray-300">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row: any, index: number) => (
              <TableRow key={index} className="border-gray-700">
                {columns.map((column) => (
                  <TableCell key={column} className="text-gray-300">
                    {renderCellValue(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-500">null</span>
    }

    if (typeof value === "object") {
      return <span className="text-blue-400">{JSON.stringify(value).substring(0, 50)}...</span>
    }

    return String(value)
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Tables
            </CardTitle>
            <CardDescription className="text-gray-400">View and manage data in your database tables</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={refreshData}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="teams" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-700 mb-4">
            <TabsTrigger value="teams" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Teams
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Players
            </TabsTrigger>
            <TabsTrigger value="venues" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Venues
            </TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Matches
            </TabsTrigger>
            <TabsTrigger
              value="predictions"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Predictions
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 z-10 rounded-md">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            )}

            <TabsContent value="teams" className="mt-0">
              {renderTableContent("teams")}
            </TabsContent>

            <TabsContent value="players" className="mt-0">
              {renderTableContent("players")}
            </TabsContent>

            <TabsContent value="venues" className="mt-0">
              {renderTableContent("venues")}
            </TabsContent>

            <TabsContent value="matches" className="mt-0">
              {renderTableContent("matches")}
            </TabsContent>

            <TabsContent value="predictions" className="mt-0">
              {renderTableContent("predictions")}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
