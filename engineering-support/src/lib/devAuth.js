import { normalizeUserProfile } from "@/lib/normalizeUserProfile";

export function isDevAuthBypassEnabled() {
  const isNotProductionEnvironment = process.env.NODE_ENV !== "production";
  const bypassFlagEnabled = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";
  return isNotProductionEnvironment && bypassFlagEnabled;
}


export function getDevUserProfile() {
  const devUserRole = process.env.NEXT_PUBLIC_DEV_USER_ROLE || "user";
  const devUserPlan = process.env.NEXT_PUBLIC_DEV_USER_PLAN || "base";

  const rawDevProfile = {
    id: "dev-user-001",
    username: "demo_user",
    email: "demo_user@engineeringsupport.local",
    role: devUserRole,
    plan: devUserPlan,
    teamAdminEmailAddress: "admin@engineeringsupport.local"
  };

  return normalizeUserProfile(rawDevProfile);
}
