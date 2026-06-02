import Link from "next/link";
import { getGateCompletionStats, getSignedFormIds } from "@/lib/whs-queries";
import { getFormsUserCanFill } from "@/lib/whs-schemas";
import type { UserRole } from "@/lib/permissions";

interface Props {
  orgId: string;
  userId: string;
  userRole: UserRole;
}

export async function WHSStatusWidget({ orgId, userId, userRole }: Props) {
  if (userRole === "READ_ONLY") return null;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#F0FDF4] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#1F2937]">Safety & WHS</span>
        </div>
        <Link href="/safety" className="text-xs text-[#1A7A3A] font-medium hover:underline">
          View →
        </Link>
      </div>
      <WidgetBody orgId={orgId} userId={userId} userRole={userRole} />
    </div>
  );
}

async function WidgetBody({ orgId, userId, userRole }: Props) {
  if (userRole === "OWNER") {
    const { total, completed } = await getGateCompletionStats(orgId);
    const pct = total > 0 ? Math.round((completed / total) * 100) : 100;
    const pending = total - completed;

    return (
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-[#1F2937]">{pct}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Team onboarding complete</p>
          </div>
          {pending > 0 && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg font-medium">
              {pending} member{pending !== 1 ? "s" : ""} pending
            </span>
          )}
        </div>
        <div className="w-full bg-[#F3F4F6] rounded-full h-1.5">
          <div
            className="bg-[#1A7A3A] h-1.5 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <Link href="/safety?tab=compliance" className="text-xs text-[#1A7A3A] hover:underline font-medium">
          View full compliance report →
        </Link>
      </div>
    );
  }

  if (userRole === "MANAGER") {
    const myForms = getFormsUserCanFill(userRole);
    const signedIds = await getSignedFormIds(userId, orgId);
    const pending = myForms.filter((f) => !signedIds.has(f.id));
    const { total, completed } = await getGateCompletionStats(orgId);
    const teamPending = total - completed;

    return (
      <div className="space-y-2.5">
        {teamPending > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
            <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-amber-800 font-medium">
              {teamPending} team member{teamPending !== 1 ? "s" : ""} yet to complete WHS onboarding
            </p>
          </div>
        )}
        {pending.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1.5">Your pending forms:</p>
            <ul className="space-y-1">
              {pending.slice(0, 3).map((f) => (
                <li key={f.id} className="flex items-center gap-1.5 text-xs text-gray-700">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                  <span className="font-medium text-[#1A7A3A]">{f.id}</span>
                  <span className="truncate text-gray-500">{f.title}</span>
                </li>
              ))}
              {pending.length > 3 && (
                <li className="text-xs text-gray-400 pl-3">+{pending.length - 3} more</li>
              )}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-[#1A7A3A] font-medium flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Your forms are all up to date
          </p>
        )}
      </div>
    );
  }

  // AGRONOMIST + FARMHAND
  const myForms = getFormsUserCanFill(userRole);
  const signedIds = await getSignedFormIds(userId, orgId);
  const pending = myForms.filter((f) => !signedIds.has(f.id));

  if (userRole === "FARMHAND") {
    const allDone = pending.length === 0;
    return (
      <div>
        {allDone ? (
          <p className="text-sm font-medium text-[#1A7A3A] flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            WHS onboarding complete
          </p>
        ) : (
          <div>
            <p className="text-xs text-amber-700 font-medium mb-1">
              {pending.length} form{pending.length !== 1 ? "s" : ""} pending your signature
            </p>
            <Link href="/safety" className="text-xs text-[#1A7A3A] font-medium hover:underline">
              Complete now →
            </Link>
          </div>
        )}
      </div>
    );
  }

  // AGRONOMIST
  return (
    <div>
      {pending.length === 0 ? (
        <p className="text-sm font-medium text-[#1A7A3A] flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          All forms up to date
        </p>
      ) : (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500">Pending forms:</p>
          {pending.slice(0, 2).map((f) => (
            <div key={f.id} className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#1A7A3A]">{f.id}</span>
              <span className="text-gray-600 truncate">{f.title}</span>
            </div>
          ))}
          {pending.length > 2 && (
            <p className="text-xs text-gray-400">+{pending.length - 2} more</p>
          )}
        </div>
      )}
    </div>
  );
}
