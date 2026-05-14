import { PricingSection, FAQSection, CTABanner, Footer } from "@/components/marketing/sections";

export default function PricingPage() {
  return (
    <>
      <div className="pt-24 pb-8 bg-gradient-to-b from-[#0D3320] to-[#1A7A3A] text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Plans & Pricing</h1>
        <p className="text-white/70 text-lg">Simple pricing for every size operation</p>
      </div>
      <PricingSection />
      <FAQSection />
      <CTABanner />
      <Footer />
    </>
  );
}
