import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { PawPrint } from "lucide-react"

import { cn } from "@/lib/utils"

interface AuthShellProps {
  title: string
  description: string
  children: ReactNode
  contentClassName?: string
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="Trang chủ PetSitter">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-[#e15c45] text-white shadow-sm",
          compact ? "size-9" : "size-11"
        )}
      >
        <PawPrint className={compact ? "size-4" : "size-5"} />
      </span>
      <span className={cn("font-semibold tracking-normal", compact ? "text-lg" : "text-xl")}>PetSitter</span>
    </Link>
  )
}

export function AuthShell({ title, description, children, contentClassName }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f5f8f3] text-[#16312a]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(24rem,0.9fr)_minmax(0,1fr)]">
        <section className="relative isolate min-h-[15rem] min-w-0 overflow-hidden bg-[#16312a] sm:min-h-[18rem] lg:min-h-screen">
          <Image
            src="/woman-laptop-dog.png"
            alt="Người chăm sóc đang làm việc bên cạnh thú cưng"
            fill
            priority
            sizes="(max-width: 1024px) 45vw, 100vw"
            className="z-0 object-cover object-center contrast-[1.03] saturate-[1.04]"
          />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(18,49,42,0.1)_0%,rgba(18,49,42,0.28)_40%,rgba(18,49,42,0.82)_100%)]" />

          <div className="relative z-20 flex h-full min-h-[15rem] flex-col justify-between p-5 text-white sm:min-h-[18rem] sm:p-8 lg:min-h-screen lg:p-10">
            <BrandMark />

            <div className="max-w-sm pb-2">
              <p className="text-sm font-medium text-[#ffe0b9]">Chăm sóc thú cưng uy tín</p>
              <p className="mt-3 text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl">
                Nơi gửi gắm niềm tin trọn vẹn.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-30 flex min-w-0 items-center justify-center bg-[#f5f8f3] px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
          <div className={cn("w-full max-w-md", contentClassName)}>
            <div className="mb-8">
              <div className="mb-6 text-[#16312a] lg:hidden">
                <BrandMark compact />
              </div>
              <h1 className="text-3xl font-semibold leading-tight tracking-normal text-[#16312a] sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#526761] sm:text-base">{description}</p>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  )
}
