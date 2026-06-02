import rawSchemas from "@/data/whs-schemas.json";
import type { UserRole } from "@/lib/permissions";

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "number"
  | "select"
  | "yes_no"
  | "tri_state"
  | "checklist"
  | "acknowledgement_group"
  | "table"
  | "signature";

export type ChecklistResponseType = "yes_no" | "initials" | "tri_state";

export interface TableColumn {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  items?: string[];
  mustAcceptAll?: boolean;
  responseType?: ChecklistResponseType;
  columns?: TableColumn[];
}

export interface FormSection {
  title: string;
  fields: FieldDef[];
}

// Schema role names (lowercase) — DB roles use uppercase
export type SchemaRole = "owner" | "manager" | "agronomist" | "staff" | "supplier" | "contractor";

export interface FormPermissions {
  canFill: SchemaRole[];
  canSign: SchemaRole[];
  canView: SchemaRole[];
}

export interface FormSchema {
  id: string;
  version: string;
  title: string;
  description: string;
  stage: "onboarding" | "operational";
  permissions: FormPermissions;
  sections: FormSection[];
}

const schemas = rawSchemas as FormSchema[];

// DB role → schema role
const dbToSchemaRole: Record<UserRole, SchemaRole> = {
  OWNER:      "owner",
  MANAGER:    "manager",
  AGRONOMIST: "agronomist",
  FARMHAND:   "staff",
  READ_ONLY:  "supplier",
};

export function getAllSchemas(): FormSchema[] {
  return schemas;
}

export function getSchema(id: string): FormSchema | null {
  return schemas.find((s) => s.id === id) ?? null;
}

export function getSchemasForStage(stage: "onboarding" | "operational"): FormSchema[] {
  return schemas.filter((s) => s.stage === stage);
}

/** All onboarding forms, regardless of role. */
export function getOnboardingForms(): FormSchema[] {
  return schemas.filter((s) => s.stage === "onboarding");
}

/** Operational forms the given role can fill (shown in Safety section). */
export function getFormsUserCanFill(role: UserRole): FormSchema[] {
  const sr = dbToSchemaRole[role];
  return schemas.filter(
    (s) => s.stage === "operational" && s.permissions.canFill.includes(sr)
  );
}

export function canFill(schema: FormSchema, role: UserRole): boolean {
  const sr = dbToSchemaRole[role];
  return schema.permissions.canFill.includes(sr);
}

export function canSign(schema: FormSchema, role: UserRole): boolean {
  const sr = dbToSchemaRole[role];
  return schema.permissions.canSign.includes(sr);
}

export function canView(schema: FormSchema, role: UserRole): boolean {
  const sr = dbToSchemaRole[role];
  return schema.permissions.canView.includes(sr);
}

/** Onboarding forms the given role must sign at the WHS gate. */
export function onboardingFormsForRole(role: UserRole): FormSchema[] {
  if (role === "READ_ONLY" || role === "OWNER") return [];
  const sr = dbToSchemaRole[role];
  return schemas.filter(
    (s) => s.stage === "onboarding" && s.permissions.canSign.includes(sr)
  );
}

/** Operational forms visible to a given DB role (fill OR view). */
export function operationalFormsForRole(role: UserRole): FormSchema[] {
  const sr = dbToSchemaRole[role];
  return schemas.filter(
    (s) =>
      s.stage === "operational" &&
      (s.permissions.canFill.includes(sr) || s.permissions.canView.includes(sr))
  );
}

/** Replace {{placeholder}} tokens with org values. */
export function resolvePlaceholders(
  text: string,
  vars: Record<string, string>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
}

/** Flatten all fields from all sections. */
export function flattenFields(schema: FormSchema): FieldDef[] {
  return schema.sections.flatMap((s) => s.fields);
}

/** Required field keys for a schema (excludes signature — captured post-submit). */
export function requiredFieldKeys(schema: FormSchema): string[] {
  return flattenFields(schema)
    .filter((f) => f.required && f.type !== "signature")
    .map((f) => f.key);
}
