import Link from "next/link";
import Image from "next/image";
import { getEbooks, getCategories } from "@/lib/strapi";
import { EbookCard } from "@/components/catalog/EbookCard";
import { Button } from "@/components/ui/button";
import { HeroDecorations } from "@/components/HeroDecorations";
import {
  ArrowRight, BookOpen, ShieldCheck, Download, Star,
  CheckCircle2, Clock, Users, Sparkles, FileText,
  GraduationCap, Heart, Zap, Trophy,
} from "lucide-react";
import type { Ebook, Category } from "@/types";

export default async function HomePage() {
  const [ebooksRes, categories] = await Promise.all([
    getEbooks({ featured: true, pageSize: 3 }).catch(() => ({
      data: [] as Ebook[],
      meta: { pagination: { total: 0, page: 1, pageSize: 3, pageCount: 0 } },
    })),
    getCategories().catch(() => [] as Category[]),
  ]);

  const featuredEbooks = ebooksRes.data;

  return (
    <>
      {/* ─── HERO ─── */}
      <section
        className="relative min-h-[calc(100vh-64px)] overflow-hidden"
        style={{
          backgroundColor: "#FDF5EC",
          backgroundImage:
            "linear-gradient(to bottom, #FFF8F0 0%, #FFF3E0 56%, #F0D9BD 56%, #E5C49D 100%)",
        }}
      >
        <HeroDecorations />
        <div className="container mx-auto flex min-h-[calc(100vh-64px)] flex-col items-center gap-12 px-4 py-16 md:flex-row md:gap-8 md:py-0">

          {/* ── Left: text content ── */}
          <div className="relative z-10 flex flex-1 flex-col items-start justify-center">
            <div className="animate-slide-up mb-4">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: "#7BC44C" }}
              >
                <Zap className="h-3.5 w-3.5" />
                mądrze, prosto i z sercem
              </span>
            </div>

            <h1
              className="animate-slide-up mb-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-6xl"
              style={{ animationDelay: "0.1s" }}
            >
              Profesjonalne ebooki{" "}
              <span className="relative inline-block whitespace-nowrap" style={{ color: "#F5A623" }}>
                dla żłobków
                <svg className="absolute -bottom-1 left-0 w-full" height="5" viewBox="0 0 300 5" fill="none">
                  <path d="M0 2.5 Q75 0 150 2.5 Q225 5 300 2.5" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
                </svg>
              </span>
            </h1>

            <p
              className="animate-slide-up mb-8 max-w-lg text-lg text-gray-600 leading-relaxed"
              style={{ animationDelay: "0.2s" }}
            >
              Gotowe procedury, regulaminy i dokumenty dla opiekunów małych dzieci —
              stworzone przez ekspertów. Pobierz, wydrukuj, wdróż — już dziś.
            </p>

            <div
              className="animate-slide-up flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "0.3s" }}
            >
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full px-8 text-base font-semibold text-white shadow-xl transition-all hover:scale-105"
                style={{ backgroundColor: "#F5A623", boxShadow: "0 8px 30px rgba(245,166,35,0.35)" }}
              >
                <Link href="/katalog">
                  Przeglądaj katalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 rounded-full px-8 text-base font-semibold border-2 transition-all hover:scale-105"
                style={{ borderColor: "#4BBFCA", color: "#4BBFCA" }}
              >
                <Link href="#jak-to-dziala">Jak to działa?</Link>
              </Button>
            </div>

            {/* Trust bar */}
            <div
              className="animate-fade-in mt-10 flex flex-wrap gap-5 text-sm text-gray-500"
              style={{ animationDelay: "0.5s" }}
            >
              {[
                { icon: Users,        text: "500+ właścicieli żłobków" },
                { icon: CheckCircle2, text: "Zgodne z przepisami" },
                { icon: Zap,          text: "Dostęp w kilka sekund" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 font-medium">
                  <Icon className="h-4 w-4" style={{ color: "#7BC44C" }} />
                  {text}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section
        id="statystyki"
        className="py-16"
        style={{ background: "linear-gradient(135deg, #F5A623 0%, #F7C06B 50%, #4BBFCA 100%)" }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "500+", label: "właścicieli żłobków",    icon: Users },
              { value: "50+",  label: "dostępnych ebooków",     icon: BookOpen },
              { value: "30",   label: "dni dostępu po zakupie", icon: Clock },
              { value: "100%", label: "zgodność z przepisami",  icon: Trophy },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-1">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-4xl font-bold drop-shadow-sm">{value}</p>
                <p className="text-sm text-white/80 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="jak-to-dziala" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <span
              className="mb-3 inline-block rounded-full px-4 py-1 text-sm font-semibold text-white"
              style={{ backgroundColor: "#4BBFCA" }}
            >
              Prosty proces
            </span>
            <h2 className="text-4xl font-bold text-gray-900">Jak to działa?</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01", icon: BookOpen,
                title: "Wybierz ebooka",
                desc: "Przeglądaj katalog i znajdź dokumenty dopasowane do Twojego żłobka — procedury, regulaminy, umowy.",
                bg: "linear-gradient(135deg, #FFF3DC, #FFE4A0)",
                color: "#F5A623", border: "#FFD875",
              },
              {
                step: "02", icon: FileText,
                title: "Zapłać bezpiecznie",
                desc: "BLIK, przelew lub karta przez Przelewy24. Bez zakładania konta.",
                bg: "linear-gradient(135deg, #E2F7FA, #B2EBF2)",
                color: "#4BBFCA", border: "#81D4DA",
              },
              {
                step: "03", icon: Download,
                title: "Pobierz i wdróż",
                desc: "Link do PDF trafia na e-mail w kilka sekund. Uzupełnij dane żłobka i gotowe.",
                bg: "linear-gradient(135deg, #EDF9E8, #C8F0BC)",
                color: "#7BC44C", border: "#A5D99B",
              },
            ].map(({ step, icon: Icon, title, desc, bg, color, border }) => (
              <div
                key={step}
                className="relative rounded-3xl p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ background: bg, border: `1.5px solid ${border}` }}
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <span
                  className="absolute right-6 top-6 text-5xl font-black opacity-15"
                  style={{ color }}
                >
                  {step}
                </span>
                <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED EBOOKS ─── */}
      {featuredEbooks.length > 0 && (
        <section className="py-24" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%)" }}>
          <div className="container mx-auto px-4">
            <div className="mb-12 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <span
                  className="mb-3 inline-block rounded-full px-4 py-1 text-sm font-semibold text-white"
                  style={{ backgroundColor: "#F5A623" }}
                >
                  ⭐ Bestsellery
                </span>
                <h2 className="text-4xl font-bold text-gray-900">Polecane ebooki</h2>
              </div>
              <Link
                href="/katalog"
                className="group flex items-center gap-1 rounded-full border-2 px-5 py-2 text-sm font-semibold transition-all hover:text-white"
                style={{ borderColor: "#F5A623", color: "#F5A623" }}
              >
                Zobacz wszystkie
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEbooks.map((ebook) => (
                <EbookCard key={ebook.id} ebook={ebook} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CATEGORIES ─── */}
      {categories.length > 0 && (
        <section className="py-20" style={{ background: "linear-gradient(135deg, #4BBFCA 0%, #2EADB8 100%)" }}>
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold text-white">Kategorie</h2>
              <p className="mt-2 text-white/70">Znajdź dokumenty dla swojego żłobka</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat, i) => {
                const colors = ["#F5A623", "#7BC44C", "#FF8C5A", "#9B59B6", "#F5A623"];
                const bg = colors[i % colors.length];
                return (
                  <Link
                    key={cat.id}
                    href={`/katalog?kategoria=${cat.slug}`}
                    className="rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: bg }}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── WHY US ─── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <span
              className="mb-3 inline-block rounded-full px-4 py-1 text-sm font-semibold text-white"
              style={{ backgroundColor: "#7BC44C" }}
            >
              Dlaczego my?
            </span>
            <h2 className="text-4xl font-bold text-gray-900">Twój czas jest cenny</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: BookOpen, color: "#F5A623", bg: "#FFF3DC",
                title: "Ekspercka wiedza",
                desc: "Każdy ebook tworzony jest przez praktyków z wieloletnim doświadczeniem w prowadzeniu żłobków. Żadnej teorii — tylko gotowe rozwiązania.",
              },
              {
                icon: ShieldCheck, color: "#7BC44C", bg: "#EDF9E8",
                title: "Zawsze zgodne z prawem",
                desc: "Regularnie aktualizujemy dokumenty zgodnie z Ustawą o opiece nad dziećmi do lat 3 i przepisami sanitarnymi.",
              },
              {
                icon: Zap, color: "#4BBFCA", bg: "#E2F7FA",
                title: "Natychmiastowy dostęp",
                desc: "Po zakupie link do PDF trafia na e-mail w kilka sekund. Bez oczekiwania, bez rejestracji.",
              },
              {
                icon: CheckCircle2, color: "#F5A623", bg: "#FFF3DC",
                title: "Gotowe do wdrożenia",
                desc: "Wystarczy uzupełnić dane żłobka. Oszczędzasz godziny pracy i koszty konsultacji prawnych.",
              },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="flex gap-5 rounded-3xl p-7 transition-all hover:-translate-y-1 hover:shadow-md"
                style={{ backgroundColor: bg }}
              >
                <div
                  className="mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-1.5 text-lg font-bold text-gray-900">{title}</h3>
                  <p className="text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24" style={{ background: "linear-gradient(160deg, #FFF3DC 0%, #E2F7FA 100%)" }}>
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <span
              className="mb-3 inline-block rounded-full px-4 py-1 text-sm font-semibold text-white"
              style={{ backgroundColor: "#F5A623" }}
            >
              ❤️ Opinie
            </span>
            <h2 className="text-4xl font-bold text-gray-900">Co mówią właściciele żłobków?</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "Zaoszczędziłam kilkanaście godzin pracy. Procedury są profesjonalne, gotowe do druku i zgodne z przepisami — dokładnie to, czego potrzebowałam.",
                author: "Anna K.", role: "Właścicielka żłobka, Warszawa", color: "#F5A623",
              },
              {
                quote: "Otwierałam żłobek i nie wiedziałam od czego zacząć. Ebooki EduSmyk prowadziły mnie krok po kroku. Polecam każdej nowej placówce!",
                author: "Marta W.", role: "Właścicielka żłobka, Kraków", color: "#4BBFCA",
              },
              {
                quote: "Regularnie wracam po kolejne dokumenty. Przepisy w żłobkach często się zmieniają, a tu zawsze mam pewność, że materiały są aktualne.",
                author: "Joanna P.", role: "Kierownik żłobka, Gdańsk", color: "#7BC44C",
              },
            ].map(({ quote, author, role, color }) => (
              <div
                key={author}
                className="rounded-3xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ borderTop: `4px solid ${color}` }}
              >
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" style={{ color: "#F5A623" }} />
                  ))}
                </div>
                <p className="mb-6 text-gray-600 leading-relaxed italic">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {author[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{author}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        className="relative overflow-hidden py-28"
        style={{ background: "linear-gradient(135deg, #F5A623 0%, #F9B84B 40%, #4BBFCA 100%)" }}
      >
        {/* decorative circles */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-float mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h2 className="mx-auto mb-4 max-w-2xl text-4xl font-bold text-white leading-tight md:text-5xl">
            Profesjonalne zarządzanie żłobkiem w zasięgu ręki
          </h2>
          <p className="mb-10 text-lg text-white/80">
            Dołącz do setek właścicieli żłobków, którzy już korzystają z naszych materiałów.
          </p>
          <Button
            asChild
            size="lg"
            className="h-14 rounded-full px-10 text-base font-bold text-gray-900 shadow-2xl transition-all hover:scale-105"
            style={{ backgroundColor: "white", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}
          >
            <Link href="/katalog">
              Przeglądaj katalog
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
