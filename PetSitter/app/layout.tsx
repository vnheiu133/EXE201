import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "sonner"
import { ChatProvider } from "@/contexts/chat-context"
import { NotificationProvider } from "@/contexts/notification-context"

import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
    title: "PetSitter",
    description: "Dịch vụ chăm sóc và phụ kiện thú cưng PetSitter",
    generator: "PetSitter",
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
        <body suppressHydrationWarning>
        <AuthProvider>
            <CartProvider>
                <ChatProvider>
                    <NotificationProvider>
                        {children}
                        <Toaster position="bottom-left" richColors />
                        <Analytics />
                    </NotificationProvider>
                </ChatProvider>
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    )
}
