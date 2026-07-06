import { Code2, Globe2, ShieldCheck, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const previewProfiles = [
  {
    name: "Aarav",
    role: "Frontend",
    color: "from-cyan-400 to-blue-600",
    emoji: "</>",
    rotate: "-rotate-12",
    offset: "mt-24",
  },
  {
    name: "Isha",
    role: "Product",
    color: "from-pink-400 to-rose-600",
    emoji: "UX",
    rotate: "rotate-6",
    offset: "mt-4",
  },
  {
    name: "Kabir",
    role: "Backend",
    color: "from-emerald-400 to-teal-600",
    emoji: "{}",
    rotate: "-rotate-3",
    offset: "mt-32",
  },
  {
    name: "Mira",
    role: "DevOps",
    color: "from-amber-300 to-orange-600",
    emoji: "CLI",
    rotate: "rotate-12",
    offset: "mt-10",
  },
  {
    name: "Riya",
    role: "AI",
    color: "from-violet-400 to-fuchsia-600",
    emoji: "AI",
    rotate: "-rotate-6",
    offset: "mt-28",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen overflow-hidden bg-[#07090f] text-white">
      <section className="relative min-h-screen">
        <div className="absolute inset-0 opacity-70">
          <div className="flex h-full min-w-[980px] -translate-x-24 -rotate-[13deg] items-center justify-center gap-8 md:min-w-full">
            {previewProfiles.map((profile) => (
              <div
                key={profile.name}
                className={`${profile.offset} ${profile.rotate} w-52 shrink-0 rounded-[2rem] border-[10px] border-black bg-zinc-950 shadow-2xl shadow-black/60 md:w-60`}
              >
                <div className="h-7 rounded-t-[1.25rem] bg-black" />
                <div
                  className={`flex aspect-[3/4] flex-col justify-between bg-gradient-to-br ${profile.color} p-4`}
                >
                  <div className="self-end rounded-full bg-white/20 px-2 py-1 text-xs font-bold backdrop-blur">
                    {profile.role}
                  </div>
                  <div className="text-5xl font-black tracking-normal text-white/95">
                    {profile.emoji}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">{profile.name}</h3>
                    <p className="text-sm font-semibold text-white/80">
                      Ready to build
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-around bg-zinc-100 px-4 py-4 text-zinc-900">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-zinc-300 font-black text-rose-500">
                    x
                  </span>
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-zinc-300 font-black text-blue-500">
                    *
                  </span>
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-zinc-300 font-black text-emerald-500">
                    +
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-10">
          <Link to="/" className="flex items-center gap-3 text-3xl font-black">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-300 text-white">
              <Code2 size={26} strokeWidth={3} />
            </span>
            DevCircle
          </Link>

          <nav className="hidden items-center gap-8 text-lg font-bold lg:flex">
            <a href="#features" className="border-b-2 border-white/80 pb-1">
              Products
            </a>
            <a href="#features" className="border-b-2 border-white/80 pb-1">
              Learn
            </a>
            <a href="#safety" className="border-b-2 border-white/80 pb-1">
              Safety
            </a>
            <a href="#support" className="border-b-2 border-white/80 pb-1">
              Support
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden items-center gap-2 rounded-full px-4 py-2 font-bold text-white md:flex">
              <Globe2 size={18} />
              Language
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="relative z-20 inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-6 py-3 text-lg font-black text-zinc-900 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 focus:ring-offset-black"
            >
              Log in
            </button>
          </div>
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
          <h1 className="max-w-6xl text-6xl font-black leading-none tracking-normal sm:text-7xl lg:text-8xl">
            Start something epic.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold text-white/80 md:text-xl">
            Meet developers, designers, and builders who are ready to connect,
            collaborate, and ship ideas together.
          </p>
          <Link
            to="/signup"
            className="mt-9 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-9 py-4 text-xl font-black text-white shadow-xl shadow-rose-950/40 transition hover:scale-105"
          >
            Create account
          </Link>
        </div>
      </section>

      <section
        id="features"
        className="grid gap-5 bg-zinc-950 px-6 py-16 md:grid-cols-3 md:px-10"
      >
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <Users className="mb-4 text-cyan-300" />
          <h2 className="text-xl font-black">Find your circle</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Discover people with matching skills, projects, and interests.
          </p>
        </div>
        <div
          id="safety"
          className="rounded-lg border border-white/10 bg-white/[0.04] p-6"
        >
          <ShieldCheck className="mb-4 text-emerald-300" />
          <h2 className="text-xl font-black">Connect safely</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Your profile, requests, and chats stay inside your account flow.
          </p>
        </div>
        <div
          id="support"
          className="rounded-lg border border-white/10 bg-white/[0.04] p-6"
        >
          <Code2 className="mb-4 text-orange-300" />
          <h2 className="text-xl font-black">Build together</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Go from a match to a conversation and start creating.
          </p>
        </div>
      </section>

      <section className="bg-[#0b0e16] px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
              Products
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Match, chat, and build without leaving your flow.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
              DevCircle brings developer discovery, connection requests, real-time
              chat, premium visibility, and notifications into one focused space
              for people who want to make useful things together.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              "Browse builders by skill and interest",
              "Send requests and manage accepted connections",
              "Keep conversations moving with realtime chat",
              "Upgrade to Silver or Gold when you need more reach",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/10 bg-white/[0.05] px-5 py-4 font-semibold text-zinc-100"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 bg-zinc-950 px-6 py-16 md:grid-cols-3 md:px-10">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-orange-300">
            Learn
          </p>
          <h2 className="mt-3 text-2xl font-black">Share what you are building</h2>
          <p className="mt-3 leading-7 text-zinc-300">
            Show your profile, skills, and interests so the right people can find
            a reason to start a conversation.
          </p>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-emerald-300">
            Safety
          </p>
          <h2 className="mt-3 text-2xl font-black">Connect with control</h2>
          <p className="mt-3 leading-7 text-zinc-300">
            Requests, accepted connections, and chats stay inside your account,
            with notifications only for activity that matters.
          </p>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-violet-300">
            Support
          </p>
          <h2 className="mt-3 text-2xl font-black">Built for momentum</h2>
          <p className="mt-3 leading-7 text-zinc-300">
            Jump from discovery to chat quickly, then keep track of every request,
            reply, acceptance, and premium update.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-3 text-2xl font-black">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-300 text-white">
              <Code2 size={23} strokeWidth={3} />
            </span>
            DevCircle
          </Link>

          <div className="flex flex-wrap gap-5 text-sm font-bold text-zinc-300">
            <a href="#features">Products</a>
            <a href="#features">Learn</a>
            <a href="#safety">Safety</a>
            <a href="#support">Support</a>
          </div>

          <p className="text-sm text-zinc-500">
            (c) 2026 DevCircle. Build your circle.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Home;
