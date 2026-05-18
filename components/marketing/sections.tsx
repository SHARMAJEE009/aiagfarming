"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui";
import Link from "next/link";

// ─── Feature Section ─────────────────────────────────────────────────────────
interface FeatureSectionProps {
  id?: string;
  tag: string;
  title: string;
  description: string;
  features: string[];
  imageAlt: string;
  imageSrc?: string;
  reverse?: boolean;
  color?: string;
}

export function FeatureSection({ id, tag, title, description, features, imageSrc, imageAlt, reverse, color = "#1A7A3A" }: FeatureSectionProps) {
  return (
    <section id={id} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col lg:flex-row gap-16 items-center ${reverse ? "lg:flex-row-reverse" : ""}`}>
          {/* Text */}
          <div className="flex-1">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: color + "20", color }}
            >
              {tag}
            </span>
            <h2 className="text-4xl font-bold text-[#0D3320] mb-4">{title}</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">{description}</p>
            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0" style={{ backgroundColor: color }}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/sign-up">
              <Button variant="primary">Get Started Free</Button>
            </Link>
          </div>

          {/* Visual placeholder / Image */}
          <div className="flex-1 w-full">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-[#E5E7EB] relative" style={{ background: `linear-gradient(135deg, ${color}10, ${color}30)` }}>
              {imageSrc ? (
                <div className="relative w-full aspect-video">
                  <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-48 md:h-64 lg:h-80 flex items-center justify-center">
                  <div className="text-center" style={{ color }}>
                    <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium opacity-70">{tag} Dashboard Preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Section ─────────────────────────────────────────────────────────
const plans = [
  {
    name: "Starter",
    price: 49,
    users: "Up to 3 users",
    size: "Up to 500 acres / 500 animals",
    features: ["Crop OR Livestock module", "Basic reports", "Email support", "Mobile PWA", "CSV export"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: 129,
    users: "Up to 10 users",
    size: "Up to 5,000 acres / 5,000 animals",
    features: ["All 6 modules", "AI Advisory Engine", "API access", "Xero & QuickBooks integration", "NLIS compliance export", "Priority support", "Weather & IoT integration"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: null,
    users: "Unlimited users",
    size: "Unlimited acreage & animals",
    features: ["Everything in Professional", "Custom onboarding", "Dedicated account manager", "SLA guarantee", "SSO / Entra ID", "SOC 2 compliance", "Custom integrations"],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#0D3320] mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 mb-8">14-day free trial · No credit card required · Cancel anytime</p>
          <div className="inline-flex items-center gap-3 bg-white rounded-full p-1 border border-[#E5E7EB]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!annual ? "bg-[#1A7A3A] text-white shadow" : "text-gray-500"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${annual ? "bg-[#1A7A3A] text-white shadow" : "text-gray-500"}`}
            >
              Annual <span className="text-[#F5A623] font-semibold">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl border p-8 flex flex-col ${plan.popular ? "border-[#1A7A3A] shadow-xl ring-1 ring-[#1A7A3A] relative" : "border-[#E5E7EB]"}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#1A7A3A] text-white text-xs font-semibold px-4 py-1.5 rounded-full">MOST POPULAR</span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-[#0D3320] mb-2">{plan.name}</h3>
                <div className="mb-1">
                  {plan.price ? (
                    <span className="text-4xl font-bold text-[#1A7A3A]">
                      ${annual ? Math.round(plan.price * 0.8) : plan.price}
                      <span className="text-lg font-normal text-gray-500">/mo</span>
                    </span>
                  ) : (
                    <span className="text-3xl font-bold text-[#1A7A3A]">Custom</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-1">{plan.users}</p>
                <p className="text-sm text-gray-500 mb-6">{plan.size}</p>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-[#1A7A3A] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto">
                <Link href={plan.price ? "/sign-up" : "/contact"} className="block">
                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  { name: "James Whitfield", role: "Mixed farmer, 1,800 acres — Darling Downs, QLD", quote: "AIAG Farming replaced three separate apps I was paying for. The unified dashboard alone saves me two hours every week.", initials: "JW" },
  { name: "Sarah O'Brien", role: "Station Manager — Victoria", quote: "The livestock health tracking and NLIS compliance features are exactly what our operation needed. Set up in a day.", initials: "SO" },
  { name: "Mike Chen", role: "Consulting Agronomist — 30 farm clients", quote: "The multi-farm portal is a game changer. I can monitor all my clients from one login and upload prescriptions directly.", initials: "MC" },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#0D3320]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Trusted by Farmers Across Australia</h2>
          <p className="text-white/70 text-lg">Real results from real operations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex gap-1 mb-4">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-[#F5A623]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-white/90 mb-6 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1A7A3A] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-white/60 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ROI Calculator ───────────────────────────────────────────────────────────
export function ROICalculator() {
  const [acres, setAcres] = useState(500);
  const [animals, setAnimals] = useState(500);

  const timeSaved = Math.round((acres / 100) * 2.5 + (animals / 100) * 1.5);
  const moneySaved = Math.round(timeSaved * 85 * 12);
  const roi = Math.round(((moneySaved - 129 * 12) / (129 * 12)) * 100);

  return (
    <section className="py-24 bg-white" id="roi">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#0D3320] mb-4">Calculate Your ROI</h2>
          <p className="text-lg text-gray-600">See how much time and money AIAG Farming saves your operation</p>
        </div>
        <div className="bg-gradient-to-br from-[#E8F5EC] to-white rounded-2xl p-8 border border-[#c3e6cc]">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-semibold text-[#0D3320] mb-2">Farm Size (acres): {acres.toLocaleString()}</label>
              <input
                type="range" min={50} max={10000} step={50} value={acres}
                onChange={(e) => setAcres(Number(e.target.value))}
                className="w-full accent-[#1A7A3A]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>50</span><span>10,000</span></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0D3320] mb-2">Animals: {animals.toLocaleString()}</label>
              <input
                type="range" min={0} max={5000} step={50} value={animals}
                onChange={(e) => setAnimals(Number(e.target.value))}
                className="w-full accent-[#1A7A3A]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0</span><span>5,000</span></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Hours Saved / Month", value: `${timeSaved}h`, sub: "at admin tasks" },
              { label: "Est. Annual Savings", value: `$${(moneySaved).toLocaleString()}`, sub: "vs. multiple tools" },
              { label: "12-Month ROI", value: `${roi}%`, sub: "on Professional plan" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm border border-[#E5E7EB]">
                <p className="text-2xl font-bold text-[#1A7A3A]">{s.value}</p>
                <p className="text-xs font-semibold text-[#0D3320] mt-1">{s.label}</p>
                <p className="text-xs text-gray-500">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  { q: "Is there a free trial?", a: "Yes! Both Starter and Professional plans come with a 14-day free trial. No credit card required." },
  { q: "Can I use AIAG Farming on my phone in a paddock with no internet?", a: "Yes. AIAG Farming is a PWA (Progressive Web App) with full offline support. Data you enter offline syncs automatically when you reconnect." },
  { q: "Does AIAG Farming integrate with Xero or QuickBooks?", a: "Yes. The Professional and Enterprise plans include native integrations with Xero, QuickBooks Online, and MYOB." },
  { q: "Can I import my existing data?", a: "Absolutely. AIAG Farming supports CSV and Excel bulk import for all major modules — animals, fields, financial entries, and spray records." },
  { q: "Is my data stored in Australia?", a: "Yes. All data is stored in AWS ap-southeast-2 (Sydney), compliant with the Australian Privacy Act 1988." },
  { q: "What is NLIS and do you support it?", a: "NLIS is Australia's National Livestock Identification System. AIAG Farming fully supports NLIS registration, movement recording, and compliance CSV export." },
  { q: "Can an agronomist manage multiple farm clients?", a: "Yes — the Agronomist plan ($199/mo) includes a multi-farm portal for up to 50 client farms, with prescription upload and client reporting tools." },
  { q: "How secure is my farm data?", a: "AIAG Farming uses AES-256 encryption at rest, TLS 1.3 in transit, and row-level security in the database. We undergo annual penetration testing." },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24 bg-[#F9FAFB]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#0D3320] mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-medium text-[#1F2937]">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${open === i ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
export function CTABanner() {
  return (
    <section className="py-24 bg-gradient-to-r from-[#1A7A3A] to-[#0D3320]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to unify your farm operations?</h2>
        <p className="text-white/80 text-lg mb-8">Join thousands of farmers already saving time and money with AIAG Farming.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-[#1A7A3A] hover:bg-[#E8F5EC] font-semibold px-8">
              Start 14-Day Free Trial
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" className="border border-white/30 text-white bg-white/10 hover:bg-white/20 px-8">
              Talk to Sales
            </Button>
          </Link>
        </div>
        <p className="text-white/50 text-sm mt-4">No credit card required · Setup in under 5 minutes</p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="bg-[#0D3320] text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#1A7A3A] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">AF</span>
              </div>
              <span className="text-lg font-bold text-white">AIAG Farming</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              The world&apos;s most complete agricultural management platform. Empowering every farmer with real-time, AI-assisted insights.
            </p>
            <p className="text-xs">Data hosted in Australia · AWS ap-southeast-2</p>
          </div>

          {[
            { title: "Product", links: ["Crop Management", "Livestock Management", "Financial Reports", "AI Advisory", "Compliance"] },
            { title: "Company", links: ["About Us", "Blog", "Careers", "Press"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security", "GDPR"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">© 2026 AIAG Farming. All rights reserved.</p>
          <p className="text-xs">English (AU) · AUD · Metric</p>
        </div>
      </div>
    </footer>
  );
}
