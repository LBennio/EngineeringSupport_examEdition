import { redirect } from "next/navigation";

export default function DocumentationPage({ params }) {
  const projectIdAsString = String(params.projectId || "");
  redirect(`/app-area/projects/${projectIdAsString}/workspace`);
}
