"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Shield, X, Menu } from "lucide-react";

const PAINTINGS = {
  vermeer: "/api/paintings/the-concert",
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
      <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-500 ${scrolled ? "rounded-full px-8 py-3 mx-4 max-w-none" : ""}`}
        style={scrolled ? { background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(24px)', border: '1px solid var(--border)' } : undefined}>
        <Link href="/" className="flex items-center gap-2.5">
          <Shield className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '+0.02em' }}>CVBER<sup style={{ fontSize: '9px', marginLeft: '2px', opacity: 0.6 }}>&reg;</sup></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[{ label: "Features", href: "/features" }, { label: "How It Works", href: "/how-it-works" }, { label: "Art Hub", href: "/art-hub" }, { label: "Blog", href: "/blog" }].map((l) => (
            <Link key={l.href} href={l.href} style={{ fontSize: '14px', color: 'var(--text-quaternary)' }} className="hover:text-[var(--text-primary)] transition-colors duration-200">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block" style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', color: 'var(--text-quaternary)' }}>
            Member Access
          </Link>
          <Link href="/gate" className="px-6 py-2.5" style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', borderRadius: 'var(--radius)' }}>
            Request an Invitation
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" style={{ color: 'var(--text-primary)' }}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mx-4 mt-3 px-6 py-6 flex flex-col gap-4" style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(24px)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          {[{ label: "Features", href: "/features" }, { label: "How It Works", href: "/how-it-works" }, { label: "Art Hub", href: "/art-hub" }, { label: "Blog", href: "/blog" }, { label: "Member Access", href: "/login" }].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ fontSize: '14px', color: 'var(--text-quaternary)' }} className="hover:text-[var(--text-primary)] transition-colors">
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
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-6">
      <div className="relative z-10 flex flex-col items-center" style={{ maxWidth: '680px' }}>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1.05', letterSpacing: '-0.03em' }}
          className="animate-fade-rise">
          Your Art Has Provenance.
        </h1>
        <p className="mt-6 animate-fade-rise-delay" style={{ fontSize: '16px', color: 'var(--text-tertiary)', lineHeight: '1.6', maxWidth: '480px' }}>
          C2PA certificates, AI theft detection, and automated enforcement. Free forever.
        </p>
        <Link href="/gate" className="mt-10 px-10 py-4 animate-fade-rise-delay-2" style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', borderRadius: 'var(--radius)' }}>
          Request an Invitation
        </Link>
        <p className="mt-6 animate-fade-rise-delay-2" style={{ fontSize: '12px', color: 'var(--text-quaternary)' }}>
          There is no fee. There is a standard.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   THE METHOD
   ═══════════════════════════════════════════════════════ */
function MethodSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-32 md:py-48 px-6">
      <div className="max-w-3xl mx-auto">
        <p className={`mb-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.1em', textTransform: 'uppercase' }}>
          The Method
        </p>
        <div className={`space-y-8 transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p style={{ fontSize: '17px', color: 'var(--text-tertiary)', lineHeight: '1.7' }}>
            Every artwork has a story. CVBER ensures that story has proof. When you upload a piece, we embed a C2PA cryptographic certificate that proves origin, authorship, and timestamp\u2014recognized by Adobe, Microsoft, Google, and the EU AI Act.
          </p>
          <p style={{ fontSize: '17px', color: 'var(--text-tertiary)', lineHeight: '1.7' }}>
            Our AI crawlers scan the open web 24/7, searching for unauthorized reproductions. When a match is found, CVBER generates a legally-compliant DMCA takedown notice and files it automatically. No lawyers. No fees. No hesitation.
          </p>
          <p style={{ fontSize: '17px', color: 'var(--text-tertiary)', lineHeight: '1.7' }}>
            Every timestamp is anchored to the Bitcoin blockchain through OpenTimestamps, creating an immutable record that cannot be forged, backdated, or disputed. Your art. Your proof. Your rules.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   MEMBERS
   ═══════════════════════════════════════════════════════ */
function MembersSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const testimonials = [
    { name: "Sarah Chen", role: "Digital Artist", quote: "CVBER gave me peace of mind. My art is protected and I didn\u2019t pay a cent." },
    { name: "Marcus Webb", role: "Photographer", quote: "Found 3 stolen copies of my work within the first week. DMCA filed automatically." },
    { name: "Aisha Patel", role: "Illustrator", quote: "The C2PA certificate is industry-standard. Finally, a free tool that takes copyright seriously." },
  ];

  return (
    <section ref={ref} className="relative py-32 md:py-48 px-6">
      <div className="max-w-6xl mx-auto">
        <p className={`mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.1em', textTransform: 'uppercase' }}>
          Members
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={t.name} className={`p-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', transitionDelay: `${i * 120}ms` }}>
              <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', lineHeight: '1.6', marginBottom: '24px' }}>&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 900, color: 'var(--text-primary)' }}>{t.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-quaternary)' }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   THE PAINTINGS
   ═══════════════════════════════════════════════════════ */
function PaintingsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-12 md:py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className={`relative overflow-hidden transition-all duration-900 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          style={{ height: '50vh', borderRadius: 'var(--radius)' }}>
          <img src={PAINTINGS.vermeer} alt="The Concert by Johannes Vermeer" className="w-full h-full object-cover" style={{ opacity: 0.08 }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              The Concert
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', maxWidth: '480px', lineHeight: '1.6' }}>
              Stolen from the Isabella Stewart Gardner Museum in 1990. Valued at $500 million. Still missing. This is why provenance matters.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   APPLICATION FORM
   ═══════════════════════════════════════════════════════ */
function ApplicationSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [charCount, setCharCount] = useState(0);
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  const handleSubmit = async () => {
    if (wordCount < 30 || status === "submitting") return;
    setStatus("submitting");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://cvber-free-las-app.onrender.com"}/api/gate/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });
      if (res.ok) setStatus("done");
    } catch {
      setStatus("done");
    }
  };

  if (status === "done") {
    return (
      <section className="relative py-32 md:py-48 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-2 h-2 rounded-full mx-auto mb-6" style={{ background: 'var(--text-secondary)' }} />
          <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '12px' }}>Application received.</p>
          <p style={{ fontSize: '14px', color: 'var(--text-quaternary)' }}>We review every application manually. You will hear from us.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-32 md:py-48 px-6">
      <div className="max-w-xl mx-auto">
        <p className="mb-6" style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-quaternary)', letterSpacing: '+0.1em', textTransform: 'uppercase' }}>
          Request Access
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '32px' }}>
          This is not for everyone.
        </h2>
        <div className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email"
            className="w-full px-5 py-4 border text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }} />
          <div>
            <textarea value={message} onChange={(e) => { setMessage(e.target.value); setCharCount(e.target.value.length); }}
              placeholder="Why do you want CVBER? Tell us about your work and what you protect. Minimum 30 words."
              className="w-full px-5 py-4 border text-sm focus:outline-none focus:ring-2 transition-all resize-none h-36"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }} />
            <div className="flex justify-between mt-2">
              <span style={{ fontSize: '11px', color: wordCount >= 30 ? 'var(--text-secondary)' : 'var(--text-quaternary)' }}>
                {wordCount} / 30 words
              </span>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={wordCount < 30 || status === "submitting"}
            className="w-full py-4 text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.15em', borderRadius: 'var(--radius)' }}>
            {status === "submitting" ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="py-16 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5" style={{ color: 'var(--text-quaternary)' }} />
          <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-quaternary)' }}>CVBER</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8" style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '+0.1em', color: 'var(--text-quaternary)' }}>
          {["Features", "How It Works", "Art Hub", "Verify", "Terms", "Privacy"].map((l) => (
            <Link key={l} href={`/${l.toLowerCase().replace(/ /g, "-")}`} className="hover:text-[var(--text-primary)] transition-colors">
              {l}
            </Link>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-quaternary)' }}>&copy; 2026 CVBER</p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <MethodSection />
      <MembersSection />
      <PaintingsSection />
      <ApplicationSection />
      <Footer />
    </main>
  );
}
