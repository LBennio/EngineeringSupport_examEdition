"use client";

import AdminOnly from "@/components/auth/AdminOnly";
import TeamProjectsManager from "@/components/projects/TeamProjectsManager";

export default function TeamProjectsPage() {
  return (
    <AdminOnly>
      <TeamProjectsManager />
    </AdminOnly>
  );
}
