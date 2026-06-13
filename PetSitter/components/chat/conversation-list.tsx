"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/avatar"
import { formatPresence } from "@/lib/chat-presence"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Conversation, Participant } from "@/types/chat" // Import thêm Participant
import { UserRole } from "@/enum/UserRole"
import { formatDistanceToNow, parseISO } from "date-fns"
import { vi } from "date-fns/locale"

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  onSelectConversation: (conversation: Conversation) => void
  selectedConversationId?: string
}

export function ConversationList({ onSelectConversation, selectedConversationId, conversations, isLoading }: ConversationListProps) {
  const { user} = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = conversation.participants.find((p) => p.userId !== user?.userId)
    return (
      otherParticipant?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.serviceInfo?.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  if (isLoading) {
    return (
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle>Tin nhắn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải cuộc trò chuyện...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getInitials = (fullName: string | undefined) => {
    if (!fullName) return "";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Tin nhắn</span>
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Chưa có cuộc trò chuyện</h3>
              <p className="text-muted-foreground text-sm">
                Bắt đầu trò chuyện với nhà cung cấp dịch vụ để xem cuộc trò chuyện tại đây.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conversation) => {
                const otherParticipant = conversation.participants.find((p) => p.userId !== user?.userId)
                const isSelected = conversation.conversationId === selectedConversationId

                return (
                  <div
                    key={conversation.conversationId}
                    onClick={() => onSelectConversation(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-blue-50 border-r-2 border-blue-600" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={getAvatarUrl(otherParticipant?.profilePictureUrl)} className="object-cover" />
                          <AvatarFallback>
                            <img src="/placeholder-user.jpg" alt={otherParticipant?.fullName || "Người dùng"} className="h-full w-full object-cover" />
                          </AvatarFallback>
                        </Avatar>
                        {otherParticipant?.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-sm truncate">{otherParticipant?.fullName}</h4>
                            {otherParticipant?.role === UserRole.Shop && (
                              <Badge variant="secondary" className="text-xs">
                                Cửa hàng
                              </Badge>
                            )}
                            {otherParticipant?.role === UserRole.Intermediary && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                Trung gian
                              </Badge>
                            )}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {formatPresence(otherParticipant)}
                        </p>
                        {conversation.serviceInfo && (
                          <p className="text-xs text-blue-600 mb-1">📋 {conversation.serviceInfo.serviceName}</p>
                        )}
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage?.content || (conversation.participants.length > 0 ? "Chưa có tin nhắn" : "Đã tạo cuộc trò chuyện")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {conversation.lastMessage && formatDistanceToNow(parseISO(conversation.lastMessageAt), { addSuffix: true, locale: vi })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
