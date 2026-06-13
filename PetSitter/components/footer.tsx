import Link from "next/link"
import { Facebook, Mail, MapPin, PawPrint, Phone, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#16312a] text-white" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]" suppressHydrationWarning>
          <div className="max-w-sm" suppressHydrationWarning>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Trang chủ PetSitter">
              <span className="flex size-11 items-center justify-center rounded-md bg-[#e15c45] text-white">
                <PawPrint className="size-5" />
              </span>
              <span className="text-2xl font-semibold tracking-normal">PetSitter</span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-[#c9ddd4]">
              Dịch vụ thú cưng, nhu yếu phẩm hàng ngày và hỗ trợ tận tâm cho người nuôi thú cưng.
            </p>
          </div>

          <div suppressHydrationWarning>
            <h2 className="text-base font-semibold text-white">Khám phá</h2>
            <div className="mt-4 grid gap-2 text-sm text-[#c9ddd4]" suppressHydrationWarning>
              <Link href="/features" className="transition hover:text-white">
                Dịch vụ thú cưng
              </Link>
              <Link href="/shop" className="transition hover:text-white">
                Nhu yếu phẩm
              </Link>
              <Link href="/blog" className="transition hover:text-white">
                Bài viết
              </Link>
              <Link href="/contact" className="transition hover:text-white">
                Liên hệ
              </Link>
            </div>
          </div>

          <div suppressHydrationWarning>
            <h2 className="text-base font-semibold text-white">Mạng xã hội</h2>
            <div className="mt-4 grid gap-2 text-sm text-[#c9ddd4]" suppressHydrationWarning>
              <a
                href="https://www.facebook.com/fucapitalistcrew"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <Facebook className="size-4" />
                Facebook
              </a>
              <a href="#" className="inline-flex items-center gap-2 transition hover:text-white">
                <Twitter className="size-4" />
                X
              </a>
            </div>
          </div>

          <div suppressHydrationWarning>
            <h2 className="text-base font-semibold text-white">Liên hệ</h2>
            <div className="mt-4 grid gap-3 text-sm text-[#c9ddd4]" suppressHydrationWarning>
              <span className="inline-flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-[#ffd69f]" />
                0901 135 618
              </span>
              <span className="inline-flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-[#ffd69f]" />
                petsitter@gmail.com
              </span>
              <span className="inline-flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#ffd69f]" />
                Đà Nẵng, Việt Nam
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/12 pt-5 text-sm text-[#c9ddd4]" suppressHydrationWarning>
          Bản quyền © {new Date().getFullYear()} PetSitter. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  )
}
