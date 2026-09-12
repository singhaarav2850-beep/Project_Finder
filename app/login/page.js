// app/login/page.js
"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Notice we changed this from "export default function LoginPage" to just "function LoginContent"
function LoginContent() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(params.get("next") || "/dashboard");
    router.refresh();
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-20">
      <h1 className="font-display text-3xl">Welcome back</h1>
      <p className="text-ink/60 text-sm mt-1">Log in to see your board.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 bg-white focus:border-navy outline-none"
            placeholder="••••••••"
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
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6">
        New here?{" "}
        <Link href="/signup" className="text-navy font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
}

// Here is the new wrapper that safely exports your page for Vercel
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-sm mx-auto px-5 py-20 text-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}