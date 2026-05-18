"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Crops", href: "#crops" },
    { label: "Livestock", href: "#livestock" },
    { label: "Finance", href: "#finance" },
    { label: "AI Advisory", href: "#ai" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB] py-0" : "bg-transparent border-transparent py-2"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1A7A3A] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AF</span>
            </div>
            <span className={`text-lg font-bold transition-colors ${scrolled ? "text-[#0D3320]" : "text-white"}`}>AIAG Farming</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-[#1A7A3A]" : "text-white/80 hover:text-white"}`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className={scrolled ? "" : "text-white hover:text-white/80 hover:bg-white/10"}>Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="primary" size="sm">Start Free Trial</Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/10 text-white"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-[#E5E7EB]">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="block py-2 text-sm text-gray-600 hover:text-[#1A7A3A]"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 mt-4">
              <Link href="/sign-in"><Button variant="outline" size="md" className="w-full">Sign In</Button></Link>
              <Link href="/sign-up"><Button variant="primary" size="md" className="w-full">Start Free Trial</Button></Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
