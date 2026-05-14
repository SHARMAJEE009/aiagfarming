import Link from "next/link";
import { Button } from "@/components/ui";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0D3320] via-[#1A7A3A] to-[#2d8e4e] pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 rounded-full px-4 py-1.5 text-sm font-medium mb-8 backdrop-blur-sm border border-white/20">
          <span className="w-2 h-2 bg-[#F5A623] rounded-full animate-pulse" />
          Trusted by 2,000+ farming operations across Australia
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          One Platform.<br />
          <span className="text-[#F5A623]">Every Acre.</span><br />
          Every Animal.
        </h1>

        <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
          AIAG Farming unifies crop management, livestock tracking, financial reporting,
          and AI advisory in a single beautifully designed platform.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-white text-[#1A7A3A] hover:bg-[#E8F5EC] shadow-xl px-8 text-base font-semibold"
            >
              Start 14-Day Free Trial
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <a href="#demo">
            <Button
              size="lg"
              className="border border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-8 text-base"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Demo
            </Button>
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-white/60 text-sm">
          {["No credit card required", "14-day free trial", "Cancel anytime", "WCAG 2.1 AA compliant"].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#F5A623]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard preview mockup */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 translate-y-1/3 hidden lg:block">
        <div className="bg-white rounded-t-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="h-8 bg-[#F3F4F6] flex items-center gap-1.5 px-4 border-b border-[#E5E7EB]">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="grid grid-cols-4 gap-3 p-4 bg-[#F9FAFB]">
            {[
              { label: "Total Fields", value: "12", color: "#1A7A3A" },
              { label: "Total Animals", value: "1,847", color: "#1A7A3A" },
              { label: "MTD Revenue", value: "$84.5K", color: "#1A7A3A" },
              { label: "Compliance", value: "97%", color: "#F5A623" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-lg p-3 border border-[#E5E7EB]">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
