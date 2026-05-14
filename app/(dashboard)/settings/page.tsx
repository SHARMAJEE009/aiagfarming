"use client";
import { useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";

const tabs = ["Organisation", "Team", "Integrations", "Billing", "Security"];

const teamMembers = [
  { name: "James Whitfield", email: "james@whitfieldstation.com.au", role: "Owner", status: "active" },
  { name: "Sarah O'Brien", email: "sarah@whitfieldstation.com.au", role: "Manager", status: "active" },
  { name: "Mike Chen", email: "mike@agroagronomy.com.au", role: "Agronomist", status: "active" },
  { name: "Tom Rivers", email: "tom@whitfieldstation.com.au", role: "Farmhand", status: "pending" },
];

const integrations = [
  { name: "Xero", description: "Sync income and expense entries to your Xero ledger", connected: true, logo: "X" },
  { name: "QuickBooks", description: "Connect your QuickBooks Online account", connected: false, logo: "QB" },
  { name: "NLIS", description: "National Livestock Identification System sync", connected: true, logo: "NL" },
  { name: "OpenWeatherMap", description: "Real-time and forecast weather data", connected: true, logo: "W" },
  { name: "AgriDigital", description: "Grain commodity and trading integration", connected: false, logo: "AD" },
  { name: "Stripe Billing", description: "Subscription and payment management", connected: true, logo: "S" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Organisation");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Settings" subtitle="Manage your organisation, team and integrations" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Tab nav */}
        <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1 mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-white text-[#1A7A3A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Organisation" && (
          <div className="max-w-2xl space-y-6">
            <Card>
              <CardHeader><CardTitle>Organisation Details</CardTitle></CardHeader>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Organisation Name" defaultValue="Whitfield Station Pty Ltd" />
                <Input label="Slug" defaultValue="whitfield-station" />
                <Input label="Primary Contact" defaultValue="James Whitfield" />
                <Input label="Email" defaultValue="james@whitfieldstation.com.au" />
                <Input label="Phone" defaultValue="+61 7 4662 XXXX" />
                <Input label="ABN" defaultValue="12 345 678 901" />
              </div>
              <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                <Input label="Address" defaultValue="Lot 1 Station Road, Dalby QLD 4405" />
              </div>
              <div className="mt-4 flex justify-end">
                <Button size="sm">Save Changes</Button>
              </div>
            </Card>
            <Card>
              <CardHeader><CardTitle>Farm Settings</CardTitle></CardHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Currency</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm">
                    <option>AUD — Australian Dollar</option>
                    <option>USD — US Dollar</option>
                    <option>GBP — British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Units</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm">
                    <option>Metric (ha, kg, km)</option>
                    <option>Imperial (acres, lb, miles)</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button size="sm">Save Changes</Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "Team" && (
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <Button size="sm">Invite Member</Button>
            </CardHeader>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.email} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1A7A3A] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={member.status === "active" ? "green" : "amber"} className="capitalize">{member.status}</Badge>
                    <select defaultValue={member.role} className="text-sm border border-[#E5E7EB] rounded-lg px-2 py-1 bg-white">
                      {["Owner", "Manager", "Agronomist", "Farmhand", "Read-only"].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <Button size="sm" variant="ghost">Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "Integrations" && (
          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map((int) => (
              <Card key={int.name}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0D3320] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {int.logo}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F2937]">{int.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{int.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {int.connected && <Badge variant="green">Connected</Badge>}
                    <Button size="sm" variant={int.connected ? "outline" : "primary"}>
                      {int.connected ? "Manage" : "Connect"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "Billing" && (
          <div className="max-w-2xl space-y-6">
            <Card>
              <CardHeader><CardTitle>Current Plan</CardTitle></CardHeader>
              <div className="flex items-center justify-between p-4 bg-[#E8F5EC] rounded-xl border border-[#c3e6cc]">
                <div>
                  <p className="font-bold text-[#0D3320] text-lg">Professional Plan</p>
                  <p className="text-sm text-[#1A7A3A]">Up to 10 users · All 6 modules · AI Advisory</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#1A7A3A]">$129<span className="text-base font-normal">/mo</span></p>
                  <p className="text-xs text-gray-500">Billed monthly</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button size="sm" variant="primary">Upgrade to Enterprise</Button>
                <Button size="sm" variant="outline">Switch to Annual (Save 20%)</Button>
              </div>
            </Card>
            <Card>
              <CardHeader><CardTitle>Billing Details</CardTitle></CardHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Next billing date</span><span className="font-medium">1 June 2025</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Payment method</span><span className="font-medium">Visa ending 4242</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Billing email</span><span className="font-medium">james@whitfieldstation.com.au</span></div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline">Update Payment Method</Button>
                <Button size="sm" variant="outline">View Invoices</Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "Security" && (
          <div className="max-w-2xl space-y-6">
            <Card>
              <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
              <div className="space-y-4">
                {[
                  { label: "Two-Factor Authentication", sub: "Required for Owner and Manager roles", enabled: true },
                  { label: "Single Sign-On (SSO)", sub: "Connect Google Workspace or Microsoft Entra ID", enabled: false },
                  { label: "Session Timeout", sub: "Auto-logout after 8 hours of inactivity", enabled: true },
                  { label: "API Access Logging", sub: "Log all API key usage and webhook events", enabled: true },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between py-3 border-b border-[#F3F4F6]">
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">{setting.label}</p>
                      <p className="text-xs text-gray-500">{setting.sub}</p>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${setting.enabled ? "bg-[#1A7A3A]" : "bg-gray-200"} relative`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${setting.enabled ? "translate-x-6" : "translate-x-1"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
