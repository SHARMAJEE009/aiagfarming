import { auth } from "@/auth";
import { getOrgByEmail, getSoilReports, getFields } from "@/lib/queries";
import { AgronomistReportsView } from "@/components/dashboard/AgronomistReportsView";

export default async function AgronomistReportsPage() {
  const session = await auth();
  const ctx = session?.user?.email ? await getOrgByEmail(session.user.email) : null;
  const orgId = ctx?.org_id;

  const [reports, fields] = orgId
    ? await Promise.all([getSoilReports(orgId), getFields(orgId)])
    : [[], []];

  const fieldOptions = fields.map((f) => ({ id: f.id, name: f.name }));

  return <AgronomistReportsView reports={reports} fieldOptions={fieldOptions} />;
}
