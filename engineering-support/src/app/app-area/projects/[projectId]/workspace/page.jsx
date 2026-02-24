"use client";

import { useParams } from "next/navigation";
import ProjectWorkspace from "@/components/workspace/ProjectWorkspace";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params?.projectId ? String(params.projectId) : "";

  return <ProjectWorkspace projectId={projectId} />;
}
