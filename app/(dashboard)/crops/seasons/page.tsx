import { auth } from "@/auth";
import { getOrgByEmail, getSeasons } from "@/lib/queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { AddSeasonModal } from "@/components/dashboard/AddSeasonModal";

type Season = Awaited<ReturnType<typeof getSeasons>>[number];

const STATUS = {
  active: {
    label: "Active",
    dot: "#22C55E",
    text: "#166534",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    stripe: "#22C55E",
  },
  planning: {
    label: "Planning",
    dot: "#F59E0B",
    text: "#92400E",
    bg: "#FFFBEB",
    border: "#FDE68A",
    stripe: "#F59E0B",
  },
  harvested: {
    label: "Harvested",
    dot: "#9CA3AF",
    text: "#374151",
    bg: "#F3F4F6",
    border: "#E5E7EB",
    stripe: "#9CA3AF",
  },
} as const;

function daysSince(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

function daysUntil(iso: string) {
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function SeasonCard({ s }: { s: Season }) {
  const cfg = STATUS[s.status as keyof typeof STATUS] ?? STATUS.harvested;
  const days = daysSince(s.planted_at);
  const isUpcoming = new Date(s.planted_at) > new Date();
  const progressPct = s.status === "active" ? Math.min(Math.round((days / 150) * 100), 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:shadow-sm transition-shadow group">
      <div className="flex">
        {/* Status stripe */}
        <div className="w-1 shrink-0" style={{ backgroundColor: cfg.stripe }} />

        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5">
          {/* Primary info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#1F2937] text-sm">{s.field_name}</span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-md border"
                style={{ color: cfg.text, background: cfg.bg, borderColor: cfg.border }}
              >
                {s.crop_type}
              </span>
            </div>

            {/* Context line */}
            <div className="mt-1.5">
              {s.status === "active" && (
                <div className="flex items-center gap-2.5">
                  <div className="w-24 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${progressPct}%`, backgroundColor: cfg.stripe }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{days} day{days !== 1 ? "s" : ""} in season</span>
                </div>
              )}
              {s.status === "planning" && (
                <p className="text-xs text-gray-400">
                  {isUpcoming
                    ? `Planting in ${daysUntil(s.planted_at)} day${daysUntil(s.planted_at) !== 1 ? "s" : ""}`
                    : `Planting date: ${fmtDate(s.planted_at)}`}
                </p>
              )}
              {s.status === "harvested" && (
                <p className="text-xs text-gray-400">
                  {s.yield_kg != null
                    ? `Yield: ${s.yield_kg.toLocaleString()} kg`
                    : `Season of ${days} days`}
                  {s.harvested_at && ` · Harvested ${fmtDate(s.harvested_at)}`}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="hidden md:flex flex-col items-end gap-0.5 shrink-0">
            <p className="text-xs text-gray-500">Planted {fmtDate(s.planted_at)}</p>
            {s.harvested_at && (
              <p className="text-xs text-gray-400">Harvested {fmtDate(s.harvested_at)}</p>
            )}
          </div>

          {/* Status badge */}
          <div className="shrink-0">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
              style={{ color: cfg.text, background: cfg.bg, borderColor: cfg.border }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
              {cfg.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function SeasonsPage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const seasons = orgId ? await getSeasons(orgId) : [];

  const counts = {
    total:     seasons.length,
    active:    seasons.filter((s) => s.status === "active").length,
    planning:  seasons.filter((s) => s.status === "planning").length,
    harvested: seasons.filter((s) => s.status === "harvested").length,
  };

  const sorted = [...seasons].sort((a, b) => {
    const order: Record<string, number> = { active: 0, planning: 1, harvested: 2 };
    const diff = (order[a.status] ?? 3) - (order[b.status] ?? 3);
    if (diff !== 0) return diff;
    return new Date(b.planted_at).getTime() - new Date(a.planted_at).getTime();
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Seasons"
        subtitle="Track planting, growing, and harvest cycles"
        actions={<AddSeasonModal />}
      />

      <div className="flex-1 overflow-y-auto p-5">

        {/* Summary tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            {
              label: "Total Seasons",
              value: counts.total,
              iconBg: "#F3F4F6",
              iconColor: "#6B7280",
              valColor: "#1F2937",
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              label: "Active",
              value: counts.active,
              iconBg: "#F0FDF4",
              iconColor: "#1A7A3A",
              valColor: "#166534",
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ),
            },
            {
              label: "Planning",
              value: counts.planning,
              iconBg: "#FFFBEB",
              iconColor: "#D97706",
              valColor: "#92400E",
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ),
            },
            {
              label: "Harvested",
              value: counts.harvested,
              iconBg: "#F3F4F6",
              iconColor: "#6B7280",
              valColor: "#374151",
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
                </svg>
              ),
            },
          ].map((tile) => (
            <div
              key={tile.label}
              className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3.5 flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: tile.iconBg, color: tile.iconColor }}
              >
                {tile.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500">{tile.label}</p>
                <p className="text-lg font-bold leading-tight" style={{ color: tile.valColor }}>
                  {tile.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Seasons list */}
        {seasons.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] py-20 text-center">
            <div className="w-12 h-12 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#1F2937]">No seasons recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">Add fields first, then log a season to track your crop cycles.</p>
          </div>
        ) : (
          <>
            {/* Group: Active */}
            {counts.active > 0 && (
              <section className="mb-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Active — {counts.active}
                  </h2>
                </div>
                <div className="space-y-2">
                  {sorted
                    .filter((s) => s.status === "active")
                    .map((s) => <SeasonCard key={s.id} s={s} />)}
                </div>
              </section>
            )}

            {/* Group: Planning */}
            {counts.planning > 0 && (
              <section className="mb-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Planning — {counts.planning}
                  </h2>
                </div>
                <div className="space-y-2">
                  {sorted
                    .filter((s) => s.status === "planning")
                    .map((s) => <SeasonCard key={s.id} s={s} />)}
                </div>
              </section>
            )}

            {/* Group: Harvested */}
            {counts.harvested > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Harvested — {counts.harvested}
                  </h2>
                </div>
                <div className="space-y-2">
                  {sorted
                    .filter((s) => s.status === "harvested")
                    .map((s) => <SeasonCard key={s.id} s={s} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
