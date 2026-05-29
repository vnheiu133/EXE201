import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react"

import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const services = [
  {
    title: "Trông giữ thú cưng",
    description: "Chăm sóc và ghé thăm nhà chu đáo khi chủ nuôi đi vắng.",
    image: "/pet-sitter-dog.png",
  },
  {
    title: "Dắt chó đi dạo",
    description: "Dạo chơi hàng ngày giúp duy trì thói quen vận động ổn định.",
    image: "/person-walking-dog.png",
  },
  {
    title: "Tắm rửa & Cắt tỉa",
    description: "Dịch vụ làm đẹp sạch sẽ, nhẹ nhàng cho thú cưng.",
    image: "/woman-grooming-dog.png",
  },
  {
    title: "Taxi thú cưng",
    description: "Vận chuyển an toàn cho các chuyến thăm khám và cuộc hẹn.",
    image: "/pet-taxi.png",
  },
]

const bookingSteps = [
  {
    title: "Chọn dịch vụ phù hợp",
    description: "So sánh các dịch vụ, thông tin người chăm sóc và lưu ý.",
    icon: UsersRound,
  },
  {
    title: "Đặt lịch hẹn",
    description: "Lựa chọn thời gian phù hợp cho cả bạn và thú cưng.",
    icon: Clock3,
  },
  {
    title: "Đặt dịch vụ an tâm",
    description: "Hoàn tất quyết định dịch vụ và sản phẩm trong một quy trình rõ ràng.",
    icon: ShieldCheck,
  },
]

const journalPosts = [
  {
    title: "Thói quen huấn luyện giúp cún con vào nếp dễ dàng hơn",
    image: "/puppy-training.png",
  },
  {
    title: "Cách giúp mèo nuôi trong nhà luôn năng động và thoải mái",
    image: "/happy-indoor-cat.png",
  },
  {
    title: "Lưu ý về thức ăn và chăm sóc thú cưng khi chuyển mùa",
    image: "/pet-winter-care.png",
  },
]

const reviews = [
  {
    name: "Hồng Hạnh",
    text: "Lịch trình dắt chó đi dạo luôn đúng giờ và tôi có thể cảm nhận được sự tận tâm trong mỗi cập nhật.",
    avatar: "/diverse-woman-smiling.png",
  },
  {
    name: "Minh Tuấn",
    text: "Đặt lịch tắm rửa và tìm mua nhu yếu phẩm hàng ngày giờ đây tiện lợi hơn bao giờ hết.",
    avatar: "/smiling-man.png",
  },
  {
    name: "Lan Anh",
    text: "Thông tin chi tiết về người chăm sóc rất rõ ràng giúp tôi dễ dàng lựa chọn.",
    avatar: "/happy-woman.png",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <PageHero
        eyebrow="Dịch vụ & phụ kiện thú cưng"
        title="Chăm sóc chu đáo, an tâm mọi lúc"
        description="Đặt lịch dịch vụ uy tín, tìm phụ kiện thiết thực và quản lý mọi nhu cầu của thú cưng tại một nơi chuyên nghiệp."
        imageSrc="/woman-dog-beach-training.png"
        imageAlt="Người nuôi đang huấn luyện chó ngoài trời"
        imageClassName="object-[center_62%]"
        className="min-h-[36rem]"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-11 bg-[#e15c45] px-6 text-white hover:bg-[#c94c37]">
            <Link href="/features">
              Khám phá dịch vụ
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 border-white/60 bg-white/14 px-6 text-white shadow-none backdrop-blur-sm hover:bg-white hover:text-[#16312a]"
          >
            <Link href="/shop">Mua sắm phụ kiện</Link>
          </Button>
        </div>
      </PageHero>

      <section className="bg-white border-y border-[#dce6df] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          {[
            ["500+", "Khách hàng hài lòng"],
            ["24/7", "Hỗ trợ liên tục"],
            ["1000+", "Chăm sóc hoàn thành"],
          ].map(([value, label], idx) => (
            <div
              key={label}
              className={`flex flex-col justify-center items-center text-center px-6 ${
                idx < 2 ? "md:border-r md:border-[#dce6df]" : ""
              }`}
            >
              <p className="text-4xl md:text-5xl font-extrabold text-[#16312a] tracking-tight">{value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#687d76]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-18 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase text-[#b44735]">Chăm sóc mỗi ngày</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#16312a] sm:text-4xl">
                Dịch vụ tạo dựng niềm tin bền vững
              </h2>
            </div>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/features">
                Xem tất cả dịch vụ
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <Card
                key={service.title}
                className="group gap-0 overflow-hidden py-0 transition duration-300 hover:-translate-y-0.5 hover:border-[#bfd1c8] hover:shadow-[0_18px_46px_rgba(22,49,42,0.14)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#edf3ee]">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover contrast-[1.03] transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <CardContent className="p-5">
                  <h3 className="text-xl font-semibold text-[#16312a]">{service.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#526761]">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f0f5ef] py-18 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:px-8">
          <div className="relative overflow-hidden rounded-lg border border-white/80 bg-white shadow-[0_22px_58px_rgba(22,49,42,0.14)]">
            <div className="relative aspect-[5/4]">
              <Image
                src="/veterinarian-examining-pet.png"
                alt="Chuyên viên y tế đang kiểm tra sức khỏe thú cưng"
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover contrast-[1.03]"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase text-[#b44735]">Về PetSitter</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#16312a] sm:text-4xl">
              Tiêu chuẩn chăm sóc cao, lựa chọn dễ dàng
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#526761]">
              Chăm sóc thú cưng tốt dựa trên sự tin tưởng, tận tâm và đúng giờ. PetSitter mang lại góc nhìn trực quan để bạn dễ dàng so sánh và đưa ra quyết định nhanh chóng.
            </p>
            <div className="mt-7 grid gap-3">
              {[
                "Thông tin người chăm sóc rõ ràng, dễ đối chiếu",
                "Hỗ trợ đặt lịch, mua hàng và giải đáp thắc mắc dịch vụ",
                "Quy trình chăm sóc tối ưu cho cuộc sống bận rộn",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-[#23443b]">
                  <CheckCircle2 className="size-5 shrink-0 text-[#1f6654]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Button asChild className="mt-8">
              <Link href="/contact">Trò chuyện với đội ngũ</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#16312a] py-18 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold uppercase text-[#ffd69f]">Quy trình đặt lịch</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">3 bước đơn giản để thú cưng được chăm sóc</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {bookingSteps.map(({ title, description, icon: Icon }, index) => (
              <div
                key={title}
                className="bg-[#1c3c33]/45 border border-white/8 rounded-2xl p-8 hover:bg-[#1c3c33]/70 hover:-translate-y-1 transition-all duration-300 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-bold text-[#ffd69f]/90">0{index + 1}</span>
                    <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#ffd69f] shadow-inner">
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-sm leading-relaxed text-[#c8dcd0]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-18 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="flex flex-col justify-between gap-7">
            <div>
              <p className="text-sm font-semibold uppercase text-[#b44735]">Vận động mỗi ngày</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#16312a]">Những chuyến dạo chơi thong thả</h2>
              <p className="mt-4 max-w-xl leading-7 text-[#526761]">
                Một chuyến đi dạo chất lượng giúp thú cưng giải phóng năng lượng, vui vẻ và khỏe mạnh. Người chăm sóc luôn tập trung hoàn toàn vào bé để đảm bảo sự an toàn tối đa.
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/features">Tìm dịch vụ dắt chó đi dạo</Link>
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-[#dce6df] bg-white shadow-[0_18px_46px_rgba(22,49,42,0.12)]">
            <div className="relative aspect-[16/10]">
              <Image
                src="/happy-dog-park-run.png"
                alt="Chó chạy nhảy vui vẻ ngoài công viên"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover contrast-[1.03]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7efe5] py-18 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="relative overflow-hidden rounded-lg bg-[#d8e3dc] shadow-[0_18px_46px_rgba(22,49,42,0.12)]">
            <div className="relative aspect-[4/5] max-h-[38rem]">
              <Image
                src="/pet-grooming-service.png"
                alt="Thú cưng được chăm sóc tắm cắt tỉa"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover contrast-[1.03]"
              />
            </div>
          </div>

          <div>
            <div className="flex size-11 items-center justify-center rounded-md bg-[#1f6654] text-white">
              <HeartHandshake className="size-5" />
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-[#16312a] sm:text-4xl">
              Cắt tỉa & tắm rửa ưu tiên an toàn, kiên nhẫn
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                [Award, "Chăm sóc chuẩn chuyên nghiệp"],
                [ShieldCheck, "Thiết bị vệ sinh sạch sẽ"],
                [Clock3, "Thời gian chính xác"],
                [HeartHandshake, "Nâng niu, nhẹ nhàng"],
              ].map(([Icon, label]) => (
                <div key={label as string} className="flex items-center gap-3 border-t border-[#dfceb8] pt-4 text-[#23443b]">
                  <Icon className="size-5 shrink-0 text-[#b44735]" />
                  <span className="font-medium">{label as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-18 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-[#b44735]">Góc chia sẻ</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#16312a] sm:text-4xl">Kiến thức chăm sóc thú cưng bổ ích</h2>
            </div>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/blog">Khám phá bài viết</Link>
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {journalPosts.map((post) => (
              <Link key={post.title} href="/blog" className="group block">
                <Card className="gap-0 overflow-hidden py-0 transition duration-300 group-hover:-translate-y-0.5 group-hover:border-[#bfd1c8] group-hover:shadow-[0_18px_46px_rgba(22,49,42,0.14)]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#edf3ee]">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover contrast-[1.03] transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-semibold text-[#16312a]">{post.title}</h3>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1f6654]">
                      Đọc bài viết
                      <ArrowRight className="size-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#dce6df] bg-white py-18 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-9 max-w-2xl">
            <p className="text-sm font-semibold uppercase text-[#b44735]">Ý kiến khách hàng</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#16312a]">Lựa chọn mang lại sự an tâm tuyệt đối</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.name} className="h-full">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-5 flex text-yellow-400">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className="size-4 fill-current" />
                    ))}
                  </div>
                  <p className="flex-1 leading-7 text-[#526761]">{review.text}</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-[#e0e8e2] pt-5">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      width={48}
                      height={48}
                      className="size-12 rounded-md object-cover"
                    />
                    <p className="font-semibold text-[#16312a]">{review.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e9d2ae] py-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold text-[#16312a]">Chăm sóc thú cưng dễ dàng, trọn vẹn</h2>
            <p className="mt-3 text-[#314b43]">
              Duyệt sản phẩm, xem lưu ý chăm sóc và liên hệ hỗ trợ nhanh chóng thông qua giao diện trực quan, đồng bộ.
            </p>
          </div>
          <Button asChild size="lg" className="h-11 bg-[#16312a] px-6 text-white hover:bg-[#10241f]">
            <Link href="/shop">Ghé cửa hàng</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
