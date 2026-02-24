"use client";

import AdminOnly from "@/components/auth/AdminOnly";
import TeamManager from "@/components/team/TeamManager";

export default function TeamPage() {
  return (
    <AdminOnly>
      <TeamManager />
    </AdminOnly>
  );
}
