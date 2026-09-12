"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProjectDetailClient({ project, isOwner, requests, myRequest }) {
  const supabase = createClient();
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(myRequest?.status ?? null);
  const [projectStatus, setProjectStatus] = useState(project.status);
  const [localRequests, setLocalRequests] = useState(requests);

  const sendRequest = async () => {
    setSending(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("join_requests").insert({
      project_id: project.id,
      requester_id: user.id,
      message,
    });
    setSending(false);
    if (!error) setStatus("pending");
  };

  const updateRequest = async (requestId, newStatus) => {
    await supabase.from("join_requests").update({ status: newStatus }).eq("id", requestId);
    setLocalRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );
  };

  const toggleProjectStatus = async () => {
    const next = projectStatus === "open" ? "closed" : "open";
    await supabase.from("projects").update({ status: next }).eq("id", project.id);
    setProjectStatus(next);
  };

  const deleteProject = async () => {
    if (!confirm("Delete this project? This can't be undone.")) return;
    await supabase.from("projects").delete().eq("id", project.id);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <span
        className={`text-xs uppercase tracking-wide font-semibold ${
          projectStatus === "open" ? "text-sage" : "text-ink/40"
        }`}
      >
        {projectStatus}
      </span>
      <h1 className="font-display text-4xl mt-2">{project.title}</h1>
      <p className="text-sm text-ink/50 mt-1">Posted by {project.owner?.full_name}</p>

      <p className="mt-6 text-ink/80 leading-relaxed">{project.description}</p>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {(project.skills_needed || []).map((skill) => (
          <span key={skill} className="text-xs bg-mustard/15 text-navy px-2 py-0.5 rounded-full">
            {skill}
          </span>
        ))}
      </div>

      <hr className="my-8 border-line" />

      {isOwner ? (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">
              Requests ({localRequests.filter((r) => r.status === "pending").length} pending)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={toggleProjectStatus}
                className="text-sm rounded-full border border-navy text-navy px-3 py-1 hover:bg-navy hover:text-paper transition-colors"
              >
                Mark as {projectStatus === "open" ? "closed" : "open"}
              </button>
              <button
                onClick={deleteProject}
                className="text-sm rounded-full border border-rust text-rust px-3 py-1 hover:bg-rust hover:text-paper transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {localRequests.length === 0 ? (
            <p className="text-ink/50 text-sm mt-4">No one has asked to join yet.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {localRequests.map((r) => (
                <li key={r.id} className="border border-line rounded-md p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.requester?.full_name}</p>
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
                  {r.requester?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {r.requester.skills.map((s) => (
                        <span
                          key={s}
                          className="text-xs bg-navy/5 text-navy px-2 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {r.message && <p className="text-sm text-ink/70 mt-2">"{r.message}"</p>}
                  {r.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => updateRequest(r.id, "accepted")}
                        className="text-sm rounded-full bg-sage text-paper px-3 py-1"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateRequest(r.id, "rejected")}
                        className="text-sm rounded-full border border-rust text-rust px-3 py-1"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : status ? (
        <p className="text-sm font-medium">
          Your request is{" "}
          <span
            className={
              status === "accepted" ? "text-sage" : status === "rejected" ? "text-rust" : "text-mustard"
            }
          >
            {status}
          </span>
          .
        </p>
      ) : (
        <div>
          <h2 className="font-display text-2xl">Want in?</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Say what you'd bring to this project…"
            className="w-full mt-3 rounded-md border border-line px-3 py-2 bg-white focus:border-navy outline-none"
          />
          <button
            onClick={sendRequest}
            disabled={sending || projectStatus === "closed"}
            className="mt-3 rounded-full bg-navy text-paper px-5 py-2 font-medium hover:bg-navy-light disabled:opacity-50"
          >
            {projectStatus === "closed" ? "This project is closed" : sending ? "Sending…" : "Ask to join"}
          </button>
        </div>
      )}
    </div>
  );
}
