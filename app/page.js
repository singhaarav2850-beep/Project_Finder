import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-5">
      <section className="pt-20 pb-16 grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
        <div>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-ink">
            Nobody finishes a
            <br />
            side project alone.
          </h1>
          <p className="mt-6 text-lg text-ink/70 max-w-md">
            Pin the project you're starting, list what skills it needs, and
            let classmates who have them come find you. No more group chats
            of strangers — just people who actually want in.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-full bg-navy text-paper font-medium hover:bg-navy-light transition-colors"
            >
              Post your first project
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-full border border-ink/20 text-ink font-medium hover:border-ink/40 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="relative h-64 md:h-80">
          <div className="pin-card absolute top-0 left-2 w-52 bg-white border border-line rounded-md shadow-pin p-4">
            <p className="text-xs uppercase tracking-wide text-mustard font-semibold">Open</p>
            <p className="font-display text-lg mt-1">Campus food-waste app</p>
            <p className="text-xs text-ink/60 mt-2">Needs: Flutter, Figma</p>
          </div>
          <div className="pin-card absolute top-24 right-0 w-52 bg-white border border-line rounded-md shadow-pin p-4">
            <p className="text-xs uppercase tracking-wide text-sage font-semibold">Open</p>
            <p className="font-display text-lg mt-1">Hostel chores tracker</p>
            <p className="text-xs text-ink/60 mt-2">Needs: React, Node.js</p>
          </div>
          <div className="pin-card absolute bottom-0 left-16 w-52 bg-white border border-line rounded-md shadow-pin p-4">
            <p className="text-xs uppercase tracking-wide text-mustard font-semibold">Open</p>
            <p className="font-display text-lg mt-1">ML paper reading group</p>
            <p className="text-xs text-ink/60 mt-2">Needs: PyTorch</p>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 pb-24">
        {[
          {
            title: "Pin a project",
            body: "Describe what you're building and list the exact skills you're missing.",
          },
          {
            title: "Get matched",
            body: "Students search the board by skill and send a short note explaining why they'd be useful.",
          },
          {
            title: "Choose your team",
            body: "Review requests, accept the right people, and take the conversation from there.",
          },
        ].map((step) => (
          <div key={step.title} className="border-t-2 border-navy pt-4">
            <h3 className="font-display text-xl">{step.title}</h3>
            <p className="mt-2 text-ink/70 text-sm">{step.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
