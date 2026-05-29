"use client"

import type React from "react"

import { useState } from "react"
import { Clock3, Mail, MapPin, Phone, Send } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const faqs = [
  {
    question: "Mất bao lâu để nhận được phản hồi?",
    answer: "PetSitter thường phản hồi trong vòng 24 giờ vào các ngày làm việc.",
  },
  {
    question: "Cửa hàng có cung cấp dịch vụ thú y khẩn cấp không?",
    answer: "Chúng tôi hỗ trợ kết nối với các dịch vụ chăm sóc khẩn cấp. Vui lòng gọi hotline để được hỗ trợ nhanh nhất.",
  },
  {
    question: "Tôi có thể hỏi về đơn hàng và đặt lịch dịch vụ tại đây không?",
    answer: "Có. Hãy gửi tin nhắn cùng thông tin chi tiết đơn hàng hoặc lịch đặt để đội ngũ hỗ trợ trực tiếp giải quyết giúp bạn.",
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    })
    alert("Cảm ơn tin nhắn của bạn. PetSitter sẽ phản hồi sớm nhất có thể.")
  }

  const handleChange = (field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <PageHero
        eyebrow="Liên hệ PetSitter"
        title="Trao đổi về chăm sóc, đơn hàng hoặc đặt lịch với chúng tôi"
        description="Gửi thông tin của bạn bên dưới hoặc sử dụng các kênh liên hệ trực tiếp để nhận sự hỗ trợ bạn cần."
        imageSrc="/person-caring-for-dogs.png"
        imageAlt="Người chăm sóc thú cưng cùng các chú chó"
        imageClassName="object-[center_54%]"
      />

      <main className="bg-[#f3f7f2]">
        <div className="mx-auto grid max-w-6xl gap-7 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:px-8">
          <aside className="space-y-4">
            <ContactInfoCard
              icon={Phone}
              title="Điện thoại"
              description="Gọi cho chúng tôi để được hỗ trợ ngay lập tức."
              lines={["0901 135 618", "T2 - T6: 8:00 - 20:00"]}
            />
            <ContactInfoCard
              icon={Mail}
              title="Email"
              description="Gửi email cho chúng tôi bất cứ lúc nào."
              lines={["petsitter@gmail.com", "Phản hồi trong vòng 24 giờ"]}
            />
            <ContactInfoCard
              icon={MapPin}
              title="Địa chỉ"
              description="Ghé thăm văn phòng của chúng tôi."
              lines={["Đại học FPT", "Ngũ Hành Sơn, Đà Nẵng, Việt Nam"]}
            />

            <section className="rounded-lg border border-[#4f5854] bg-[#505955] p-5 text-white shadow-[0_14px_34px_rgba(22,49,42,0.18)]">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/14 text-white">
                  <Clock3 className="size-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">Giờ làm việc</h2>
                  <div className="mt-4 grid gap-2 text-sm text-[#eef5f0]">
                    <BusinessHour day="Thứ Hai - Thứ Sáu" time="8:00 - 20:00" />
                    <BusinessHour day="Thứ Bảy" time="9:00 - 18:00" />
                    <BusinessHour day="Chủ Nhật" time="9:00 - 18:00" />
                  </div>
                </div>
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            <section className="rounded-lg border border-[#e2e9e3] bg-[#edf2ee] p-5 shadow-[0_1px_2px_rgba(22,49,42,0.04)] sm:p-8">
              <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold text-[#005947] sm:text-3xl">Gửi tin nhắn cho chúng tôi</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#51665f]">
                  Vui lòng điền thông tin bên dưới và chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <ContactField label="Họ và tên *" htmlFor="name">
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nhập họ và tên của bạn"
                      value={formData.name}
                      onChange={(event) => handleChange("name", event.target.value)}
                      required
                      className="h-11 bg-white"
                    />
                  </ContactField>
                  <ContactField label="Địa chỉ email *" htmlFor="email">
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                      required
                      className="h-11 bg-white"
                    />
                  </ContactField>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ContactField label="Số điện thoại" htmlFor="phone">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={(event) => handleChange("phone", event.target.value)}
                      className="h-11 bg-white"
                    />
                  </ContactField>
                  <ContactField label="Chủ đề *" htmlFor="subject">
                    <Select value={formData.subject} onValueChange={(value) => handleChange("subject", value)}>
                      <SelectTrigger id="subject" className="h-11 w-full bg-white">
                        <SelectValue placeholder="Chọn chủ đề" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Câu hỏi chung</SelectItem>
                        <SelectItem value="services">Dịch vụ chăm sóc</SelectItem>
                        <SelectItem value="products">Hỗ trợ sản phẩm</SelectItem>
                        <SelectItem value="booking">Hỗ trợ đặt lịch</SelectItem>
                        <SelectItem value="complaint">Phản hồi dịch vụ</SelectItem>
                        <SelectItem value="other">Yêu cầu khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </ContactField>
                </div>

                <ContactField label="Tin nhắn *" htmlFor="message">
                  <Textarea
                    id="message"
                    placeholder="Chúng tôi có thể giúp gì cho bạn?"
                    rows={5}
                    value={formData.message}
                    onChange={(event) => handleChange("message", event.target.value)}
                    required
                    className="min-h-32 resize-y bg-white"
                  />
                </ContactField>

                <Button type="submit" size="lg" className="mt-2 h-12 w-full bg-[#005947] text-white hover:bg-[#004738]">
                  <Send className="size-4" />
                  Gửi tin nhắn
                </Button>
              </form>
            </section>

            <section className="rounded-lg border border-[#e2e9e3] bg-white p-5 shadow-[0_14px_34px_rgba(22,49,42,0.06)] sm:p-8">
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <h2 className="text-2xl font-semibold text-[#16312a]">Câu hỏi thường gặp</h2>
                <span className="text-sm font-semibold text-[#1f6654]">Xem tất cả</span>
              </div>

              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`} className="border-[#e4ebe5]">
                    <AccordionTrigger className="py-4 text-[#23443b] hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="leading-6 text-[#526761]">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function ContactField({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-[#23443b]">
        {label}
      </Label>
      {children}
    </div>
  )
}

function ContactInfoCard({
  icon: Icon,
  title,
  description,
  lines,
}: {
  icon: typeof Phone
  title: string
  description: string
  lines: string[]
}) {
  return (
    <section className="rounded-lg border border-[#e2e9e3] bg-white p-5 shadow-[0_10px_28px_rgba(22,49,42,0.08)]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#e5f0ec] text-[#005947]">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-[#005947]">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-[#526761]">{description}</p>
          <div className="mt-3 space-y-1">
            {lines.map((line, index) => (
              <p key={line} className={index === 0 ? "font-semibold text-[#16312a]" : "text-sm text-[#687d76]"}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function BusinessHour({ day, time }: { day: string; time: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3">
      <span>{day}</span>
      <span className="font-semibold">{time}</span>
    </div>
  )
}
