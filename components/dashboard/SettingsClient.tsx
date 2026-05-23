"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";
import { useRouter } from "next/navigation";

const TABS = ["Organisation", "Team", "Billing", "Security", "Integrations"];

const INTEGRATIONS = [
  { name: "Xero",          description: "Sync income and expense entries",    connected: false, logo: "X"  },
  { name: "MYOB",          description: "Sync accounting and billing records", connected: false, logo: "MY" },
  { name: "NLIS",          description: "National Livestock Identification",   connected: false, logo: "NL" },
  { name: "OpenWeatherMap",description: "Real-time weather data",              connected: false, logo: "W"  },
  { name: "AgriDigital",   description: "Grain commodity integration",         connected: false, logo: "AD" },
  { name: "Stripe Billing",description: "Subscription management",             connected: false, logo: "S"  },
];

const ROLE_OPTIONS = [
  { value: "MANAGER",    label: "Manager" },
  { value: "AGRONOMIST", label: "Agronomist" },
  { value: "FARMHAND",   label: "Staff" },
  { value: "READ_ONLY",  label: "Supplier" },
];

interface Org        { id: string; name: string; slug: string; plan: string; }
interface User       { id: string; name: string; email: string; role: string; image: string | null; location: string; operationType: string; farmSize: number | null; }
interface TeamMember { id: string; name: string; email: string; role: string; image: string | null; }
interface Invite     { id: string; email: string; name: string | null; role: string; invited_by_name: string | null; expires_at: string; created_at: string; }

interface Props { org: Org | null; user: User; team: TeamMember[]; invites: Invite[]; }

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function SettingsClient({ org, user, team, invites: initialInvites }: Props) {
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

  // Team state
  const [members,       setMembers]       = useState(team);
  const [pendingInvites,setPendingInvites] = useState(initialInvites);
  const [showModal,     setShowModal]     = useState(false);
  const [inviteName,    setInviteName]    = useState("");
  const [inviteEmail,   setInviteEmail]   = useState("");
  const [inviteRole,    setInviteRole]    = useState("MANAGER");
  const [inviting,      setInviting]      = useState(false);
  const [inviteError,   setInviteError]   = useState("");
  const [removingId,    setRemovingId]    = useState<string | null>(null);
  const [resendingId,   setResendingId]   = useState<string | null>(null);
  const [revokingId,    setRevokingId]    = useState<string | null>(null);

  // Integrations state
  const [connections, setConnections] = useState(INTEGRATIONS);

  const isOwner = user.role === "OWNER";

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

  const handleInvite = async () => {
    setInviteError("");
    if (!inviteEmail.trim()) { setInviteError("Email is required"); return; }
    setInviting(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) { setInviteError(data.error ?? "Failed to send invite"); return; }
      setShowModal(false);
      setInviteName(""); setInviteEmail(""); setInviteRole("MANAGER");
      router.refresh();
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this team member? They will lose access immediately.")) return;
    setRemovingId(memberId);
    try {
      await fetch(`/api/team/${memberId}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } finally {
      setRemovingId(null);
    }
  };

  const handleResend = async (inviteId: string) => {
    setResendingId(inviteId);
    try {
      const res = await fetch("/api/team/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });
      if (!res.ok) { alert("Failed to resend invite"); return; }
      alert("Invite resent successfully!");
    } finally {
      setResendingId(null);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    if (!confirm("Revoke this invite?")) return;
    setRevokingId(inviteId);
    try {
      await fetch("/api/team/resend", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });
      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } finally {
      setRevokingId(null);
    }
  };

  const toggleConnection = (name: string) => {
    setConnections((prev) =>
      prev.map((item) => item.name === name ? { ...item, connected: !item.connected } : item)
    );
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
              <Input label="Organisation Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Your farm or company name" />
              <Input label="Slug" value={orgSlug} onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="my-farm" />
              <Input label="Your Name" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Full name" />
              <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Dalby, QLD" />
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
                <Button size="sm" onClick={handleSave} loading={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
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
                   : org?.plan === "enterprise"  ? "Unlimited · Custom SLA"
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
        <div className="max-w-2xl space-y-4">
          {/* Active members */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({members.length})</CardTitle>
              {isOwner && (
                <Button size="sm" onClick={() => setShowModal(true)}>Invite Member</Button>
              )}
            </CardHeader>

            {members.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No team members yet.</p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#1A7A3A] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {initials(member.name || member.email)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1F2937]">{member.name || member.email}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="green" className="capitalize">{member.role.toLowerCase()}</Badge>
                      {isOwner && member.id !== user.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={removingId === member.id}
                          onClick={() => handleRemove(member.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending invites */}
          {isOwner && pendingInvites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invites ({pendingInvites.length})</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">
                        {(invite.name ?? invite.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1F2937]">{invite.name ?? invite.email}</p>
                        <p className="text-xs text-gray-500">{invite.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="green" className="capitalize bg-amber-100 text-amber-700 border-amber-200">
                        {invite.role.toLowerCase()} · pending
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        loading={resendingId === invite.id}
                        onClick={() => handleResend(invite.id)}
                      >
                        Resend
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={revokingId === invite.id}
                        onClick={() => handleRevoke(invite.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
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
                { label: "Two-Factor Authentication",  sub: "Required for Owner and Manager roles",      enabled: false },
                { label: "Session Timeout",            sub: "Auto-logout after 8 hours of inactivity",   enabled: true  },
                { label: "API Access Logging",         sub: "Log all API key usage and webhook events",   enabled: true  },
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

      {/* Integrations tab */}
      {activeTab === "Integrations" && (
        <div className="max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Applications</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Link external software and state devices to synchronize your crop, livestock, financial, and atmospheric operations.
              </p>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {connections.map((int) => (
                <div key={int.name} className="flex items-center justify-between p-4 rounded-xl border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner ${int.connected ? "bg-[#1A7A3A]/10 text-[#1A7A3A] border border-[#1A7A3A]/20" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                      {int.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#1F2937]">{int.name}</p>
                        {int.connected && (
                          <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Connected</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{int.description}</p>
                    </div>
                  </div>
                  <Button size="sm" variant={int.connected ? "outline" : "primary"} className="flex-shrink-0" onClick={() => toggleConnection(int.name)}>
                    {int.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Invite modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#1F2937]">Invite Team Member</h2>
              <button
                onClick={() => { setShowModal(false); setInviteError(""); }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Role <span className="text-red-500">*</span></label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {inviteError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{inviteError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowModal(false); setInviteError(""); }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                loading={inviting}
                onClick={handleInvite}
              >
                {inviting ? "Sending…" : "Send Invite"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}