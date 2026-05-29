"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Eye,
  EyeOff,
  Landmark,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"
import { useCountries, useStates } from "@/components/api/location"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"

type RegisterRole = "user" | "shop"

const banks = [
  "Vietcombank",
  "VietinBank",
  "BIDV",
  "Agribank",
  "Techcombank",
  "ACB",
  "Sacombank",
  "MB Bank",
  "VPBank",
  "SHB",
  "TPBank",
  "Eximbank",
  "HDBank",
]

const roleOptions = [
  { value: "user", label: "Chủ thú cưng", icon: UserRound },
  { value: "shop", label: "Chủ cửa hàng", icon: Store },
] as const

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "user" as RegisterRole,
    dateOfBirth: "",
    country: "VN",
    state: "",
    address: "Việt Nam",
    shopName: "",
    description: "",
    bankName: "",
    bankNumber: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, loading } = useAuth()
  const router = useRouter()

  const { countries, error: countryError } = useCountries()
  const { states: availableStates, error: stateError } = useStates(formData.country)
  const hasSellerFields = formData.role === "shop"
  const selectedCountryName = countries.find((country) => country.iso2 === "VN")?.name || "Việt Nam"

  const handleInputChange = (field: string, value: string) => {
    setFormData((current) => {
      if (field === "role") {
        if (value === "shop") {
          return {
            ...current,
            role: "shop",
            country: "VN",
            state: "DN",
            address: "Đà Nẵng, Việt Nam",
          }
        }
        return {
          ...current,
          role: "user",
          country: "VN",
          state: "",
          address: selectedCountryName,
        }
      }

      const next = { ...current, country: "VN", [field]: value }

      if (field === "state") {
        const stateName = availableStates.find((state) => state.iso2 === value)?.name || ""
        next.address = [stateName, selectedCountryName].filter(Boolean).join(", ")
      }

      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (formData.password.length < 8) {
      setError("Mật khẩu phải chứa ít nhất 8 ký tự")
      return
    }

    if (!acceptTerms) {
      setError("Vui lòng chấp nhận điều khoản sử dụng tài khoản")
      return
    }

    if (!hasSellerFields && !formData.state) {
      setError("Vui lòng chọn tỉnh / thành phố")
      return
    }

    if (hasSellerFields && (!formData.shopName || !formData.description)) {
      setError("Tên và mô tả cửa hàng là bắt buộc khi đăng ký người bán")
      return
    }

    try {
      const submitData = hasSellerFields
        ? { ...formData, country: "VN", state: "DN", address: "Đà Nẵng, Việt Nam" }
        : { ...formData, country: "VN" }

      await register(submitData)
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại. Vui lòng thử lại.")
    }
  }

  return (
    <AuthShell
      title="Tạo tài khoản của bạn"
      description="Thiết lập tài khoản PetSitter phù hợp với nhu cầu sử dụng dịch vụ của bạn."
      contentClassName="max-w-2xl"
    >
      <form className="space-y-7" onSubmit={handleSubmit}>
        {error && (
          <div
            role="alert"
            className="flex gap-3 rounded-md border border-[#efb6ac] bg-[#fff0ec] px-4 py-3 text-sm text-[#8b2e21]"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-[#23443b]">
                Họ và tên
              </Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#687d76]" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Tên hiển thị của bạn"
                  value={formData.fullName}
                  onChange={(event) => handleInputChange("fullName", event.target.value)}
                  autoComplete="name"
                  required
                  className="h-11 border-[#c9d7d0] bg-white pl-10 text-[#16312a] shadow-none placeholder:text-[#71857e]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#23443b]">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#687d76]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(event) => handleInputChange("email", event.target.value)}
                  autoComplete="email"
                  required
                  className="h-11 border-[#c9d7d0] bg-white pl-10 text-[#16312a] shadow-none placeholder:text-[#71857e]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#23443b]">Loại tài khoản</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {roleOptions.map(({ value, label, icon: Icon }) => {
                const isSelected = formData.role === value

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleInputChange("role", value)}
                    className={`flex min-h-16 items-center gap-3 rounded-md border px-3 py-3 text-left text-sm font-medium transition ${
                      isSelected
                        ? "border-[#1f6654] bg-[#e3f0ea] text-[#16312a] shadow-sm"
                        : "border-[#c9d7d0] bg-white text-[#526761] hover:border-[#8cb2a4] hover:text-[#16312a]"
                    }`}
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
                        isSelected ? "bg-[#1f6654] text-white" : "bg-[#eef4ef] text-[#526761]"
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 leading-5">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-[#23443b]">
                Số điện thoại
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#687d76]" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Số điện thoại của bạn"
                  value={formData.phoneNumber}
                  onChange={(event) => handleInputChange("phoneNumber", event.target.value)}
                  autoComplete="tel"
                  required
                  className="h-11 border-[#c9d7d0] bg-white pl-10 text-[#16312a] shadow-none placeholder:text-[#71857e]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-[#23443b]">
                Ngày sinh
              </Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#687d76]" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(event) => handleInputChange("dateOfBirth", event.target.value)}
                  className="h-11 border-[#c9d7d0] bg-white pl-10 text-[#16312a] shadow-none [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-[#23443b]">
                Quốc gia
              </Label>
              <Select value={formData.country} disabled>
                <SelectTrigger id="country" className="h-11 w-full border-[#c9d7d0] bg-white shadow-none">
                  <SelectValue placeholder="Chọn quốc gia" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.iso2} value={country.iso2}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {countryError && <p className="text-xs text-[#8b2e21]">{countryError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium text-[#23443b]">
                Tỉnh / Thành phố
              </Label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleInputChange("state", value)}
                disabled={!formData.country || hasSellerFields}
              >
                <SelectTrigger id="state" className="h-11 w-full border-[#c9d7d0] bg-white shadow-none">
                  <SelectValue placeholder={formData.country ? "Chọn tỉnh / thành" : "Chọn quốc gia trước"} />
                </SelectTrigger>
                <SelectContent>
                  {availableStates.map((state) => (
                    <SelectItem key={state.iso2} value={state.iso2}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stateError && <p className="text-xs text-[#8b2e21]">{stateError}</p>}
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
                placeholder="Tạo mật khẩu"
                value={formData.password}
                onChange={(event) => handleInputChange("password", event.target.value)}
                autoComplete="new-password"
                minLength={8}
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
            <p className="flex items-center gap-2 text-sm text-[#526761]">
              <ShieldCheck className="size-4 shrink-0 text-[#1f6654]" />
              Sử dụng ít nhất 8 ký tự.
            </p>
          </div>
        </div>

        {hasSellerFields && (
          <div className="space-y-4 border-t border-[#d8e3dc] pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shopName" className="text-sm font-medium text-[#23443b]">
                  Tên cửa hàng
                </Label>
                <div className="relative">
                  <Store className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#687d76]" />
                  <Input
                    id="shopName"
                    type="text"
                    placeholder="Tên cửa hàng của bạn"
                    value={formData.shopName}
                    onChange={(event) => handleInputChange("shopName", event.target.value)}
                    required
                    className="h-11 border-[#c9d7d0] bg-white pl-10 text-[#16312a] shadow-none placeholder:text-[#71857e]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-[#23443b]">
                  Mô tả cửa hàng
                </Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#687d76]" />
                  <Input
                    id="description"
                    type="text"
                    placeholder="Giới thiệu ngắn về cửa hàng"
                    value={formData.description}
                    onChange={(event) => handleInputChange("description", event.target.value)}
                    required
                    className="h-11 border-[#c9d7d0] bg-white pl-10 text-[#16312a] shadow-none placeholder:text-[#71857e]"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-sm font-medium text-[#23443b]">
                  Tên ngân hàng
                </Label>
                <Select value={formData.bankName} onValueChange={(value) => handleInputChange("bankName", value)}>
                  <SelectTrigger id="bankName" className="h-11 w-full border-[#c9d7d0] bg-white shadow-none">
                    <SelectValue placeholder="Chọn ngân hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankNumber" className="text-sm font-medium text-[#23443b]">
                  Tài khoản ngân hàng
                </Label>
                <div className="relative">
                  <Landmark className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#687d76]" />
                  <Input
                    id="bankNumber"
                    type="text"
                    placeholder="Số tài khoản"
                    value={formData.bankNumber}
                    onChange={(event) => handleInputChange("bankNumber", event.target.value)}
                    required
                    className="h-11 border-[#c9d7d0] bg-white pl-10 text-[#16312a] shadow-none placeholder:text-[#71857e]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5 border-t border-[#d8e3dc] pt-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              className="mt-0.5 border-[#8cb2a4] data-[state=checked]:border-[#1f6654] data-[state=checked]:bg-[#1f6654]"
            />
            <Label htmlFor="terms" className="text-sm leading-6 text-[#526761]">
              Tôi đồng ý với các điều khoản sử dụng dịch vụ.
            </Label>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full bg-[#1f6654] text-white shadow-sm hover:bg-[#184f41]"
            disabled={loading || !acceptTerms}
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            {!loading && <ArrowRight className="size-4" />}
          </Button>

          <p className="text-sm text-[#526761]">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-[#b44735] transition hover:text-[#8b2e21]">
              Đăng nhập
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  )
}
