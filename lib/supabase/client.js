import { createBrowserClient } from "@supabase/ssr";

// Used inside Client Components ("use client").
// Safe to call repeatedly — it's cheap and stateless per call.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
