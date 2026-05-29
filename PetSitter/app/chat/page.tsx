"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ConversationList } from "@/components/chat/conversation-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Heart, Loader2 } from "lucide-react"
import type { Conversation, Message, Participant } from "@/types/chat"
import { toast } from "sonner";
import { UserRole } from "@/enum/UserRole";
import { set } from "date-fns";
import { Suspense } from "react";
import ChatPageContent from "./chatPageContent";


export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-gray-500">
      Loading chat...
    </div>}>
      <ChatPageContent />
    </Suspense>
  );
}
