"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

function GoogleSigninContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { loginWithGoogleCode } = useAuth()
  const [error, setError] = useState("")
  const processedCodeRef = useRef<string | null>(null)

  useEffect(() => {
    const code = searchParams.get("code")
    const googleError = searchParams.get("error")

    if (googleError) {
      setError("Google đã hủy hoặc từ chối đăng nhập.")
      return
    }

    if (!code) {
      setError("Không nhận được mã đăng nhập Google.")
      return
    }

    if (processedCodeRef.current === code) {
      return
    }
    processedCodeRef.current = code

    loginWithGoogleCode(code, `${window.location.origin}/signin-google`)
      .then(() => router.replace("/"))
      .catch((err) => {
        processedCodeRef.current = null
        setError(err instanceof Error ? err.message : "Đăng nhập Google thất bại")
      })
  }, [loginWithGoogleCode, router, searchParams])

  return (
    <AuthShell
      title={error ? "Đăng nhập Google thất bại" : "Đang đăng nhập Google"}
      description={error ? "Vui lòng thử lại hoặc đăng nhập bằng email và mật khẩu." : "PetSitter đang xác thực tài khoản Google của bạn."}
    >
      {error ? (
        <div className="space-y-4">
          <div className="rounded-md border border-[#efb6ac] bg-[#fff0ec] px-4 py-3 text-sm text-[#8b2e21]">
            {error}
          </div>
          <Button asChild className="w-full bg-[#1f6654] text-white hover:bg-[#184f41]">
            <Link href="/login">Quay lại đăng nhập</Link>
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-md border border-[#c9d7d0] bg-white px-4 py-3 text-[#526761]">
          <Loader2 className="size-5 animate-spin text-[#1f6654]" />
          <span>Đang xử lý đăng nhập...</span>
        </div>
      )}
    </AuthShell>
  )
}

export default function GoogleSigninPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Đang đăng nhập Google"
          description="PetSitter đang chuẩn bị xác thực tài khoản Google của bạn."
        >
          <div className="flex items-center gap-3 rounded-md border border-[#c9d7d0] bg-white px-4 py-3 text-[#526761]">
            <Loader2 className="size-5 animate-spin text-[#1f6654]" />
            <span>Đang tải...</span>
          </div>
        </AuthShell>
      }
    >
      <GoogleSigninContent />
    </Suspense>
  )
}
