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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Cosmic Elements */}
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-accent/10 blur-[150px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />

        <div className="container mx-auto px-4 z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            {/* Left Column: Text & Content */}
            <div className="flex-1 space-y-8 animate-slide-up text-center lg:text-left pt-10 lg:pt-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">The Stars Are Calling</span>
              </div>

              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-gradient leading-[0.9]">
                {t("hero_title")}
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed opacity-80 mx-auto lg:mx-0">
                {t("hero_subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center pt-4">
                <Link href="/search">
                  <Button size="lg" className="h-16 px-12 text-lg font-black bg-primary hover:bg-primary/90 text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(14,165,233,0.3)] rounded-[2rem] tracking-widest uppercase">
                    {t("cta_user")}
                  </Button>
                </Link>
                <Link href="/astrologer/signup">
                  <Button variant="outline" size="lg" className="h-16 px-12 text-lg font-bold border-primary/20 glass hover:bg-primary/5 transition-all rounded-[2rem] tracking-wide text-primary">
                    {t("cta_expert")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Mascot Image */}
            <div className="flex-1 relative w-full max-w-[600px] aspect-square animate-fade-in flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-[100px] -z-10" />
              <img
                src="/images/pandit_mascot.png"
                alt="3D Astrologer Pandit Mascot"
                className="w-full h-full object-contain drop-shadow-2xl animate-float"
                style={{ filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.15))" }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent -z-10" />
        <FeaturedAstrologers />
      </div>

      {/* Free Services Section */}
      <section className="py-32 container mx-auto px-4 relative">
        <header className="text-center mb-24 space-y-4 animate-slide-up">
          <h2 className="text-5xl font-black tracking-tight text-gradient">{t("tools_title")}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg opacity-60">
            {t("tools_subtitle")}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: t("horoscope_title"), desc: t("horoscope_desc"), icon: "✨", href: "/horoscope", color: "from-orange-500/20" },
            { title: t("matching_title"), desc: t("matching_desc"), icon: "💑", href: "/kundli-matching", color: "from-rose-500/20" },
            { title: t("panchang_title"), desc: t("panchang_desc"), icon: "📜", href: "/kundli", color: "from-amber-500/20" },
          ].map((service, i) => (
            <Link key={i} href={service.href} className="group h-full">
              <div className="relative p-10 lg:p-12 rounded-[3rem] bg-white/50 backdrop-blur-xl border border-white hover:border-orange-200 transition-all duration-500 h-full flex flex-col items-start overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-orange-500/10">
                <div className={`absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br ${service.color} blur-[80px] group-hover:blur-[60px] transition-all opacity-50 group-hover:opacity-80 rounded-full`} />

                <div className="text-6xl mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 drop-shadow-md">
                  {service.icon}
                </div>

                <h3 className="text-3xl font-black mb-4 tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors z-10">{service.title}</h3>
                <p className="text-slate-500 mb-10 leading-relaxed font-medium z-10">{service.desc}</p>

                <div className="mt-auto flex items-center gap-2 text-orange-600/50 group-hover:text-orange-600 font-black text-xs uppercase tracking-[0.2em] transition-all group-hover:gap-4 z-10 w-full">
                  <span className="bg-orange-50 group-hover:bg-orange-100 px-6 py-3 rounded-full transition-colors flex items-center gap-3">
                    Explore Now <span>→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 rounded-[3rem] p-12 md:p-20 text-center space-y-10 relative overflow-hidden shadow-2xl shadow-orange-500/20">
            {/* Decorative BG Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[50px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-[50px] rounded-full" />

            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-tight relative z-10">
              {t("cta_expert_title")}
            </h2>

            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium relative z-10">
              {t("cta_expert_subtitle")}
            </p>

            <div className="pt-4 relative z-10">
              <Link href="/astrologer/signup" className="inline-block">
                <Button size="lg" className="h-16 px-12 text-lg font-black bg-white text-orange-600 hover:bg-slate-50 hover:scale-105 rounded-[2rem] shadow-xl transition-all uppercase tracking-widest">
                  {t("cta_expert_button")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
