import { UserRole } from "@/enum/UserRole"; 

export interface Message {
  messageId: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  sentAt: string
  isRead: boolean
}

export interface Conversation {
  conversationId: string
  participants: Participant[]
  lastMessage?: Message
  lastMessageAt: string
  unreadCount: number
  serviceInfo?: {
    serviceId: string
    serviceName: string
    shopName: string
  }
}

export interface Participant {
  userId: string
  fullName: string
  role: UserRole;
  profilePictureUrl?: string
  isOnline: boolean
}

