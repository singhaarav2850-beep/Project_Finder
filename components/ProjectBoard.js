"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function statusFor(project, myRequests) {
  const mine = myRequests.find((r) => r.project_id === project.id);
  return mine?.status ?? null;
}

export default function ProjectBoard({ initialProjects, currentUserId, myRequests }) {
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState(initialProjects);
  const [requests, setRequests] = useState(myRequests);
  const [openProjectId, setOpenProjectId] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => {
      const haystack = [p.title, p.description, ...(p.skills_needed || [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [projects, query]);

  const sendRequest = async (projectId) => {
    setSending(true);
    const { error } = await supabase.from("join_requests").insert({
      project_id: projectId,
      requester_id: currentUserId,
      message,
    });
    setSending(false);
    if (!error) {
      setRequests((prev) => [...prev, { project_id: projectId, status: "pending" }]);
      setOpenProjectId(null);
      setMessage("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl">The board</h1>
          <p className="text-ink/60 text-sm mt-1">
            {filtered.length} project{filtered.length === 1 ? "" : "s"} looking for teammates
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by skill, e.g. React, Figma…"
          className="w-full sm:w-72 rounded-full border border-line px-4 py-2 bg-white focus:border-navy outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center text-ink/50">
          <p className="font-display text-xl">Nothing pinned yet.</p>
          <p className="text-sm mt-1">Try a different search, or post the first project.</p>
        </div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((project) => {
            const isOwner = project.owner_id === currentUserId;
            const myStatus = statusFor(project, requests);
            const closed = project.status === "closed";

            return (
              <div
                key={project.id}
                className="pin-card bg-white border border-line rounded-md shadow-pin p-5 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs uppercase tracking-wide font-semibold ${
                      closed ? "text-ink/40" : "text-sage"
                    }`}
                  >
                    {closed ? "Closed" : "Open"}
                  </span>
                  <span className="text-xs text-ink/40">
                    {project.owner?.full_name || "A classmate"}
                  </span>
                </div>

                <h3 className="font-display text-xl mt-2">{project.title}</h3>
                <p className="text-sm text-ink/70 mt-2 flex-1">{project.description}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(project.skills_needed || []).map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-mustard/15 text-navy px-2 py-0.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-4">
                  {isOwner ? (
                    <span className="text-xs text-ink/40">This is your project</span>
                  ) : myStatus ? (
                    <span
                      className={`text-xs font-medium ${
                        myStatus === "accepted"
                          ? "text-sage"
                          : myStatus === "rejected"
                          ? "text-rust"
                          : "text-mustard"
                      }`}
                    >
                      Request {myStatus}
                    </span>
                  ) : openProjectId === project.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={2}
                        placeholder="Say why you'd be useful…"
                        className="w-full text-sm rounded-md border border-line px-2 py-1.5 focus:border-navy outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => sendRequest(project.id)}
                          disabled={sending}
                          className="text-sm rounded-full bg-navy text-paper px-3 py-1 hover:bg-navy-light disabled:opacity-60"
                        >
                          {sending ? "Sending…" : "Send"}
                        </button>
                        <button
                          onClick={() => setOpenProjectId(null)}
                          className="text-sm text-ink/50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setOpenProjectId(project.id)}
                      disabled={closed}
                      className="text-sm rounded-full border border-navy text-navy px-3 py-1 hover:bg-navy hover:text-paper transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-navy"
                    >
                      Ask to join
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
