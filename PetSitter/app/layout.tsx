import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "sonner"
import { ChatProvider } from "@/contexts/chat-context"

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
        <Script id="strip-extension-hydration-attrs" strategy="beforeInteractive">
            {`
              document.querySelectorAll('[bis_skin_checked]').forEach(function (element) {
                element.removeAttribute('bis_skin_checked');
              });
            `}
        </Script>
        <AuthProvider>
            <CartProvider>
                <ChatProvider>
                    {children}
                    <Toaster position="top-right" richColors />
                    <Analytics />
                </ChatProvider>
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    )
}
