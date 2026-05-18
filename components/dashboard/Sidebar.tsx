"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [{ href: "/overview", label: "Dashboard", icon: "grid" }],
  },
  {
    label: "Crops",
    items: [
      { href: "/crops/fields",  label: "Fields",       icon: "map"     },
      { href: "/crops/seasons", label: "Seasons",      icon: "sun"     },
      { href: "/crops/sprays",  label: "Spray Records",icon: "droplet" },
    ],
  },
  {
    label: "Livestock",
    items: [
      { href: "/livestock/animals",  label: "Animals",      icon: "tag"      },
      { href: "/livestock/mobs",     label: "Mobs & Paddocks", icon: "users" },
      { href: "/livestock/health",   label: "Health Events",icon: "heart"    },
      { href: "/livestock/breeding", label: "Breeding",     icon: "git-merge"},
    ],
  },
  {
    label: "Finance & Compliance",
    items: [
      { href: "/finance",    label: "Financials", icon: "dollar-sign" },
      { href: "/compliance", label: "Compliance", icon: "shield"      },
    ],
  },
  {
    label: "Intelligence",
    items: [{ href: "/ai-advisor", label: "AI Advisor", icon: "cpu" }],
  },
];

const icons: Record<string, React.ReactNode> = {
  grid: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  map: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  sun: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  droplet: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 2C12 2 6 9 6 14a6 6 0 0012 0c0-5-6-12-6-12z" /></svg>,
  tag: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>,
  users: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  heart: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  "git-merge": <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 6v12m8-12v4m0 0a4 4 0 01-4 4H8m8-4a4 4 0 014 4v2" /></svg>,
  "dollar-sign": <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  shield: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  cpu: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2h-2M9 3a2 2 0 002 2h2a2 2 0 002-2M9 3a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
};

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface SidebarProps {
  orgId: string;
  orgName: string;
  organizations: Organization[];
  userName: string;
  userEmail: string;
  userImage: string | null;
  plan: string;
}

export function Sidebar({ orgId, orgName, organizations, userName, userEmail, userImage, plan }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleSwitch = async (targetOrgId: string) => {
    if (targetOrgId === orgId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orgs/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: targetOrgId }),
      });
      if (res.ok) {
        setIsDropdownOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      farmName: fd.get("farmName"),
      location: fd.get("location"),
      operation: fd.get("operation"),
      farmSize: fd.get("farmSize"),
      animalCount: fd.get("animalCount"),
    };

    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setIsDropdownOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside className="w-64 bg-[#0D3320] flex flex-col h-full relative z-20">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-[#1A7A3A] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">AF</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">AIAG Farming</p>
            <p className="text-white/40 text-xs capitalize">{plan} Plan</p>
          </div>
        </div>

        {/* Farm / Org selector */}
        <div className="px-3 py-3 border-b border-white/10 relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#1A7A3A] rounded-md flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <span className="text-white/80 text-xs font-medium truncate max-w-[140px]">{orgName}</span>
            </div>
            <svg
              className={cn("w-3 h-3 text-white/40 flex-shrink-0 transition-transform", isDropdownOpen && "rotate-180")}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-[#154a30] border border-white/10 rounded-lg shadow-xl overflow-hidden z-30 py-1">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSwitch(org.id)}
                  disabled={loading}
                  className={cn(
                    "w-full text-left px-4 py-2 text-xs transition-colors",
                    org.id === orgId ? "text-white bg-white/5" : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{org.name}</span>
                    {org.id === orgId && (
                      <svg className="w-3 h-3 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
              <div className="h-px bg-white/10 my-1"></div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full text-left px-4 py-2 text-xs text-[#4ADE80] hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Farm / Organisation
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-2">{group.label}</p>
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all",
                      active
                        ? "bg-[#1A7A3A] text-white font-medium shadow-sm"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <span className={active ? "text-white" : "text-white/50"}>{icons[item.icon]}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            <Link href="/settings" className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-7 h-7 bg-[#1A7A3A] rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                {userImage ? (
                  <Image src={userImage} alt="" width={28} height={28} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-white/80 text-xs font-medium truncate">{userName}</p>
                <p className="text-white/40 text-xs truncate">{userEmail}</p>
              </div>
            </Link>
            <Link href="/settings" className="p-1.5 rounded-md hover:bg-white/10 flex-shrink-0" aria-label="Settings">
              <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
          <div className="px-4 pt-1">
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/home" })}
              className="text-white/50 hover:text-white text-xs"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Add Farm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Add New Farm</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddFarm} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organisation / Farm Name *</label>
                <input required name="farmName" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A7A3A]/30 focus:border-[#1A7A3A]" placeholder="e.g. Whitfield Station" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Location *</label>
                <input required name="location" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A7A3A]/30 focus:border-[#1A7A3A]" placeholder="e.g. Dubbo, NSW" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Operation</label>
                <select name="operation" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A7A3A]/30 focus:border-[#1A7A3A] bg-white">
                  <option value="mixed">Mixed Farming</option>
                  <option value="cropping">Broadacre Cropping</option>
                  <option value="livestock">Livestock Only</option>
                  <option value="horticulture">Horticulture</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size (acres)</label>
                  <input name="farmSize" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A7A3A]/30 focus:border-[#1A7A3A]" placeholder="e.g. 5000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Animal Count</label>
                  <input name="animalCount" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A7A3A]/30 focus:border-[#1A7A3A]" placeholder="e.g. 2000" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-[#1A7A3A] text-white rounded-lg hover:bg-[#166031] transition-colors disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Farm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
