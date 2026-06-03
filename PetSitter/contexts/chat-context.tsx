"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as signalR from "@microsoft/signalr";
import { hubUrl } from "@/lib/api-origin";
import { useAuth } from "./auth-context";

interface ChatContextType {
  connection: signalR.HubConnection | null;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  joinConversation: (conversationId: string) => Promise<void>;
  leaveConversation: (conversationId: string) => Promise<void>;
  userStartedTyping: (conversationId: string) => Promise<void>;
  userStoppedTyping: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

function isUsableJwt(token: string | null): token is string {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    if (!payload.exp) return true;
    return payload.exp * 1000 > Date.now() + 30_000;
  } catch {
    return false;
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const { token, logout } = useAuth();

  useEffect(() => {
    if (!isUsableJwt(token)) {
      setConnection(null);
      return;
    }

    const accessToken = token;
    let disposed = false;
    const nextConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl(), {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .build();

    nextConnection
      .start()
      .then(() => {
        if (!disposed) setConnection(nextConnection);
      })
      .catch((error) => {
        setConnection(null);
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("401") || message.toLowerCase().includes("unauthorized")) {
          logout();
        }
      });

    return () => {
      disposed = true;
      setConnection((current) => (current === nextConnection ? null : current));
      nextConnection.stop().catch(() => undefined);
    };
  }, [token, logout]);

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      if (!connection) return;
      try {
        await connection.invoke("SendMessage", conversationId, content);
      } catch {
      }
    },
    [connection]
  );

  const joinConversation = useCallback(
    async (conversationId: string) => {
      if (!connection) return;
      try {
        await connection.invoke("JoinConversation", conversationId);
      } catch {
      }
    },
    [connection]
  );

  const leaveConversation = useCallback(
    async (conversationId: string) => {
      if (!connection) return;
      try {
        await connection.invoke("LeaveConversation", conversationId);
      } catch {
      }
    },
    [connection]
  );

  const userStartedTyping = useCallback(
    async (conversationId: string) => {
      if (!connection) return;
      try {
        await connection.invoke("UserStartedTyping", conversationId);
      } catch {
      }
    },
    [connection]
  );

  const userStoppedTyping = useCallback(
    async (conversationId: string) => {
      if (!connection) return;
      try {
        await connection.invoke("UserStoppedTyping", conversationId);
      } catch {
      }
    },
    [connection]
  );

  return (
    <ChatContext.Provider value={{ connection, sendMessage, joinConversation, leaveConversation, userStartedTyping, userStoppedTyping }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};
