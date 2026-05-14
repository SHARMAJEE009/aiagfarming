import { HeroSection } from "@/components/marketing/HeroSection";
import {
  FeatureSection,
  PricingSection,
  TestimonialsSection,
  ROICalculator,
  FAQSection,
  CTABanner,
  Footer,
} from "@/components/marketing/sections";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Spacer to push past hero overlay */}
      <div className="h-40 lg:h-64 bg-gradient-to-b from-[#2d8e4e] to-white" />

      {/* Feature: Crop Management */}
      <FeatureSection
        id="crops"
        tag="Crop Management"
        title="From seed to sale — every field, every season."
        description="Plan crops, track spray applications, manage withholding periods, and get NDVI satellite imagery over your field boundaries — all in one place."
        features={[
          "Field mapping with GIS integration and satellite imagery",
          "Season and crop planning with rotation tracking",
          "Spray and input records with withholding period compliance",
          "Soil health tracking: pH, moisture, nutrient maps",
          "Crop performance analytics and yield predictions",
        ]}
        imageAlt="Crop management dashboard"
        color="#1A7A3A"
      />

      {/* Feature: Livestock */}
      <FeatureSection
        id="livestock"
        tag="Livestock Management"
        title="Every animal. Every mob. Every movement."
        description="Individual animal identification, mob management, health events, breeding records, and full NLIS compliance — purpose-built for Australian livestock producers."
        features={[
          "Individual animal identification (NLIS, RFID, visual tags)",
          "Mob & paddock management with real-time location tracking",
          "Health events: treatments, vaccinations, vet visits",
          "Breeding management: joining, pregnancy testing, births",
          "Weight tracking with ASBV/EBV benchmarking",
        ]}
        imageAlt="Livestock management dashboard"
        reverse
        color="#F5A623"
      />

      {/* Feature: Finance */}
      <FeatureSection
        id="finance"
        tag="Financial Management"
        title="Farm financials that actually make sense."
        description="Track income and expenses linked to your actual farm operations. Generate reports for lenders and auditors, and sync directly with Xero and QuickBooks."
        features={[
          "Farm-level P&L, budgets, and forecasts",
          "Input cost tracking linked to field/livestock operations",
          "Xero, QuickBooks, and MYOB integration",
          "Custom report builder for lenders and auditors",
          "Revenue tracking: crop sales, livestock trading, subsidies",
        ]}
        imageAlt="Finance dashboard"
        color="#1A7A3A"
      />

      {/* Feature: AI */}
      <FeatureSection
        id="ai"
        tag="AI Advisory Engine"
        title="Your agronomist, available 24/7."
        description="Ask questions in plain English and get AI-powered recommendations based on your actual farm data, weather, and historical performance."
        features={[
          "Natural language Q&A: 'When should I spray paddock 4?'",
          "AI-powered yield predictions from satellite & historical data",
          "Livestock health anomaly detection from weight trends",
          "Seasonal planting and selling recommendations",
          "Weather-aware spray window alerts",
        ]}
        imageAlt="AI advisory dashboard"
        reverse
        color="#1A7A3A"
      />

      <ROICalculator />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTABanner />
      <Footer />
    </>
  );
}
