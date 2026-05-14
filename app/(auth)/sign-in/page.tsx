"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button, Input } from "@/components/ui";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleGoogle = () => {
    setOauthLoading(true);
    void signIn("google", { callbackUrl: "/overview" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        window.location.href = "/overview";
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen flex bg-[#F9FAFB]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0D3320] via-[#1A7A3A] to-[#2d8e4e] flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AF</span>
          </div>
          <span className="text-white font-bold text-lg">AIAG Farming</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-snug">
            Your farm.<br />Your data.<br />One platform.
          </h1>
          <p className="text-white/70 text-lg">
            Manage crops, livestock, finances and compliance from a single beautifully designed interface.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: "Active Farms", value: "2,000+" },
              { label: "Animals Tracked", value: "1.2M+" },
              { label: "Avg Time Saved", value: "6h/week" },
              { label: "Customer NPS", value: "72" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/60 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-sm">© 2026 AIAG Farming · Data hosted in Australia</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#1A7A3A] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AF</span>
            </div>
            <span className="font-bold text-lg text-[#0D3320]">AIAG Farming</span>
          </div>

          <h2 className="text-2xl font-bold text-[#0D3320] mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to your AIAG Farming account</p>

          {/* Google SSO */}
          <button
            type="button"
            disabled={oauthLoading}
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border border-[#E5E7EB] rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4 disabled:opacity-60 disabled:pointer-events-none"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {oauthLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="james@farm.com.au"
              required
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              <div className="flex justify-end mt-1">
                <a href="#" className="text-xs text-[#1A7A3A] hover:underline">Forgot password?</a>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#1A7A3A] font-medium hover:underline">Start free trial</Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            Protected by 2FA · AES-256 encryption · Hosted in Australia
          </p>
        </div>
      </div>
    </div>
  );
}
