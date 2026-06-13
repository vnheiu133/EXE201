import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/avatar"
import { formatPresence } from "@/lib/chat-presence"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Phone, Video, MoreVertical, ArrowLeft, Heart, Star } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {useChat} from "@/contexts/chat-context"
import type { Message, Conversation } from "@/types/chat"
import { UserRole } from "@/enum/UserRole"
import { formatDistanceToNow, parseISO } from "date-fns"
import { vi } from "date-fns/locale"

interface ChatWindowProps {
  conversation: Conversation
  onBack?: () => void
  initialDraft?: string
}

export function ChatWindow({ conversation, onBack, initialDraft }: ChatWindowProps) {
  const { user, token } = useAuth()
  const { connection, sendMessage, joinConversation, leaveConversation, userStartedTyping, userStoppedTyping } = useChat();
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasScrolledInitial, setHasScrolledInitial] = useState(false); // Thêm state mới
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialDraft) {
      setNewMessage((current) => current || initialDraft);
    }
  }, [conversation.conversationId, initialDraft]);

  // Effect MỚI để xử lý việc cuộn
  useEffect(() => {
    // Nếu có tin nhắn và chưa thực hiện cuộn lần đầu
    if (messages.length > 0 && !hasScrolledInitial) {
        // Cuộn xuống cuối ngay lập tức (không có animation)
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        setHasScrolledInitial(true); // Đánh dấu đã cuộn
    }
  }, [messages, hasScrolledInitial]);

  // Effect để fetch lịch sử tin nhắn (chỉ chạy khi conversationId thay đổi)
  useEffect(() => {
    if (!token || !conversation.conversationId) return;
      setIsLoading(true);
        // 1. Fetch message history
        fetch(`/api/chat/conversations/${conversation.conversationId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => res.ok ? res.json() : Promise.reject(new Error("Không tải được lịch sử tin nhắn")))
    .then(data => setMessages(data || []))
    // CUỘN XUỐNG CUỐI NGAY SAU KHI TẢI LỊCH SỬ
    .then(() => {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 50);
    })
    .catch()
    .finally(() => setIsLoading(false));
  }, [conversation.conversationId, token]);

  // Effect để quản lý kết nối và listener của SignalR
  useEffect(() => {
    if (!connection || !conversation.conversationId) return;

    const startAndJoin = async () => {
      try {
        await joinConversation(conversation.conversationId);
      } catch (err) {
      }
    };
    
    startAndJoin();
    
    const handleReceiveMessage = (message: Message) => {
      if (message.conversationId === conversation.conversationId) {
        // Kiểm tra xem tin nhắn đã tồn tại chưa trước khi thêm
        setMessages((prev) => prev.some(m => m.messageId === message.messageId) ? prev : [...prev, message]);
      }
    };

    const handleTypingStatus = (senderId: string, isCurrentlyTyping: boolean) => {
      if (senderId !== user?.userId) {
        setIsTyping(isCurrentlyTyping);
      }
    };

    // Đăng ký listener
    connection.on("ReceiveMessage", handleReceiveMessage);
    connection.on("ReceiveTypingStatus", handleTypingStatus);

    // Hàm cleanup
    return () => {
      if (connection.state === "Connected") {
        leaveConversation(conversation.conversationId);
      }
      // Luôn gỡ listener
      connection.off("ReceiveMessage", handleReceiveMessage);
      connection.off("ReceiveTypingStatus", handleTypingStatus);
    };
  }, [connection, conversation.conversationId, joinConversation, leaveConversation, user?.userId]);

  // Effect để xử lý sự kiện gõ phím
  useEffect(() => {
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }
    
    if (newMessage) {
        userStartedTyping(conversation.conversationId);
    }

    typingTimeoutRef.current = setTimeout(() => {
        userStoppedTyping(conversation.conversationId);
    }, 2000);
  }, [newMessage, conversation.conversationId, userStartedTyping, userStoppedTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
  
    try {
        // Chỉ cần gọi hàm sendMessage.
        // Hub sẽ xử lý và gửi lại tin nhắn đầy đủ (với messageId thật) qua sự kiện "ReceiveMessage".
        await sendMessage(conversation.conversationId, newMessage.trim());

        setNewMessage("");

        // Notify that typing has stopped
        userStoppedTyping(conversation.conversationId);
    } catch (err) {
    }
};

  const otherParticipant = conversation?.participants.find((p) => p.userId !== user?.userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Chat Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarImage src={getAvatarUrl(otherParticipant?.profilePictureUrl)} className="object-cover" />
            <AvatarFallback>
              <img src="/placeholder-user.jpg" alt={otherParticipant?.fullName || "Người dùng"} className="h-full w-full object-cover" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">{otherParticipant?.fullName}</h3>
              {otherParticipant?.role === UserRole.Shop && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Cửa hàng
                </Badge>
              )}
              {otherParticipant?.role === UserRole.Intermediary && (
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200">
                  <Star className="h-3 w-3 mr-1" />
                  Trung gian
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {otherParticipant?.isOnline ? (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  {formatPresence(otherParticipant)}
                </span>
              ) : (
                formatPresence(otherParticipant)
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Service Info Banner */}
      {conversation?.serviceInfo && (
        <div className="px-4 py-2 bg-blue-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Đang trao đổi: {conversation.serviceInfo.serviceName}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {conversation.serviceInfo.shopName}
            </Badge>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Bắt đầu cuộc trò chuyện!</h3>
                <p className="text-muted-foreground text-sm">Gửi lời chào và trao đổi nhu cầu chăm sóc thú cưng của bạn.</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.senderId === user?.userId
                return (
                  <div key={message.messageId} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      {!isOwn && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={getAvatarUrl(message.senderAvatar)} className="object-cover" />
                          <AvatarFallback className="text-xs">
                            <img src="/placeholder-user.jpg" alt={message.senderName || "Người dùng"} className="h-full w-full object-cover" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
                          {message.sentAt && formatDistanceToNow(parseISO(message.sentAt), { addSuffix: true, locale: vi })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2 max-w-[70%]">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={getAvatarUrl(otherParticipant?.profilePictureUrl)} className="object-cover" />
                    <AvatarFallback className="text-xs">
                      <img src="/placeholder-user.jpg" alt={otherParticipant?.fullName || "Người dùng"} className="h-full w-full object-cover" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}

