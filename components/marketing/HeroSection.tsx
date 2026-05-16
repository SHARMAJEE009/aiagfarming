import Link from "next/link";
import { Button } from "@/components/ui";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image Container - Ends after trust badges */}
      <div className="relative pt-12 pb-10 md:pt-16 md:pb-14">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/download.gif")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Dark Green Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D3320]/90 via-[#1A7A3A]/80 to-[#2d8e4e]/60 z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 rounded-full px-4 py-1.5 text-sm font-medium mb-8 backdrop-blur-sm border border-white/20">
            <span className="w-2 h-2 bg-[#F5A623] rounded-full animate-pulse" />
            Trusted by 2,000+ farming operations across Australia
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            One Platform.<br />
            <span className="text-[#F5A623]">Every Acre.</span><br />
            Every Animal.
          </h1>

          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            AIAG Farming unifies crop management, livestock tracking, financial reporting,
            and AI advisory in a single beautifully designed platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
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

          {/* Trust badges - IMAGE ENDS HERE */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-white/70 text-sm">
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
      </div>

      {/* Dashboard Preview - Now on White/Default Background below the image */}
      <div className="relative -mt-6 md:-mt-8 z-30 max-w-5xl mx-auto px-4 pb-12 hidden md:block">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="h-8 bg-[#F3F4F6] flex items-center gap-1.5 px-4 border-b border-[#E5E7EB]">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[#F9FAFB]">
            {[
              { label: "Total Fields", value: "12", color: "#1A7A3A" },
              { label: "Total Animals", value: "1,847", color: "#1A7A3A" },
              { label: "MTD Revenue", value: "$84.5K", color: "#1A7A3A" },
              { label: "Compliance", value: "97%", color: "#F5A623" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm flex flex-col justify-center min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 truncate">{s.label}</p>
                <p className="text-2xl font-black mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
