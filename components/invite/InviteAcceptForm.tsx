"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

interface Props {
  token: string;
  email: string;
  orgName: string;
  role: string;
  invitedName: string | null;
  invitedBy: string | null;
  userExists: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  MANAGER: "Manager",
  AGRONOMIST: "Agronomist",
  FARMHAND: "Staff",
  READ_ONLY: "Supplier",
};

export function InviteAcceptForm({ token, email, orgName, role, invitedName, invitedBy, userExists }: Props) {
  const [name,     setName]     = useState(invitedName ?? "");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);

  const roleLabel = ROLE_LABELS[role] ?? role;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/invite/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setDone(true);

      // Auto sign-in with credentials
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/overview",
      });
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome aboard!</h2>
        <p className="text-gray-500 text-sm">Signing you in to {orgName}…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Invite banner */}
      <div className="bg-[#E8F5EC] border border-[#c3e6cc] rounded-xl p-4 text-center">
        <p className="text-sm text-[#1A7A3A]">
          {invitedBy ? (
            <><strong>{invitedBy}</strong> has invited you to join</>
          ) : (
            <>You have been invited to join</>
          )}
        </p>
        <p className="text-lg font-bold text-[#0D3320] mt-1">{orgName}</p>
        <span className="inline-block mt-1 text-xs bg-white text-[#1A7A3A] border border-[#c3e6cc] px-3 py-1 rounded-full font-medium">
          {roleLabel}
        </span>
      </div>

      {/* Email — read-only */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
        />
      </div>

      {/* Name — only for new users */}
      {!userExists && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
          />
        </div>
      )}

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {userExists ? "Your Password" : "Create Password"}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={userExists ? "Enter your password" : "At least 8 characters"}
          required
          minLength={userExists ? 1 : 8}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
        />
        {!userExists && (
          <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-[#1A7A3A] hover:bg-[#155f2d] disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors"
      >
        {loading ? "Joining…" : userExists ? "Sign In & Join" : "Accept Invite & Join"}
      </button>

      {userExists && (
        <p className="text-xs text-center text-gray-400">
          Already have an account with this email? Enter your password to join {orgName}.
        </p>
      )}
    </form>
  );
}