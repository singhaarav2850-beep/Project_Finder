"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-5 py-20 text-center">
        <h1 className="font-display text-3xl">Check your inbox</h1>
        <p className="text-ink/60 mt-3">
          We sent a confirmation link to <strong>{email}</strong>. Confirm it,
          then log in to set up your profile.
        </p>
        <Link href="/login" className="inline-block mt-6 text-navy font-medium">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-20">
      <h1 className="font-display text-3xl">Create your account</h1>
      <p className="text-ink/60 text-sm mt-1">
        Use your university email so people know you're a real classmate.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 bg-white focus:border-navy outline-none"
            placeholder="Ada Lovelace"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 bg-white focus:border-navy outline-none"
            placeholder="you@university.edu"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 bg-white focus:border-navy outline-none"
            placeholder="At least 6 characters"
          />
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
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-navy font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
