// Central role & permission configuration.
// Edit this file to change what each role can see or access.

export type UserRole = "OWNER" | "MANAGER" | "AGRONOMIST" | "FARMHAND" | "READ_ONLY";

export const ALL_ROLES: UserRole[] = ["OWNER", "MANAGER", "AGRONOMIST", "FARMHAND", "READ_ONLY"];

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER:      "Owner",
  MANAGER:    "Manager",
  AGRONOMIST: "Agronomist",
  FARMHAND:   "Staff",
  READ_ONLY:  "Supplier",
};

// Which sidebar nav group labels each role can see.
// Group labels must match exactly what's in Sidebar.tsx navGroups[].label
export const NAV_GROUPS_FOR_ROLE: Record<UserRole, string[]> = {
  OWNER:      ["Overview", "Crops", "Livestock", "Finance & Compliance", "Safety & WHS", "Intelligence"],
  MANAGER:    ["Overview", "Crops", "Livestock", "Finance & Compliance", "Safety & WHS", "Intelligence"],
  AGRONOMIST: ["Overview", "Crops", "Safety & WHS", "Intelligence"],
  FARMHAND:   ["Overview", "Crops", "Livestock", "Safety & WHS"],
  READ_ONLY:  ["Overview", "Finance & Compliance"],
};

// Whether the settings gear icon/link is shown for this role.
export const CAN_ACCESS_SETTINGS: UserRole[] = ["OWNER", "MANAGER"];

// Route-level access rules. First matching prefix wins.
// Unlisted routes are publicly accessible to all authenticated users.
export const ROUTE_RULES: { pattern: string; allow: UserRole[] }[] = [
  { pattern: "/settings",           allow: ["OWNER", "MANAGER"] },
  { pattern: "/benchmark",          allow: ["OWNER", "MANAGER", "AGRONOMIST"] },
  { pattern: "/ai-advisor",         allow: ["OWNER", "MANAGER", "AGRONOMIST"] },
  { pattern: "/agronomist-reports", allow: ["OWNER", "MANAGER", "AGRONOMIST"] },
  { pattern: "/compliance",         allow: ["OWNER", "MANAGER"] },
  { pattern: "/finance",            allow: ["OWNER", "MANAGER", "READ_ONLY"] },
  { pattern: "/livestock",          allow: ["OWNER", "MANAGER", "FARMHAND"] },
  { pattern: "/crops",              allow: ["OWNER", "MANAGER", "AGRONOMIST", "FARMHAND"] },
  { pattern: "/safety",             allow: ["OWNER", "MANAGER", "AGRONOMIST", "FARMHAND"] },
  { pattern: "/overview",           allow: ["OWNER", "MANAGER", "AGRONOMIST", "FARMHAND", "READ_ONLY"] },
];

// API-level permission keys used by requireRole() in lib/api-auth.ts
export const API_PERMISSIONS: Record<string, UserRole[]> = {
  settings:            ["OWNER", "MANAGER"],
  team:                ["OWNER", "MANAGER"],
  finance:             ["OWNER", "MANAGER", "READ_ONLY"],
  "soil-reports":      ["OWNER", "MANAGER", "AGRONOMIST"],
  "ai-advisor":        ["OWNER", "MANAGER", "AGRONOMIST"],
  "fields-write":      ["OWNER", "MANAGER", "AGRONOMIST", "FARMHAND"],
  benchmark:           ["OWNER", "MANAGER", "AGRONOMIST"],
  "whs-read":          ["OWNER", "MANAGER", "AGRONOMIST", "FARMHAND"],
  "whs-sign":          ["OWNER", "MANAGER", "AGRONOMIST", "FARMHAND"],
  "whs-compliance":    ["OWNER", "MANAGER"],
  "whs-contract":      ["OWNER", "MANAGER"],
};

// Roles that must pass through the WHS gate after first login
export const WHS_GATE_ROLES: UserRole[] = ["MANAGER", "AGRONOMIST", "FARMHAND"];

export function isValidRole(r: unknown): r is UserRole {
  return typeof r === "string" && ALL_ROLES.includes(r as UserRole);
}

export function hasRouteAccess(pathname: string, role: UserRole): boolean {
  for (const rule of ROUTE_RULES) {
    if (pathname === rule.pattern || pathname.startsWith(rule.pattern + "/")) {
      return rule.allow.includes(role);
    }
  }
  return true;
}
