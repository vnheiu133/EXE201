"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as signalR from "@microsoft/signalr";
import { BellRing, CalendarCheck, PackageCheck, Star } from "lucide-react";
import { toast } from "sonner";

import { hubUrl } from "@/lib/api-origin";
import { useAuth } from "@/contexts/auth-context";

type NotificationType = "order-created" | "product-review" | "service-review" | "service-booking" | string;

export interface RealtimeNotification {
  type: NotificationType;
  title: string;
  message: string;
  actorName?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: RealtimeNotification[];
  announceServiceBooking: (serviceName: string, shopName: string) => Promise<void>;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
const demoNotificationsEnabled = process.env.NEXT_PUBLIC_DEMO_NOTIFICATIONS !== "false";

const demoNotifications: Array<Omit<RealtimeNotification, "createdAt">> = [
  {
    type: "order-created",
    title: "Đơn hàng mới",
    message: "Nguyễn Minh Anh vừa đặt hàng thành công 2 sản phẩm chăm sóc thú cưng.",
    actorName: "Nguyễn Minh Anh",
  },
  {
    type: "product-review",
    title: "Đánh giá sản phẩm mới",
    message: "Trần Hoàng vừa đánh giá 5/5 sao cho sản phẩm thức ăn Pedigree.",
    actorName: "Trần Hoàng",
  },
  {
    type: "service-booking",
    title: "Yêu cầu dịch vụ mới",
    message: "Lê Thanh vừa đặt lịch tư vấn dịch vụ tắm và grooming.",
    actorName: "Lê Thanh",
  },
  {
    type: "service-review",
    title: "Đánh giá dịch vụ mới",
    message: "Phạm Gia Hân vừa đánh giá 4/5 sao cho dịch vụ dắt chó đi dạo.",
    actorName: "Phạm Gia Hân",
  },
];

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

function NotificationIcon({ type }: { type: NotificationType }) {
  if (type === "order-created") return <PackageCheck className="mt-0.5 size-4 text-[#1f6654]" />;
  if (type === "service-booking") return <CalendarCheck className="mt-0.5 size-4 text-[#b44735]" />;
  if (type.includes("review")) return <Star className="mt-0.5 size-4 fill-amber-400 text-amber-400" />;
  return <BellRing className="mt-0.5 size-4 text-[#1f6654]" />;
}

function showNotificationToast(notification: RealtimeNotification) {
  toast.custom(() => (
    <div className="flex w-[min(24rem,calc(100vw-2rem))] gap-3 rounded-lg border border-[#dce6df] bg-white p-4 text-left shadow-lg">
      <NotificationIcon type={notification.type} />
      <div className="min-w-0">
        <p className="font-semibold text-[#16312a]">{notification.title || "Thông báo mới"}</p>
        <p className="mt-1 text-sm leading-5 text-[#526761]">{notification.message}</p>
      </div>
    </div>
  ), { position: "bottom-left" });
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  const pushNotification = useCallback((notification: RealtimeNotification) => {
    setNotifications((current) => [notification, ...current].slice(0, 20));
    showNotificationToast(notification);
  }, []);

  useEffect(() => {
    if (!isUsableJwt(token)) {
      setConnection(null);
      return;
    }

    const accessToken = token;
    let disposed = false;
    const nextConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl("/notificationhub"), {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .build();

    nextConnection.on("ReceiveNotification", (notification: RealtimeNotification) => {
      const normalized = {
        ...notification,
        createdAt: notification.createdAt || new Date().toISOString(),
      };

      pushNotification(normalized);
    });

    nextConnection
      .start()
      .then(() => {
        if (!disposed) setConnection(nextConnection);
      })
      .catch(() => {
        if (!disposed) setConnection(null);
      });

    return () => {
      disposed = true;
      setConnection((current) => (current === nextConnection ? null : current));
      nextConnection.stop().catch(() => undefined);
    };
  }, [pushNotification, token]);

  useEffect(() => {
    if (!demoNotificationsEnabled) return;

    let index = 0;
    const emitDemoNotification = () => {
      const template = demoNotifications[index % demoNotifications.length];
      index += 1;

      pushNotification({
        ...template,
        createdAt: new Date().toISOString(),
      });
    };

    const firstTimer = window.setTimeout(emitDemoNotification, 7000);
    const interval = window.setInterval(emitDemoNotification, 25000);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearInterval(interval);
    };
  }, [pushNotification]);

  const announceServiceBooking = useCallback(
    async (serviceName: string, shopName: string) => {
      if (!connection) return;

      try {
        await connection.invoke("BroadcastServiceBooking", serviceName, shopName);
      } catch {
      }
    },
    [connection],
  );

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return (
    <NotificationContext.Provider value={{ notifications, announceServiceBooking, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
