import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface PageHeroProps {
  eyebrow: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  children?: ReactNode
  className?: string
  imageClassName?: string
}

export function PageHero({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  children,
  className,
  imageClassName,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate min-h-[28rem] overflow-hidden border-b border-[#d9e4dd] bg-[#16312a] text-white",
        className
      )}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className={cn("absolute inset-0 z-0 h-full w-full object-cover object-center contrast-[1.03] saturate-[1.05]", imageClassName)}
      />
      <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(9,29,24,0.76)_0%,rgba(9,29,24,0.55)_40%,rgba(9,29,24,0.2)_72%,rgba(9,29,24,0.08)_100%)]" />
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.11)_0%,rgba(22,49,42,0)_28%,rgba(10,28,24,0.48)_100%)]" />

      <div className="relative z-20 mx-auto flex min-h-[28rem] w-full max-w-7xl items-end px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-md border border-white/24 bg-white/14 px-3 py-1 text-sm font-semibold text-[#ffe2ba] shadow-sm backdrop-blur-sm">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-white [text-shadow:0_2px_24px_rgba(4,18,14,0.42)] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#f4f7f5] [text-shadow:0_1px_14px_rgba(4,18,14,0.44)] sm:text-lg">
            {description}
          </p>
          {children && <div className="mt-7">{children}</div>}
        </div>
      </div>
    </section>
  )
}
