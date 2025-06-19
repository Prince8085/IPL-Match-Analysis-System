"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function PlayerPerformanceTable({ players, prediction }) {
  const [searchTerm, setSearchTerm] = useState("")

  // If we don't have prediction data yet, show placeholder
  if (!prediction || !players || players.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Player data will appear here after analysis</p>
      </div>
    )
  }

  // Filter players based on search term
  const filteredPlayers = players.filter((player) => player.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search players..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Form Rating</TableHead>
              <TableHead>Projected Points</TableHead>
              <TableHead>Key Matchup</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>{player.role}</TableCell>
                <TableCell>{player.team}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${player.formRating * 10}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm">{player.formRating}/10</span>
                  </div>
                </TableCell>
                <TableCell>{player.projectedPoints}</TableCell>
                <TableCell>{player.keyMatchup}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
