"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface ContactChatButtonProps {
  shopOwnerId: string
  shopName: string
  className?: string
}

export function ContactChatButton({ shopOwnerId, shopName, className }: ContactChatButtonProps) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStartChat = async () => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      // Create or get existing conversation
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopId: shopOwnerId,
          initialMessage: "Xin chào! Tôi muốn tìm hiểu thêm về dịch vụ chăm sóc thú cưng của cửa hàng.",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/chat?conversationId=${result.conversationId}`)
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleStartChat}
      disabled={loading}
      className={`bg-purple-500 hover:bg-purple-600 text-white ${className}`}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {loading ? "Đang mở..." : "Liên hệ"}
    </Button>
  )
}

