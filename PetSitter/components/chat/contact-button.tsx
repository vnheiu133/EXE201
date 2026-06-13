"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface ContactButtonProps {
  shopId: string
  serviceId?: string
  serviceName?: string
  shopName?: string
  className?: string
}

export function ContactButton({ shopId, serviceId, serviceName, shopName, className = "" }: ContactButtonProps) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleContact = async () => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    setIsLoading(true)
    try {
      // Create or get existing conversation
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopId: shopId,
          serviceId: serviceId,
          serviceName: serviceName,
          shopName: shopName,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const conversationId = data.conversationId

        // Redirect to chat page with the conversation
        router.push(`/chat?conversationId=${conversationId}`)
      } else {
      }
    } catch (error) {    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleContact} disabled={isLoading} className={`bg-purple-500 hover:bg-purple-600 ${className}`}>
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      ) : (
        <MessageCircle className="h-4 w-4 mr-2" />
      )}
      Liên hệ
    </Button>
  )
}
