"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ConversationList } from "@/components/chat/conversation-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Heart } from "lucide-react"
import type { Conversation, Participant } from "@/types/chat"
import { toast } from "sonner"
import { UserRole } from "@/enum/UserRole"

const transformApiDataToConversation = (apiData: any[], currentUserId: string | undefined): Conversation[] => {
  if (!Array.isArray(apiData) || !currentUserId) return []
  const mappedConversations = apiData.map(conv => {
    if (!conv || !conv.petOwner || !conv.shop || !conv.shop.user) return null

    const participants: Participant[] = [
      {
        userId: conv.petOwner.userId,
        fullName: conv.petOwner.fullName,
        role: conv.petOwner.role as UserRole,
        profilePictureUrl: conv.petOwner.profilePictureUrl,
        isOnline: false,
      },
      {
        userId: conv.shop.user.userId,
        shopId: conv.shop.shopId,
        fullName: conv.shop.shopName,
        role: conv.shop.user.role as UserRole,
        profilePictureUrl: conv.shop.shopImageUrl,
        isOnline: Boolean(conv.shop.user.isOnline),
        lastActiveAt: conv.shop.user.lastActiveAt,
      },
    ]

    participants[0].isOnline = Boolean(conv.petOwner.isOnline)
    participants[0].lastActiveAt = conv.petOwner.lastActiveAt

    return {
      conversationId: conv.conversationId,
      participants,
      lastMessage: conv.lastMessage || undefined,
      lastMessageAt: conv.lastMessage?.sentAt || conv.createdAt,
      unreadCount: 0,
      serviceInfo: undefined,
    } as Conversation
  })
  return mappedConversations.filter(Boolean) as Conversation[]
}

export default function ChatPageContent() {
  const { user, token } = useAuth()
  const { connection } = useChat()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const quoteDraft = searchParams.get("quote") || ""
  const serviceId = searchParams.get("serviceId") || ""
  const serviceName = searchParams.get("serviceName") || ""
  const shopName = searchParams.get("shopName") || ""

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    router.push(`/chat?conversationId=${conversation.conversationId}`, { scroll: false })
  }

  useEffect(() => {
    if (!token || !user) return

    const initializePage = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/chat/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Không tải được cuộc trò chuyện")

        const data = await res.json()
        const fetched = transformApiDataToConversation(data || [], user.userId)
        setConversations(fetched)

        const conversationId = searchParams.get("conversationId")
        const newShopId = searchParams.get("new")

        let selected: Conversation | undefined

        if (conversationId) {
          selected = fetched.find(c => c.conversationId === conversationId)
        } else if (newShopId) {
          const existing = fetched.find(c =>
            c.participants.some(p => (p.shopId === newShopId || p.userId === newShopId) && (p.role === UserRole.Shop || p.role === UserRole.Intermediary))
          )

          if (existing) selected = existing
          else {
            const createRes = await fetch("/api/chat/conversations", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ shopId: newShopId }),
            })
            if (!createRes.ok) throw new Error("Không tạo được cuộc trò chuyện")

            const newConv = await createRes.json()
            const nextParams = new URLSearchParams()
            nextParams.set("conversationId", newConv.conversationId)
            if (quoteDraft) nextParams.set("quote", quoteDraft)
            if (serviceId) nextParams.set("serviceId", serviceId)
            if (serviceName) nextParams.set("serviceName", serviceName)
            if (shopName) nextParams.set("shopName", shopName)
            router.replace(`/chat?${nextParams.toString()}`, { scroll: false })
            return
          }
        }

        if (selected) {
          setSelectedConversation({
            ...selected,
            serviceInfo:
              serviceId && serviceName && shopName
                ? {
                    serviceId,
                    serviceName,
                    shopName,
                  }
                : selected.serviceInfo,
          })
        }
      } catch (err) {
        toast.error("Không tải được cuộc trò chuyện")
      } finally {
        setIsLoading(false)
      }
    }

    initializePage()
  }, [token, user, quoteDraft, router, searchParams, serviceId, serviceName, shopName])

  useEffect(() => {
    if (!connection) return

    const handlePresenceChanged = (userId: string, isOnline: boolean, lastActiveAt: string) => {
      const updateConversation = (conversation: Conversation): Conversation => ({
        ...conversation,
        participants: conversation.participants.map((participant) =>
          participant.userId === userId
            ? { ...participant, isOnline, lastActiveAt }
            : participant
        ),
      })

      setConversations((current) => current.map(updateConversation))
      setSelectedConversation((current) => (current ? updateConversation(current) : current))
    }

    connection.on("UserPresenceChanged", handlePresenceChanged)

    return () => {
      connection.off("UserPresenceChanged", handlePresenceChanged)
    }
  }, [connection])

  const conversationIdFromUrl = searchParams.get("conversationId")

  if (!user && !isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Vui lòng đăng nhập</h2>
              <p className="text-muted-foreground">
                Bạn cần đăng nhập để xem tin nhắn.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <Navigation />
      <main className="flex-1 flex flex-col pt-8 overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tin nhắn</h1>
            <p className="text-muted-foreground">
              Kết nối với nhà cung cấp dịch vụ và trao đổi nhu cầu chăm sóc thú cưng.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0 pb-8">
            <div className="lg:col-span-1 flex flex-col">
              <ConversationList
                conversations={conversations}
                isLoading={isLoading}
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.conversationId}
              />
            </div>

            <div className="lg:col-span-2 flex flex-col">
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  initialDraft={quoteDraft}
                  onBack={() => {
                    setSelectedConversation(null)
                    router.push("/chat", { scroll: false })
                  }}
                />
              ) : conversationIdFromUrl && isLoading ? (
                <Card className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </Card>
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Chọn một cuộc trò chuyện
                    </h3>
                    <p className="text-muted-foreground">
                      Chọn cuộc trò chuyện trong danh sách để bắt đầu nhắn tin.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

