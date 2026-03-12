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
      <section className="py-6 md:py-10 container mx-auto px-4 relative">
        <header className="text-center mb-6 space-y-1 animate-slide-up">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gradient">{t("tools_title")}</h2>
          <p className="text-muted-foreground max-w-sm mx-auto text-[10px] md:text-xs font-medium uppercase tracking-wider opacity-80">
            {t("tools_subtitle")}
          </p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {[
            { title: t("horoscope_title"), desc: t("horoscope_desc"), icon: "♈", href: "/horoscope", color: "from-primary/20" },
            { title: t("matching_title"), desc: t("matching_desc"), icon: "💑", href: "/kundli-matching", color: "from-accent/20" },
            { title: t("panchang_title"), desc: t("panchang_desc"), icon: "📜", href: "/kundli", color: "from-sky-500/20" },
          ].map((service, i) => (
            <Link key={i} href={service.href} className="group h-full">
              <div className="relative p-4 md:p-5 rounded-2xl glass hover:border-primary/40 transition-all duration-300 h-full flex flex-col items-center text-center overflow-hidden border border-slate-100/50 hover:-translate-y-1">
                <div className={`absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br ${service.color} blur-[40px] group-hover:blur-[25px] transition-all opacity-30`} />

                <div className="text-xl md:text-2xl mb-3 group-hover:scale-110 transition-transform duration-500 bg-primary/5 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border border-primary/5 shadow-inner">
                  {service.icon}
                </div>
                <h3 className="text-sm font-black mb-1 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-muted-foreground leading-tight text-[9px] line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity">{service.desc}</p>
                <div className="mt-3 flex items-center gap-1.5 text-primary/80 font-black text-[8px] uppercase tracking-widest scale-90 group-hover:scale-100 transition-all">
                  Try Now <span>→</span>
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
