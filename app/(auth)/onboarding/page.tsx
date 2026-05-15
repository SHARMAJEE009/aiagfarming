"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

const plans = [
  { id: "starter", name: "Starter", price: "$49/mo", desc: "Up to 3 users, 500 acres" },
  { id: "professional", name: "Professional", price: "$129/mo", desc: "Up to 10 users, all modules", popular: true },
  { id: "enterprise", name: "Enterprise", price: "Custom", desc: "Unlimited, custom SLA" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    farmName: "",
    location: "",
    operation: "Mixed (Crops + Livestock)",
    farmSize: "",
    animalCount: "",
    referral: "Google / Search"
  });
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOnboarding = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan
        })
      });

      if (response.ok) {
        router.push("/overview");
      } else {
        const errorData = await response.json().catch(() => null);
        alert(`Setup failed: ${errorData?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    await handleOnboarding();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#1A7A3A] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AF</span>
            </div>
            <span className="font-bold text-lg text-[#0D3320]">AIAG Farming</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0D3320]">Welcome! Let's finish your setup</h1>
          <p className="text-gray-500 text-sm mt-1">Just a few more details to customize your dashboard</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Farm Details", "Select Plan"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i + 1 <= step ? "bg-[#1A7A3A] text-white" : "bg-[#E5E7EB] text-gray-400"}`}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs ${i + 1 <= step ? "text-[#1A7A3A] font-medium" : "text-gray-400"}`}>{label}</span>
              {i < 1 && <div className={`h-px w-8 ${i + 1 < step ? "bg-[#1A7A3A]" : "bg-[#E5E7EB]"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Tell us about your farm</h2>
                <Input
                  label="Organisation / Farm Name"
                  placeholder="Whitfield Station Pty Ltd"
                  required
                  value={formData.farmName}
                  onChange={(e) => handleInputChange("farmName", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Farm Location"
                    placeholder="Dalby, QLD"
                    required
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">Primary Operation</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                      value={formData.operation}
                      onChange={(e) => handleInputChange("operation", e.target.value)}
                    >
                      <option>Mixed (Crops + Livestock)</option>
                      <option>Crop Farming</option>
                      <option>Livestock Only</option>
                      <option>Consulting Agronomist</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Approximate Farm Size (acres)"
                    placeholder="1,500"
                    type="number"
                    value={formData.farmSize}
                    onChange={(e) => handleInputChange("farmSize", e.target.value)}
                  />
                  <Input
                    label="Approximate Animal Count"
                    placeholder="800"
                    type="number"
                    value={formData.animalCount}
                    onChange={(e) => handleInputChange("animalCount", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">How did you hear about AIAG Farming?</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                    value={formData.referral}
                    onChange={(e) => handleInputChange("referral", e.target.value)}
                  >
                    <option>Google / Search</option>
                    <option>Word of mouth</option>
                    <option>Social media</option>
                    <option>Industry event</option>
                    <option>Agronomist recommendation</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Choose your plan</h2>
                <div className="space-y-3 mb-6">
                  {plans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === plan.id ? "border-[#1A7A3A] bg-[#E8F5EC]" : "border-[#E5E7EB] hover:border-gray-300"}`}
                    >
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" value={plan.id} checked={selectedPlan === plan.id} onChange={() => setSelectedPlan(plan.id)} className="accent-[#1A7A3A]" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1F2937]">{plan.name}</span>
                            {plan.popular && <span className="bg-[#1A7A3A] text-white text-xs px-2 py-0.5 rounded-full">Popular</span>}
                          </div>
                          <span className="text-xs text-gray-500">{plan.desc}</span>
                        </div>
                      </div>
                      <span className="font-bold text-[#1A7A3A]">{plan.price}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center">14-day free trial · No credit card required · Cancel anytime</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              <Button type="submit" loading={loading} size="lg" className="flex-1">
                {step < 2 ? "Continue" : "Complete Setup"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
