const USER_ROLES = {
  BASE: "base",
  PREMIUM: "premium",
  ADMIN: "admin"
};

const USER_PLANS = {
  BASE: "base",
  PREMIUM: "premium"
};

const PLAN_PROJECT_LIMITS = {
  base: 1,
  premium: Infinity
};

export function getUserRole(authenticatedUserProfile) {
  return authenticatedUserProfile?.role || USER_ROLES.BASE;
}

export function getUserPlan(authenticatedUserProfile) {
  return authenticatedUserProfile?.plan || USER_PLANS.BASE;
}

export function isAdminRole(authenticatedUserProfile) {
  return getUserRole(authenticatedUserProfile) === USER_ROLES.ADMIN;
}

export function canAccessAdminArea(authenticatedUserProfile) {
  return isAdminRole(authenticatedUserProfile);
}

export function canAdminCommentOnProjects(authenticatedUserProfile) {
  return isAdminRole(authenticatedUserProfile);
}

export function getMaxProjectsAllowedForPlan(authenticatedUserProfile) {
  const userPlan = getUserPlan(authenticatedUserProfile);
  return PLAN_PROJECT_LIMITS[userPlan] ?? PLAN_PROJECT_LIMITS.base;
}

export function canCreateAnotherPersonalProject(authenticatedUserProfile, currentProjectsCount) {
  const maxAllowedProjects = getMaxProjectsAllowedForPlan(authenticatedUserProfile);
  return currentProjectsCount < maxAllowedProjects;
}

export function shouldShowAdminLinksInNavigation(authenticatedUserProfile) {
  return canAccessAdminArea(authenticatedUserProfile);
}
