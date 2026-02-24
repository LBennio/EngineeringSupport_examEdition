
export function normalizeUserProfile(rawUserProfile) {
  const safeProfile = rawUserProfile || {};

  const rawRole = String(safeProfile.role || "user").toLowerCase();
  const rawPlan = String(safeProfile.plan || "base").toLowerCase();

  const normalizedRole = rawRole === "admin" ? "admin" : "user";
  const normalizedPlan = rawPlan === "premium" ? "premium" : "base";

  return {
    ...safeProfile,
    role: normalizedRole,
    plan: normalizedPlan
  };
}
