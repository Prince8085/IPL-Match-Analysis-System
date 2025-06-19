"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UpdateServiceButton() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const updateDataService = async () => {
    setIsUpdating(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/db/update-service", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Data service updated successfully")
        toast({
          title: "Success",
          description: "Data service updated successfully",
          variant: "default",
        })
      } else {
        setStatus("error")
        setMessage(data.message || "Failed to update data service")
        toast({
          title: "Error",
          description: data.message || "Failed to update data service",
          variant: "destructive",
        })
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred while updating the data service")
      toast({
        title: "Error",
        description: "An error occurred while updating the data service",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      {status === "success" && (
        <Alert className="bg-green-900/20 border-green-800">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertTitle className="text-green-400">Success</AlertTitle>
          <AlertDescription className="text-green-300">{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-400">Error</AlertTitle>
          <AlertDescription className="text-red-300">{message}</AlertDescription>
        </Alert>
      )}

      <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={updateDataService} disabled={isUpdating}>
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Data Service
          </>
        )}
      </Button>

      <p className="text-xs text-gray-400 mt-2">
        This will update the data-service.ts file to use the database instead of mock data. A backup of the original
        file will be created as data-service.backup.ts.
      </p>
    </div>
  )
}
