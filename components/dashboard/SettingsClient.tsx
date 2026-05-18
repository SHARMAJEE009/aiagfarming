"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";
import { useRouter } from "next/navigation";

const TABS = ["Organisation", "Team", "Billing", "Security"];

const INTEGRATIONS = [
  { name: "Xero",          description: "Sync income and expense entries",   connected: false, logo: "X"  },
  { name: "NLIS",          description: "National Livestock Identification",  connected: false, logo: "NL" },
  { name: "OpenWeatherMap",description: "Real-time weather data",             connected: false, logo: "W"  },
  { name: "AgriDigital",   description: "Grain commodity integration",        connected: false, logo: "AD" },
  { name: "Stripe Billing",description: "Subscription management",            connected: false, logo: "S"  },
];

interface Org  { id: string; name: string; slug: string; plan: string; }
interface User {
  id: string; name: string; email: string; role: string;
  image: string | null; location: string; operationType: string; farmSize: number | null;
}
interface TeamMember { id: string; name: string; email: string; role: string; image: string | null; }

interface Props { org: Org | null; user: User; team: TeamMember[]; }

export function SettingsClient({ org, user, team }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Organisation");
  const [saving, setSaving]       = useState(false);
  const [saved,  setSaved]        = useState(false);

  // Org form state
  const [orgName,  setOrgName]  = useState(org?.name  ?? "");
  const [orgSlug,  setOrgSlug]  = useState(org?.slug  ?? "");
  const [userName, setUserName] = useState(user.name  ?? "");
  const [location, setLocation] = useState(user.location ?? "");
  const [opType,   setOpType]   = useState(user.operationType ?? "");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/org", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, orgSlug, userName, location, operationType: opType }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      } else {
        alert("Failed to save. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Tab nav */}
      <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1 mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? "bg-white text-[#1A7A3A] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Organisation tab */}
      {activeTab === "Organisation" && (
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader><CardTitle>Organisation Details</CardTitle></CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Organisation Name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Your farm or company name"
              />
              <Input
                label="Slug"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="my-farm"
              />
              <Input
                label="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Full name"
              />
              <Input
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dalby, QLD"
              />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#374151] mb-1">Primary Operation</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                  value={opType}
                  onChange={(e) => setOpType(e.target.value)}
                >
                  <option value="">Select operation type</option>
                  <option>Mixed (Crops + Livestock)</option>
                  <option>Crop Farming</option>
                  <option>Livestock Only</option>
                  <option>Consulting Agronomist</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              {saved && <span className="text-sm text-green-600 font-medium">✓ Saved successfully</span>}
              <div className="ml-auto">
                <Button size="sm" onClick={handleSave} loading={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Plan</CardTitle></CardHeader>
            <div className="flex items-center justify-between p-4 bg-[#E8F5EC] rounded-xl border border-[#c3e6cc]">
              <div>
                <p className="font-bold text-[#0D3320] text-lg capitalize">{org?.plan ?? "Starter"} Plan</p>
                <p className="text-sm text-[#1A7A3A]">
                  {org?.plan === "professional" ? "Up to 10 users · All 6 modules · AI Advisory"
                   : org?.plan === "enterprise"   ? "Unlimited · Custom SLA"
                   : "Up to 3 users · Core modules"}
                </p>
              </div>
              <Badge variant="green" className="capitalize">{org?.plan ?? "starter"}</Badge>
            </div>
          </Card>
        </div>
      )}

      {/* Team tab */}
      {activeTab === "Team" && (
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({team.length})</CardTitle>
            <Button size="sm">Invite Member</Button>
          </CardHeader>
          {team.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              No team members yet. Invite colleagues to collaborate.
            </p>
          ) : (
            <div className="space-y-3">
              {team.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1A7A3A] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="green" className="capitalize">{member.role.toLowerCase()}</Badge>
                    <Button size="sm" variant="ghost">Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Billing tab */}
      {activeTab === "Billing" && (
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader><CardTitle>Current Plan</CardTitle></CardHeader>
            <div className="flex items-center justify-between p-4 bg-[#E8F5EC] rounded-xl border border-[#c3e6cc]">
              <div>
                <p className="font-bold text-[#0D3320] text-lg capitalize">{org?.plan ?? "Starter"} Plan</p>
              </div>
              <Button size="sm" variant="primary">Upgrade Plan</Button>
            </div>
            <div className="mt-4 flex gap-3">
              <Button size="sm" variant="outline">Update Payment Method</Button>
              <Button size="sm" variant="outline">View Invoices</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Security tab */}
      {activeTab === "Security" && (
        <div className="max-w-2xl">
          <Card>
            <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
            <div className="space-y-4">
              {[
                { label: "Two-Factor Authentication",  sub: "Required for Owner and Manager roles",         enabled: false },
                { label: "Session Timeout",            sub: "Auto-logout after 8 hours of inactivity",      enabled: true  },
                { label: "API Access Logging",         sub: "Log all API key usage and webhook events",      enabled: true  },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-3 border-b border-[#F3F4F6]">
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">{s.label}</p>
                    <p className="text-xs text-gray-500">{s.sub}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${s.enabled ? "bg-[#1A7A3A]" : "bg-gray-200"} relative`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.enabled ? "translate-x-6" : "translate-x-1"}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
