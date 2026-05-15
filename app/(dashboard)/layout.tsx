import { Sidebar } from "@/components/dashboard/Sidebar";
import { auth } from "@/auth";
import { getPgPool } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/sign-in");

  let needsOnboarding = false;

  const pool = getPgPool();
  if (pool) {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT farm_name FROM users WHERE email = $1", [session.user.email]);
      if (result.rows.length > 0 && !result.rows[0].farm_name) {
        needsOnboarding = true;
      }
    } catch (e) {
      console.error("Dashboard layout db error", e);
    } finally {
      client.release();
    }
  }

  if (needsOnboarding) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
