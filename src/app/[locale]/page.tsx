"use client";

import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { FeaturedAstrologers } from "@/components/home/FeaturedAstrologers";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const t = useTranslations("Index");

  return (
    <main className="min-h-screen bg-transparent overflow-hidden selection:bg-primary/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 min-h-[75vh] flex items-center justify-center overflow-hidden">
        {/* Background Cosmic Elements */}
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-accent/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />

        <div className="container mx-auto px-4 z-10 text-center space-y-8 animate-slide-up">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">The Stars Are Calling</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gradient leading-[1.1]">
              {t("hero_title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
              {t("hero_subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/search">
              <Button size="lg" className="h-16 px-12 text-lg font-black bg-primary hover:bg-primary/90 text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(14,165,233,0.3)] rounded-[2rem] tracking-widest uppercase">
                {t("cta_user")}
              </Button>
            </Link>
            <Link href="/astrologer/signup">
              <Button variant="outline" size="lg" className="h-16 px-12 text-lg font-bold border-primary/10 glass hover:bg-primary/5 transition-all rounded-[2rem] tracking-wide text-primary">
                {t("cta_expert")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent -z-10" />
        <FeaturedAstrologers />
      </div>

      {/* Free Services Section */}
      <section className="py-16 md:py-20 container mx-auto px-4 relative">
        <header className="text-center mb-12 space-y-3 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gradient">{t("tools_title")}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg opacity-80">
            {t("tools_subtitle")}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { title: t("horoscope_title"), desc: t("horoscope_desc"), icon: "♈", href: "/horoscope", color: "from-primary/20" },
            { title: t("matching_title"), desc: t("matching_desc"), icon: "💑", href: "/kundli-matching", color: "from-accent/20" },
            { title: t("panchang_title"), desc: t("panchang_desc"), icon: "📜", href: "/kundli", color: "from-sky-500/20" },
          ].map((service, i) => (
            <Link key={i} href={service.href} className="group h-full">
              <div className="relative p-8 rounded-[2.5rem] glass hover:border-primary/30 transition-all duration-500 h-full flex flex-col items-start overflow-hidden">
                <div className={`absolute -top-16 -left-16 w-32 h-32 bg-gradient-to-br ${service.color} blur-[60px] group-hover:blur-[40px] transition-all opacity-50`} />

                <div className="text-4xl mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-primary/5 shadow-inner">
                  {service.icon}
                </div>
                <h3 className="text-xl font-black mb-3 tracking-tight group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm opacity-80 group-hover:opacity-100 transition-opacity">{service.desc}</p>
                <div className="mt-auto flex items-center gap-2 text-primary/60 group-hover:text-primary font-bold text-xs uppercase tracking-[0.2em] transition-all group-hover:gap-3">
                  Ascend Now <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
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
