"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewProjectPage() {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const skills_needed = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase.from("projects").insert({
      owner_id: user.id,
      title,
      description,
      skills_needed,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-14">
      <h1 className="font-display text-3xl">Pin a project</h1>
      <p className="text-ink/60 text-sm mt-1">
        Be specific about the skills you need — it's the main thing people search for.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 bg-white focus:border-navy outline-none"
            placeholder="Campus food-waste app"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            What is it, and what stage is it at?
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 bg-white focus:border-navy outline-none"
            placeholder="A mobile app for hostel messes to log surplus food and notify students nearby. Have a rough wireframe, need someone to build the Flutter frontend."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="skills">
            Skills needed
          </label>
          <input
            id="skills"
            required
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 bg-white focus:border-navy outline-none"
            placeholder="Flutter, Figma, Firebase (comma-separated)"
          />
          <p className="text-xs text-ink/40 mt-1">Separate each skill with a comma.</p>
        </div>

        {error && (
          <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-navy text-paper py-2.5 font-medium hover:bg-navy-light transition-colors disabled:opacity-60"
        >
          {loading ? "Pinning…" : "Pin it to the board"}
        </button>
      </form>
    </div>
  );
}
