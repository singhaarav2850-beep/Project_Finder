import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function RequestsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: incoming } = await supabase
    .from("join_requests")
    .select("id, message, status, created_at, project:projects!inner(id, title, owner_id), requester:profiles(full_name)")
    .eq("project.owner_id", user.id)
    .order("created_at", { ascending: false });

  const { data: outgoing } = await supabase
    .from("join_requests")
    .select("id, message, status, created_at, project:projects(id, title)")
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto px-5 py-12 space-y-12">
      <section>
        <h1 className="font-display text-3xl">Incoming</h1>
        <p className="text-sm text-ink/50 mt-1">People asking to join your projects.</p>
        {!incoming || incoming.length === 0 ? (
          <p className="text-ink/50 text-sm mt-4">Nothing yet.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {incoming.map((r) => (
              <li key={r.id} className="border border-line rounded-md p-4 bg-white">
                <div className="flex items-center justify-between">
                  <p>
                    <strong>{r.requester?.full_name}</strong> wants to join{" "}
                    <Link href={`/projects/${r.project.id}`} className="text-navy underline">
                      {r.project.title}
                    </Link>
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      r.status === "accepted"
                        ? "text-sage"
                        : r.status === "rejected"
                        ? "text-rust"
                        : "text-mustard"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                {r.message && <p className="text-sm text-ink/60 mt-1">"{r.message}"</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h1 className="font-display text-3xl">Outgoing</h1>
        <p className="text-sm text-ink/50 mt-1">Projects you've asked to join.</p>
        {!outgoing || outgoing.length === 0 ? (
          <p className="text-ink/50 text-sm mt-4">
            You haven't asked to join anything yet — browse the{" "}
            <Link href="/dashboard" className="text-navy underline">
              board
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {outgoing.map((r) => (
              <li key={r.id} className="border border-line rounded-md p-4 bg-white flex items-center justify-between">
                <Link href={`/projects/${r.project.id}`} className="text-navy underline">
                  {r.project.title}
                </Link>
                <span
                  className={`text-xs font-medium ${
                    r.status === "accepted"
                      ? "text-sage"
                      : r.status === "rejected"
                      ? "text-rust"
                      : "text-mustard"
                  }`}
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
