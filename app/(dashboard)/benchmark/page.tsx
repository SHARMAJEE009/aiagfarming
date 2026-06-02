import { auth } from "@/auth";
import { getOrgByEmail, getBenchmarkData } from "@/lib/queries";
import { TopBar } from "@/components/dashboard/TopBar";
import { BenchmarkView } from "@/components/dashboard/BenchmarkView";

export default async function BenchmarkPage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const data = orgId ? await getBenchmarkData(orgId) : { seasons: [], annualFinance: [] };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Benchmark"
        subtitle="Compare yield, cost, and revenue across seasons"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <BenchmarkView seasons={data.seasons} annualFinance={data.annualFinance} />
      </div>
    </div>
  );
}
