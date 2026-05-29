"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, loading } = useAuth()
  const router = useRouter()

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

      <p className="mt-6 text-sm text-[#526761]">
        Bạn mới sử dụng PetSitter?{" "}
        <Link href="/register" className="font-semibold text-[#b44735] transition hover:text-[#8b2e21]">
          Tạo tài khoản mới
        </Link>
      </p>
    </AuthShell>
  )
}
