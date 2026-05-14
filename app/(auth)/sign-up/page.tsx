"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

const plans = [
  { id: "starter", name: "Starter", price: "$49/mo", desc: "Up to 3 users, 500 acres" },
  { id: "professional", name: "Professional", price: "$129/mo", desc: "Up to 10 users, all modules", popular: true },
  { id: "enterprise", name: "Enterprise", price: "Custom", desc: "Unlimited, custom SLA" },
];

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [oauthLoading, setOauthLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
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

  const startGoogle = () => {
    setOauthLoading(true);
    void signIn("google", { callbackUrl: "/overview" });
  };

  const handleManualSignUp = async () => {
    setManualLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan
        })
      });

      if (response.ok) {
        // Auto sign in after successful registration
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false
        });

        if (signInResult?.ok) {
          router.push("/overview");
        } else {
          alert("Account created but sign in failed. Please try signing in manually.");
          router.push("/sign-in");
        }
      } else {
        const error = await response.text();
        alert(`Registration failed: ${error}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setManualLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    // Final step - create account
    await handleManualSignUp();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#1A7A3A] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AF</span>
            </div>
            <span className="font-bold text-lg text-[#0D3320]">AIAG Farming</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0D3320]">Start your 14-day free trial</h1>
          <p className="text-gray-500 text-sm mt-1">No credit card required · Cancel anytime</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Account", "Farm Details", "Select Plan"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i + 1 <= step ? "bg-[#1A7A3A] text-white" : "bg-[#E5E7EB] text-gray-400"}`}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs ${i + 1 <= step ? "text-[#1A7A3A] font-medium" : "text-gray-400"}`}>{label}</span>
              {i < 2 && <div className={`h-px w-8 ${i + 1 < step ? "bg-[#1A7A3A]" : "bg-[#E5E7EB]"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Create your account</h2>
                <button
                  type="button"
                  disabled={oauthLoading}
                  onClick={startGoogle}
                  className="w-full flex items-center justify-center gap-3 border border-[#E5E7EB] rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:pointer-events-none"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {oauthLoading ? "Redirecting…" : "Sign up with Google"}
                </button>
                <div className="flex items-center gap-3"><div className="flex-1 h-px bg-[#E5E7EB]" /><span className="text-xs text-gray-400">or</span><div className="flex-1 h-px bg-[#E5E7EB]" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="James"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Whitfield"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="james@farm.com.au"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  required
                  helper="At least 8 characters with a number and symbol"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
              </div>
            )}

            {step === 2 && (
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

            {step === 3 && (
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
              <Button type="submit" loading={manualLoading} size="lg" className="flex-1">
                {step < 3 ? "Continue" : "Create Account"}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[#1A7A3A] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
