import { dbQuery, dbQueryOne } from "./db";
import type { UserRole } from "./permissions";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WHSSubmission {
  id: string;
  org_id: string;
  form_id: string;
  form_version: string;
  submitted_by: string;
  submitter_name: string | null;
  submitter_email: string | null;
  submitter_role: UserRole;
  status: "draft" | "submitted" | "signed";
  stage: "onboarding" | "operational";
  answers: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WHSSignature {
  id: string;
  submission_id: string;
  org_id: string;
  form_id: string;
  form_version: string;
  user_id: string;
  role_at_signing: UserRole;
  typed_name: string;
  drawn_signature_data: string | null;
  ip_address: string | null;
  user_agent: string | null;
  signed_at: string;
}

export interface WHSGateStatus {
  user_id: string;
  org_id: string;
  completed_at: string | null;
}

// ─── Gate ───────────────────────────────────────────────────────────────────

export async function getWHSGateStatus(userId: string): Promise<WHSGateStatus | null> {
  return dbQueryOne<WHSGateStatus>(
    `SELECT user_id, org_id, completed_at FROM user_whs_gate WHERE user_id = $1`,
    [userId]
  );
}

export async function ensureWHSGateRow(userId: string, orgId: string): Promise<void> {
  await dbQuery(
    `INSERT INTO user_whs_gate (user_id, org_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId, orgId]
  );
}

export async function markWHSGateComplete(userId: string): Promise<void> {
  await dbQuery(
    `UPDATE user_whs_gate SET completed_at = now() WHERE user_id = $1`,
    [userId]
  );
}

// ─── Submissions ─────────────────────────────────────────────────────────────

export async function createSubmission(params: {
  orgId: string;
  formId: string;
  formVersion: string;
  submittedBy: string;
  stage: "onboarding" | "operational";
  answers: Record<string, unknown>;
}): Promise<string> {
  const row = await dbQueryOne<{ id: string }>(
    `INSERT INTO whs_submissions
       (org_id, form_id, form_version, submitted_by, stage, answers, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'draft')
     RETURNING id`,
    [params.orgId, params.formId, params.formVersion, params.submittedBy, params.stage, JSON.stringify(params.answers)]
  );
  if (!row) throw new Error("Insert failed");
  return row.id;
}

export async function upsertSubmission(params: {
  orgId: string;
  formId: string;
  formVersion: string;
  submittedBy: string;
  stage: "onboarding" | "operational";
  answers: Record<string, unknown>;
  status?: "draft" | "submitted";
}): Promise<string> {
  // One draft per user per form; re-use existing draft if present
  const existing = await dbQueryOne<{ id: string; status: string }>(
    `SELECT id, status FROM whs_submissions
     WHERE org_id = $1 AND form_id = $2 AND submitted_by = $3 AND status = 'draft'
     ORDER BY created_at DESC LIMIT 1`,
    [params.orgId, params.formId, params.submittedBy]
  );

  if (existing) {
    await dbQuery(
      `UPDATE whs_submissions
       SET answers = $1, status = $2, updated_at = now()
       WHERE id = $3`,
      [JSON.stringify(params.answers), params.status ?? "draft", existing.id]
    );
    return existing.id;
  }

  return createSubmission(params);
}

export async function getSubmission(id: string, orgId: string): Promise<WHSSubmission | null> {
  return dbQueryOne<WHSSubmission>(
    `SELECT
       ws.id, ws.org_id, ws.form_id, ws.form_version, ws.submitted_by,
       u.name AS submitter_name, u.email AS submitter_email, u.role AS submitter_role,
       ws.status, ws.stage, ws.answers, ws.created_at, ws.updated_at
     FROM whs_submissions ws
     LEFT JOIN users u ON u.id = ws.submitted_by
     WHERE ws.id = $1 AND ws.org_id = $2`,
    [id, orgId]
  );
}

/** Lightweight lookup used by the sign route — no user JOIN required. */
export async function getSubmissionForSign(id: string, orgId: string): Promise<{
  id: string; form_id: string; form_version: string; submitted_by: string; status: string;
} | null> {
  return dbQueryOne(
    `SELECT id, form_id, form_version, submitted_by, status
     FROM whs_submissions
     WHERE id = $1 AND org_id = $2`,
    [id, orgId]
  );
}

export async function getSubmissions(params: {
  orgId: string;
  userId?: string;
  formId?: string;
  status?: string;
  stage?: string;
  role?: string;
}): Promise<WHSSubmission[]> {
  const conditions: string[] = ["ws.org_id = $1"];
  const values: unknown[] = [params.orgId];
  let idx = 2;

  if (params.userId) {
    conditions.push(`ws.submitted_by = $${idx++}`);
    values.push(params.userId);
  }
  if (params.formId) {
    conditions.push(`ws.form_id = $${idx++}`);
    values.push(params.formId);
  }
  if (params.status) {
    conditions.push(`ws.status = $${idx++}`);
    values.push(params.status);
  }
  if (params.stage) {
    conditions.push(`ws.stage = $${idx++}`);
    values.push(params.stage);
  }
  if (params.role) {
    conditions.push(`u.role = $${idx++}`);
    values.push(params.role);
  }

  return dbQuery<WHSSubmission>(
    `SELECT
       ws.id, ws.org_id, ws.form_id, ws.form_version, ws.submitted_by,
       u.name AS submitter_name, u.email AS submitter_email, u.role AS submitter_role,
       ws.status, ws.stage, ws.answers, ws.created_at, ws.updated_at
     FROM whs_submissions ws
     JOIN users u ON u.id = ws.submitted_by
     WHERE ${conditions.join(" AND ")}
     ORDER BY ws.updated_at DESC`,
    values
  );
}

/** Find the most recent signed/submitted submission for a user + form (used in gate). */
export async function getLatestSubmissionForForm(
  userId: string,
  orgId: string,
  formId: string
): Promise<WHSSubmission | null> {
  return dbQueryOne<WHSSubmission>(
    `SELECT
       ws.id, ws.org_id, ws.form_id, ws.form_version, ws.submitted_by,
       u.name AS submitter_name, u.email AS submitter_email, u.role AS submitter_role,
       ws.status, ws.stage, ws.answers, ws.created_at, ws.updated_at
     FROM whs_submissions ws
     JOIN users u ON u.id = ws.submitted_by
     WHERE ws.submitted_by = $1 AND ws.org_id = $2 AND ws.form_id = $3
     ORDER BY ws.created_at DESC
     LIMIT 1`,
    [userId, orgId, formId]
  );
}

// ─── Signatures ──────────────────────────────────────────────────────────────

export async function signSubmission(params: {
  submissionId: string;
  orgId: string;
  formId: string;
  formVersion: string;
  userId: string;
  roleAtSigning: UserRole;
  typedName: string;
  drawnSignatureData?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<string> {
  // Mark submission as signed
  await dbQuery(
    `UPDATE whs_submissions SET status = 'signed', updated_at = now() WHERE id = $1 AND org_id = $2`,
    [params.submissionId, params.orgId]
  );

  const row = await dbQueryOne<{ id: string }>(
    `INSERT INTO whs_signatures
       (submission_id, org_id, form_id, form_version, user_id,
        role_at_signing, typed_name, drawn_signature_data, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      params.submissionId,
      params.orgId,
      params.formId,
      params.formVersion,
      params.userId,
      params.roleAtSigning,
      params.typedName,
      params.drawnSignatureData ?? null,
      params.ipAddress ?? null,
      params.userAgent ?? null,
    ]
  );
  if (!row) throw new Error("Signature insert failed");
  return row.id;
}

export async function getSignaturesForSubmission(submissionId: string): Promise<WHSSignature[]> {
  return dbQuery<WHSSignature>(
    `SELECT * FROM whs_signatures WHERE submission_id = $1 ORDER BY signed_at ASC`,
    [submissionId]
  );
}

// ─── Employment contract ─────────────────────────────────────────────────────

export async function getEmploymentContract(orgId: string): Promise<string | null> {
  const row = await dbQueryOne<{ employment_contract_html: string | null }>(
    `SELECT employment_contract_html FROM organizations WHERE id = $1`,
    [orgId]
  );
  return row?.employment_contract_html ?? null;
}

export async function saveEmploymentContract(orgId: string, html: string): Promise<void> {
  await dbQuery(
    `UPDATE organizations SET employment_contract_html = $1 WHERE id = $2`,
    [html, orgId]
  );
}

// ─── Compliance (owner/manager view) ────────────────────────────────────────

export interface ComplianceSubmissionRow {
  id: string;
  form_id: string;
  form_version: string;
  submitter_name: string | null;
  submitter_email: string | null;
  submitter_role: string;
  status: string;
  stage: string;
  created_at: string;
  updated_at: string;
  signed_at: string | null;
}

export async function getComplianceSubmissions(orgId: string): Promise<ComplianceSubmissionRow[]> {
  return dbQuery<ComplianceSubmissionRow>(
    `SELECT
       ws.id, ws.form_id, ws.form_version,
       u.name  AS submitter_name,
       u.email AS submitter_email,
       u.role  AS submitter_role,
       ws.status, ws.stage,
       ws.created_at, ws.updated_at,
       (SELECT sig.signed_at FROM whs_signatures sig
        WHERE sig.submission_id = ws.id
        ORDER BY sig.signed_at DESC LIMIT 1) AS signed_at
     FROM whs_submissions ws
     JOIN users u ON u.id = ws.submitted_by
     WHERE ws.org_id = $1
     ORDER BY ws.updated_at DESC`,
    [orgId]
  );
}

/** All personally signed submissions for a user (any stage, any form). */
export async function getMySignedDocuments(userId: string, orgId: string): Promise<WHSSubmission[]> {
  return dbQuery<WHSSubmission>(
    `SELECT
       ws.id, ws.org_id, ws.form_id, ws.form_version, ws.submitted_by,
       u.name AS submitter_name, u.email AS submitter_email, u.role AS submitter_role,
       ws.status, ws.stage, ws.answers, ws.created_at, ws.updated_at
     FROM whs_submissions ws
     LEFT JOIN users u ON u.id = ws.submitted_by
     WHERE ws.submitted_by = $1 AND ws.org_id = $2 AND ws.status = 'signed'
     ORDER BY ws.updated_at DESC`,
    [userId, orgId]
  );
}

/** Set of form_ids this user has at least one signed submission for. */
export async function getSignedFormIds(userId: string, orgId: string): Promise<Set<string>> {
  const rows = await dbQuery<{ form_id: string }>(
    `SELECT DISTINCT form_id FROM whs_submissions
     WHERE submitted_by = $1 AND org_id = $2 AND status = 'signed'`,
    [userId, orgId]
  );
  return new Set(rows.map((r) => r.form_id));
}

export async function getGateCompletionStats(orgId: string): Promise<{
  total: number;
  completed: number;
}> {
  const row = await dbQueryOne<{ total: string; completed: string }>(
    `SELECT
       COUNT(*) AS total,
       COUNT(completed_at) AS completed
     FROM user_whs_gate WHERE org_id = $1`,
    [orgId]
  );
  return { total: Number(row?.total ?? 0), completed: Number(row?.completed ?? 0) };
}
