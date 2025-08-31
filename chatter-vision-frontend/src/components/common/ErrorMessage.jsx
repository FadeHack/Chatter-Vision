import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function ErrorMessage({ message, className }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (message) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [message])

  if (!message || !visible) return null

  return (
    <div 
      className={cn(
        "bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm transition-opacity",
        className
      )}
    >
      {message}
    </div>
  )
}
