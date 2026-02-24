"use client";

import { useAuth } from "@/hooks/useAuth";
export default function MyAccountPage() {
  const { authenticatedUserProfile, isAuthStateLoading } = useAuth();

  if (isAuthStateLoading) return <p>Loading account...</p>;
  if (!authenticatedUserProfile) return <p>Not authenticated.</p>;

  const {
    username,
    email,
    role,
    plan,
    teamAdminEmailAddress
  } = authenticatedUserProfile;

  return (
    <section>
      <h1>My Account</h1>

      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <div><strong>Username:</strong> {username}</div>
        <div><strong>Email:</strong> {email}</div>
        <div><strong>Role:</strong> {role}</div>
        <div><strong>Plan:</strong> {plan}</div>
        <div><strong>Team Admin:</strong> {teamAdminEmailAddress || "Not assigned"}</div>
      </div>
    </section>
  );
}
