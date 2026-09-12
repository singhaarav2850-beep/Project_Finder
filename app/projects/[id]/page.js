import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectDetailClient from "@/components/ProjectDetailClient";

export default async function ProjectDetailPage({ params }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("*, owner:profiles(id, full_name, bio, skills)")
    .eq("id", params.id)
    .single();

  if (!project) notFound();

  const isOwner = project.owner_id === user.id;

  let requests = [];
  let myRequest = null;

  if (isOwner) {
    const { data } = await supabase
      .from("join_requests")
      .select("id, message, status, created_at, requester:profiles(id, full_name, bio, skills)")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });
    requests = data ?? [];
  } else {
    const { data } = await supabase
      .from("join_requests")
      .select("id, status")
      .eq("project_id", project.id)
      .eq("requester_id", user.id)
      .maybeSingle();
    myRequest = data;
  }

  return (
    <ProjectDetailClient
      project={project}
      isOwner={isOwner}
      requests={requests}
      myRequest={myRequest}
    />
  );
}
