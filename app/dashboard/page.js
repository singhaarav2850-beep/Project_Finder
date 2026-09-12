import { createClient } from "@/lib/supabase/server";
import ProjectBoard from "@/components/ProjectBoard";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, description, skills_needed, status, created_at, owner_id, owner:profiles(full_name)")
    .order("created_at", { ascending: false });

  const { data: myRequests } = await supabase
    .from("join_requests")
    .select("project_id, status")
    .eq("requester_id", user.id);

  return (
    <ProjectBoard
      initialProjects={projects ?? []}
      currentUserId={user.id}
      myRequests={myRequests ?? []}
    />
  );
}
