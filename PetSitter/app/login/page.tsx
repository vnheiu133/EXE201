"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowRight, Chrome, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "1072689631714-n3g2r18i61723an44a4p84kkied06qf5.apps.googleusercontent.com"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black"
              size?: "large" | "medium" | "small"
              text?: "signin_with" | "signup_with" | "continue_with" | "signin"
              shape?: "rectangular" | "pill" | "circle" | "square"
              width?: number
            },
          ) => void
        }
      }
    }
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const { login, loginWithGoogle, loading } = useAuth()
  const router = useRouter()
  const googleRedirectUri =
    typeof window === "undefined" ? "http://localhost:5100/signin-google" : `${window.location.origin}/signin-google`

  useEffect(() => {
    const handleCredential = async (response: { credential?: string }) => {
      setError("")

      try {
        if (!response.credential) {
          throw new Error("Thiếu mã xác thực Google")
        }

        await loginWithGoogle(response.credential)
        router.push("/")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đăng nhập Google thất bại")
      }
    }

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return

      googleButtonRef.current.innerHTML = ""
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: 360,
      })
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client?hl=vi"]',
    )

    if (existingScript) {
      renderGoogleButton()
      return
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client?hl=vi"
    script.async = true
    script.defer = true
    script.onload = renderGoogleButton
    document.head.appendChild(script)
  }, [loginWithGoogle, router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    try {
      await login(email, password)
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email hoặc mật khẩu không chính xác")
    }
  }

  const handleGoogleRedirect = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: googleRedirectUri,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
    })

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  return (
    <AuthShell title="Chào mừng trở lại" description="Đăng nhập vào tài khoản PetSitter của bạn.">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div
            role="alert"
            className="flex gap-3 rounded-md border border-[#efb6ac] bg-[#fff0ec] px-4 py-3 text-sm text-[#8b2e21]"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-[#23443b]">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#687d76]" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="h-11 border-[#c9d7d0] bg-white pl-10 text-[#16312a] shadow-none placeholder:text-[#71857e]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-[#23443b]">
            Mật khẩu
          </Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#687d76]" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu của bạn"
              required
              className="h-11 border-[#c9d7d0] bg-white px-10 text-[#16312a] shadow-none placeholder:text-[#71857e]"
            />
            <button
              type="button"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#687d76] transition hover:text-[#16312a]"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full bg-[#1f6654] text-white shadow-sm hover:bg-[#184f41]"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-[#789088]">
        <span className="h-px flex-1 bg-[#d8e2de]" />
        <span>hoặc</span>
        <span className="h-px flex-1 bg-[#d8e2de]" />
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 w-full border-[#c9d7d0] bg-white text-[#16312a] shadow-none hover:bg-[#f7fbf8]"
          onClick={handleGoogleRedirect}
        >
          <Chrome className="size-4 text-[#b44735]" />
          Đăng nhập bằng Google
        </Button>
        <div className="sr-only" ref={googleButtonRef} />
      </div>

      <p className="mt-6 text-sm text-[#526761]">
        Bạn mới sử dụng PetSitter?{" "}
        <Link href="/register" className="font-semibold text-[#b44735] transition hover:text-[#8b2e21]">
          Tạo tài khoản mới
        </Link>
      </p>
    </AuthShell>
  )
}
