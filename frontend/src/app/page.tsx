"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Shield, ArrowRight, X, Menu, Eye, Scan, Lock, Zap, ChevronRight, ArrowUpRight } from "lucide-react";

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const PAINTINGS = {
  adoration: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRVqZHy5VcnFaUDqXaLiHA1ucNKUws9Kl_gb9nPiPTkTN9-D9PMdZLE6J33UBem9ysE5U2vWCBH3vvDEPlVPPUXdFfdpKCWCblS22KPA-s96mUmYXSNQat6lE-6AxhiC-WJUnjMDhmUczTccOJjrO_VKYgWtQDVXBkrk-YnrVfTu_Qgg-ElAyPWFNtylWg2I8cTYmU5kG5nkTcqCFa-6Nzgug42dHA3Ko9r88n_XaIeKotwxxeuJtqT1mNJQ4_BZi26A",
  vermeer: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkS2ZMyPfVAk-ZQDoCq9HqsCcxRUvDZW3VE3p8ZorqDvX6CfHVYDzx_4_MiYIGXXZOLV58oNJVTg5qrzQXkpk4ufMwXmMUfnY1ubYjerze6W1T4VnfMqANJuTLf5LiRPUyi3568imHoPl7T3yZ2kHBBVlqjG162vG7iObOqVAeL0drw3xdtinJ3kMgS99dwknnRXOAjKOAi4fgGmzd5-sQz4DVMcw-vK_0B4s2Xwn_G6RFZYjNVNAt",
  scan1: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLFKzjEQhlrwUneQJRX6az04iqOoawPZjbzYerPLFYzwFprZ8nsAthOx2WRya71NlylVG5vrJkaoUuVDwsi6Jg5-uLJGzLeKdNpkVo3h9ZVbUKubuWfZPm5JUa7-zMg6YKzkbtuWe45YNpNYmIYxCgJF_rssR3gM1wZl9CQ0cxex8TBMiU7-OOCrIGyDoME2F_pDhmL5HsMKd9g_asvTzIGmAOw3wJAV1Z1LgY67e1a7RUklD4uLbiaMMQVnbAV3iOw",
  scan2: "https://lh3.googleusercontent.com/aida-public/AB6AXuByvqicUjLaLsB5QZsVD8CqR2v4oTpItY4t_UlzhFAm1hDsCGC_naGPgmVPpCMKot61JpZgX8F53giD3btenfOZNcA39RG3DtqdiY7HMCfEeiFOTgIQDeia1OHBmR3ABwz8JN7ZpSUv7O3hpOhdAEpxxiC5GADNTC1NPRva4KMlVAbJutLMJN8JGR-VJM3_1qRysLap8ozvh66D7N5yDCPg0En61pfx_pjbbFWX_W-rOxmZiFg3XPE8MVaKubFRr-QjLw",
};

/* ═══════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-6"}`}>
      <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-500 ${scrolled ? "bg-glass-nav rounded-full px-8 py-3 mx-4 max-w-none shadow-lg shadow-black/20" : ""}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-foreground" />
          <span className="text-foreground font-medium text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            CVBER<sup className="text-[9px] ml-0.5 opacity-60">&reg;</sup>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Home", href: "/" },
            { label: "Features", href: "/features" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "Art Hub", href: "/art-hub" },
            { label: "Blog", href: "/blog" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Log In
          </Link>
          <Link href="/gate" className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform">
            Apply for Access
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-foreground">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mx-4 mt-3 bg-glass-nav rounded-2xl px-6 py-6 flex flex-col gap-4 shadow-lg shadow-black/30">
          {[
            { label: "Home", href: "/" },
            { label: "Features", href: "/features" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "Art Hub", href: "/art-hub" },
            { label: "Blog", href: "/blog" },
            { label: "Log In", href: "/login" },
          ].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative w-full h-screen min-h-[700px] flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Painting — fullscreen background */}
      <img
        src={PAINTINGS.adoration}
        alt="Adoration of the Shepherds by Murillo"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
      />

      {/* Video overlay — plays on top of painting */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-[1] opacity-40"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-background/70 via-background/40 to-background/90" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-32 pb-40">
        <h1
          className="text-5xl sm:text-7xl md:text-8xl text-foreground leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal animate-fade-rise"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Where <em className="not-italic text-muted-foreground">dreams</em> rise{" "}
          <br className="hidden sm:block" />
          <em className="not-italic text-muted-foreground">through the silence.</em>
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          We build free tools for deep thinkers, bold creators, and quiet rebels.
          C2PA provenance, AI theft detection, and automated DMCA — all free, forever.
        </p>

        <Link
          href="/gate"
          className="liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] transition-transform cursor-pointer animate-fade-rise-delay-2"
        >
          Begin Journey
        </Link>
      </div>

      {/* Painting label — bottom right */}
      <div className="absolute bottom-6 right-8 z-10 text-[9px] text-white/25 font-mono tracking-wider">
        Adoration of the Shepherds — Murillo, c. 1650
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   ABOUT
   ═══════════════════════════════════════════════════════ */
function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative z-10 py-28 md:py-40 px-6 overflow-hidden bg-background">
      <div className="max-w-6xl mx-auto">
        <p className={`text-muted-foreground text-sm tracking-widest uppercase mb-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          About CVBER
        </p>
        <h2
          className={`text-4xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] tracking-tight transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          Pioneering{" "}
          <span className="italic text-muted-foreground">protection</span>{" "}
          for<br className="hidden md:block" />
          minds that{" "}
          <span className="italic text-muted-foreground">create, build, and inspire.</span>
        </h2>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURED PAINTING
   ═══════════════════════════════════════════════════════ */
function FeaturedPaintingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative z-10 py-12 md:py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className={`rounded-3xl overflow-hidden aspect-video relative transition-all duration-900 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <img src={PAINTINGS.vermeer} alt="The Concert by Johannes Vermeer" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
            <div className="liquid-glass rounded-2xl p-6 md:p-8 max-w-md">
              <p className="text-muted-foreground text-xs tracking-widest uppercase mb-3">Our Approach</p>
              <p className="text-foreground text-sm md:text-base leading-relaxed">
                Cryptographic proof of ownership embedded in every artwork. C2PA certificates, neural theft detection, and automated enforcement — free forever.
              </p>
            </div>
            <Link href="/how-it-works" className="liquid-glass rounded-full px-8 py-3 text-foreground text-sm font-medium hover:bg-white/5 transition-colors whitespace-nowrap">
              Explore more
            </Link>
          </div>

          <div className="absolute top-6 right-6 text-[9px] text-white/30 font-mono tracking-wider">
            The Concert — Vermeer, c. 1664
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PHILOSOPHY
   ═══════════════════════════════════════════════════════ */
function PhilosophySection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative z-10 py-28 md:py-40 px-6 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <h2
          className={`text-5xl md:text-7xl lg:text-8xl text-foreground tracking-tight mb-16 md:mb-24 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          Innovation{" "}
          <span className="italic text-muted-foreground">x</span>{" "}
          Vision
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: painting */}
          <div className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
            <div className="rounded-3xl overflow-hidden aspect-[4/3] relative">
              <img src={PAINTINGS.adoration} alt="Adoration of the Shepherds" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
              <div className="absolute bottom-4 right-4 text-[9px] text-white/30 font-mono tracking-wider">
                Adoration — Murillo, c. 1650
              </div>
            </div>
          </div>

          {/* Right: text */}
          <div className={`flex flex-col justify-center transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
            <div>
              <p className="text-muted-foreground text-xs tracking-widest uppercase mb-4">Protect your work</p>
              <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
                Every artwork deserves cryptographic proof of origin. CVBER embeds C2PA certificates that AI companies must respect under the EU AI Act. Your art, your ownership, your rules.
              </p>
            </div>
            <div className="w-full h-px bg-white/10 my-8" />
            <div>
              <p className="text-muted-foreground text-xs tracking-widest uppercase mb-4">Shape the future</p>
              <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
                Creators should control how their work is used. CVBER gives every artist free tools to prove ownership, detect theft, and enforce takedowns — no lawyers needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SERVICES
   ═══════════════════════════════════════════════════════ */
const services = [
  {
    icon: Eye,
    tag: "Provenance",
    title: "C2PA Certificates",
    desc: "Cryptographic proof of ownership embedded in your files. Recognized by Adobe, Microsoft, Google, and the EU AI Act.",
    img: PAINTINGS.scan1,
    label: "Provenance Scan — CVBER Engine",
  },
  {
    icon: Scan,
    tag: "Enforcement",
    title: "DMCA Automation",
    desc: "One-click takedown notices filed automatically when your art is stolen. No lawyers, no fees, no hassle.",
    img: PAINTINGS.scan2,
    label: "Theft Detection — CVBER Neural Engine",
  },
  {
    icon: Lock,
    tag: "Monitoring",
    title: "24/7 Theft Monitoring",
    desc: "AI crawlers scan the web 24/7 for unauthorized use of your artwork. Get alerted the moment theft occurs.",
    img: PAINTINGS.scan1,
    label: "Monitoring Dashboard — CVBER",
  },
  {
    icon: Zap,
    tag: "Instant",
    title: "One-Click Protection",
    desc: "Upload your art, get a C2PA certificate in seconds. Free forever, no credit card, no catch.",
    img: PAINTINGS.scan2,
    label: "Instant Certificate — CVBER",
  },
];

function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative z-10 py-28 md:py-40 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-16 md:mb-24">
          <h2
            className={`text-3xl md:text-5xl text-foreground tracking-tight transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            What we do
          </h2>
          <p className={`text-muted-foreground text-sm hidden md:block transition-opacity duration-700 delay-200 ${visible ? "opacity-100" : "opacity-0"}`}>
            Our services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {services.map((s, i) => (
            <div
              key={s.title}
              className={`liquid-glass rounded-3xl overflow-hidden group transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="aspect-video relative overflow-hidden">
                <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
                <div className="absolute bottom-3 right-3 text-[9px] text-white/30 font-mono tracking-wider">{s.label}</div>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="uppercase tracking-widest text-muted-foreground text-xs">{s.tag}</p>
                  <div className="liquid-glass rounded-full p-2">
                    <s.icon className="w-4 h-4 text-foreground" />
                  </div>
                </div>
                <h3 className="text-foreground text-xl md:text-2xl mb-3 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                  {s.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════ */
function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const testimonials = [
    { name: "Sarah Chen", role: "Digital Artist", quote: "CVBER gave me peace of mind. My art is protected and I didn't pay a cent." },
    { name: "Marcus Webb", role: "Photographer", quote: "Found 3 stolen copies of my work within the first week. DMCA filed automatically." },
    { name: "Aisha Patel", role: "Illustrator", quote: "The C2PA certificate is industry-standard. Finally, a free tool that takes copyright seriously." },
  ];

  return (
    <section ref={ref} className="relative z-10 py-28 md:py-40 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2
          className={`text-3xl md:text-5xl text-foreground tracking-tight mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          Trusted by creators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`liquid-glass rounded-2xl p-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <p className="text-foreground/70 text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div>
                <p className="text-foreground text-sm font-medium">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   CTA
   ═══════════════════════════════════════════════════════ */
function CTASection() {
  return (
    <section className="relative z-10 py-28 md:py-40 px-6 bg-background text-center">
      <div className="max-w-3xl mx-auto">
        <h2
          className="text-4xl md:text-6xl lg:text-7xl text-foreground tracking-tight mb-8"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ready to <span className="italic text-muted-foreground">protect</span> your art?
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-12">
          Join thousands of creators using CVBER. Free C2PA certificates, automated DMCA, and 24/7 monitoring. No credit card required.
        </p>
        <Link href="/gate" className="liquid-glass rounded-full px-14 py-5 text-base text-foreground hover:scale-[1.03] transition-transform inline-block">
          Get Started Free
        </Link>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="relative z-10 py-16 px-6 border-t border-white/5 bg-background">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-foreground/30" />
          <span className="text-foreground/30 text-lg" style={{ fontFamily: "var(--font-display)" }}>CVBER</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-foreground/30 text-xs font-medium uppercase tracking-widest">
          {["Features", "How It Works", "Art Hub", "Blog", "Verify", "Terms", "Privacy"].map((l) => (
            <Link key={l} href={`/${l.toLowerCase().replace(/ /g, "-")}`} className="hover:text-foreground transition-colors">
              {l}
            </Link>
          ))}
        </div>
        <p className="text-foreground/20 text-xs">&copy; 2026 CVBER</p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <Hero />
      <AboutSection />
      <FeaturedPaintingSection />
      <PhilosophySection />
      <ServicesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
