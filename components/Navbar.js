"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // Live badge: count pending join requests on projects this user owns.
  useEffect(() => {
    if (!user) {
      setPendingCount(0);
      return;
    }

    let channel;

    const loadAndSubscribe = async () => {
      const { data: myProjects } = await supabase
        .from("projects")
        .select("id")
        .eq("owner_id", user.id);

      const projectIds = (myProjects ?? []).map((p) => p.id);
      if (projectIds.length === 0) return;

      const { count } = await supabase
        .from("join_requests")
        .select("id", { count: "exact", head: true })
        .in("project_id", projectIds)
        .eq("status", "pending");

      setPendingCount(count ?? 0);

      channel = supabase
        .channel("navbar-join-requests")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "join_requests" },
          async () => {
            const { count: liveCount } = await supabase
              .from("join_requests")
              .select("id", { count: "exact", head: true })
              .in("project_id", projectIds)
              .eq("status", "pending");
            setPendingCount(liveCount ?? 0);
          }
        )
        .subscribe();
    };

    loadAndSubscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const linkClass = (href) =>
    `px-3 py-1.5 rounded-full text-sm transition-colors ${
      pathname === href ? "bg-navy text-paper" : "text-ink/70 hover:text-ink"
    }`;

  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur sticky top-0 z-20">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3">
        <Link href="/" className="font-display text-2xl text-navy">
          Huddle
        </Link>

        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <Link href="/dashboard" className={linkClass("/dashboard")}>
                Board
              </Link>
              <Link href="/projects/new" className={linkClass("/projects/new")}>
                Post a project
              </Link>
              <Link href="/requests" className={`${linkClass("/requests")} relative`}>
                Requests
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rust text-paper text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
              <Link href="/profile" className={linkClass("/profile")}>
                Profile
              </Link>
              <button
                onClick={signOut}
                className="ml-2 px-3 py-1.5 rounded-full text-sm text-ink/70 hover:text-rust transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass("/login")}>
                Log in
              </Link>
              <Link
                href="/signup"
                className="ml-1 px-4 py-1.5 rounded-full text-sm bg-navy text-paper hover:bg-navy-light transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
