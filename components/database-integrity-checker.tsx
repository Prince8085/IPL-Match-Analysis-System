"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react"

type IntegrityIssue = {
  table: string
  issue: string
  severity: "low" | "medium" | "high"
  fixable: boolean
}

type IntegrityStatus = {
  status: "checking" | "success" | "warning" | "error"
  issues: IntegrityIssue[]
  lastChecked: string | null
}

export default function DatabaseIntegrityChecker() {
  const [status, setStatus] = useState<IntegrityStatus>({
    status: "success",
    issues: [],
    lastChecked: null,
  })
  const [isChecking, setIsChecking] = useState(false)
  const [isFixing, setIsFixing] = useState(false)

  const checkIntegrity = async () => {
    try {
      setIsChecking(true)
      setStatus((prev) => ({ ...prev, status: "checking" }))

      // Call the API to check database integrity
      const response = await fetch("/api/db/integrity-check")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to check database integrity")
      }

      setStatus({
        status: data.issues.length > 0 ? (data.criticalIssues > 0 ? "error" : "warning") : "success",
        issues: data.issues,
        lastChecked: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error checking database integrity:", error)
      setStatus({
        status: "error",
        issues: [
          {
            table: "system",
            issue: `Failed to check integrity: ${error instanceof Error ? error.message : String(error)}`,
            severity: "high",
            fixable: false,
          },
        ],
        lastChecked: new Date().toISOString(),
      })
    } finally {
      setIsChecking(false)
    }
  }

  const fixIssues = async () => {
    try {
      setIsFixing(true)

      // Call the API to fix database integrity issues
      const response = await fetch("/api/db/fix-integrity-issues", {
        method: "POST",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fix database integrity issues")
      }

      // Re-check integrity after fixing
      await checkIntegrity()
    } catch (error) {
      console.error("Error fixing database integrity issues:", error)
      setStatus((prev) => ({
        ...prev,
        issues: [
          ...prev.issues,
          {
            table: "system",
            issue: `Failed to fix issues: ${error instanceof Error ? error.message : String(error)}`,
            severity: "high",
            fixable: false,
          },
        ],
      }))
    } finally {
      setIsFixing(false)
    }
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case "checking":
        return <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-amber-500" />
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (status.status) {
      case "checking":
        return "Checking database integrity..."
      case "success":
        return "Database integrity check passed"
      case "warning":
        return `Found ${status.issues.length} non-critical issue(s)`
      case "error":
        return `Found ${status.issues.length} issue(s), including critical problems`
    }
  }

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return "text-blue-500 bg-blue-50 border-blue-200"
      case "medium":
        return "text-amber-500 bg-amber-50 border-amber-200"
      case "high":
        return "text-red-500 bg-red-50 border-red-200"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          <span>Database Integrity Checker</span>
        </CardTitle>
        <CardDescription>Check and fix database integrity issues, including foreign key constraints</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert
            variant={status.status === "success" ? "default" : status.status === "warning" ? "warning" : "destructive"}
          >
            <AlertTitle className="flex items-center gap-2">
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </AlertTitle>
            <AlertDescription>
              {status.lastChecked ? (
                <span className="text-sm text-muted-foreground">
                  Last checked: {new Date(status.lastChecked).toLocaleString()}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Run a check to verify database integrity</span>
              )}
            </AlertDescription>
          </Alert>

          {status.issues.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Issues Found:</h3>
              <div className="space-y-2">
                {status.issues.map((issue, index) => (
                  <div key={index} className={`p-3 rounded-md border ${getSeverityColor(issue.severity)}`}>
                    <div className="font-medium">Table: {issue.table}</div>
                    <div>{issue.issue}</div>
                    <div className="text-xs mt-1">
                      Severity: {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                      {issue.fixable && " • Automatically fixable"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={checkIntegrity} disabled={isChecking || isFixing} variant="outline">
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Integrity
            </>
          )}
        </Button>
        <Button
          onClick={fixIssues}
          disabled={isChecking || isFixing || status.issues.filter((i) => i.fixable).length === 0}
          variant="default"
        >
          {isFixing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Fixing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Fix Issues
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
