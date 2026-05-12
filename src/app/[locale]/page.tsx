import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { FeaturedAstrologers } from "@/components/home/FeaturedAstrologers";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sarvagya } from "@/components/ai/Sarvagya";

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Index" });

  const tools = [
    { title: t("horoscope_title"), desc: t("horoscope_desc"), icon: "♈", href: "/horoscope", color: "from-primary/20" },
    { title: t("matching_title"), desc: t("matching_desc"), icon: "💑", href: "/kundli/matching", color: "from-accent/20" },
    { title: t("panchang_title"), desc: t("panchang_desc"), icon: "📜", href: "/kundli", color: "from-sky-500/20" },
  ];

  return (
    <main className="min-h-screen bg-transparent overflow-hidden selection:bg-primary/30">
      <Navbar />

      <Hero />

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent -z-10" />
        <FeaturedAstrologers />
      </div>

      <section className="py-6 md:py-10 container mx-auto px-4 relative">
        <header className="text-center mb-6 space-y-1 animate-slide-up">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gradient">{t("tools_title")}</h2>
          <p className="text-muted-foreground max-w-sm mx-auto text-[10px] md:text-xs font-medium uppercase tracking-wider opacity-80">
            {t("tools_subtitle")}
          </p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 max-w-4xl mx-auto">
          {tools.map((service, i) => (
            <Link key={i} href={service.href} className="group h-full">
              <div className="relative p-3 md:p-4 rounded-xl glass hover:border-accent/30 transition-all duration-300 h-full flex flex-col items-center text-center overflow-hidden border border-white/5 hover:-translate-y-1 shadow-md shadow-black/20">
                <div className={`absolute -top-10 -left-10 w-16 h-16 bg-gradient-to-br ${service.color} blur-[30px] opacity-30`} />

                <div className="text-lg md:text-xl mb-2 group-hover:scale-110 transition-transform duration-500 bg-white/5 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center border border-white/10 shadow-inner">
                  {service.icon}
                </div>
                <h3 className="text-[12px] md:text-sm font-black mb-0.5 group-hover:text-primary transition-colors leading-tight">{service.title}</h3>
                <p className="text-muted-foreground leading-tight text-[8px] md:text-[10px] line-clamp-1 opacity-60">{service.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Sarvagya />

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-3xl -z-10" />
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-gradient leading-tight">
            {t("cta_expert_title")}
          </h2>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto leading-relaxed font-medium">
            {t("cta_expert_subtitle")}
          </p>
          <Link href="/astrologer/signup" className="inline-block">
            <Button size="lg" className="h-16 px-12 text-lg font-black orange-gradient text-white rounded-[2rem] shadow-2xl shadow-primary/20 hover:scale-105 transition-transform">
              {t("cta_expert_button")}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
