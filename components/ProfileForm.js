"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm({ profile, userId }) {
  const supabase = createClient();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [skills, setSkills] = useState((profile?.skills ?? []).join(", "));
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust so the new image shows immediately after upload
      const url = `${data.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(url);
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage("");

    const skillsArray = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, bio, skills: skillsArray })
      .eq("id", userId);

    setSaving(false);
    setSavedMessage(error ? error.message : "Saved.");
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-12">
      <h1 className="font-display text-3xl">Your profile</h1>
      <p className="text-ink/60 text-sm mt-1">
        This is what project owners see when you ask to join.
      </p>

      <div className="mt-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-line overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" width={64} height={64} className="object-cover" />
          ) : (
            <span className="font-display text-xl text-ink/40">
              {fullName.charAt(0).toUpperCase() || "?"}
            </span>
          )}
        </div>
        <label className="text-sm text-navy font-medium cursor-pointer">
          {uploading ? "Uploading…" : "Change photo"}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 bg-white focus:border-navy outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="bio">
            Short bio
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 bg-white focus:border-navy outline-none"
            placeholder="Second-year CS student who likes shipping small things fast."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="skills">
            Your skills
          </label>
          <input
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 bg-white focus:border-navy outline-none"
            placeholder="React, UI design, Python (comma-separated)"
          />
        </div>

        {savedMessage && <p className="text-sm text-sage">{savedMessage}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-navy text-paper px-5 py-2 font-medium hover:bg-navy-light disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
