import Link from "next/link"

export const metadata = {
  title: "About — Rankflow",
  description: "Learn more about Rankflow, the Valorant performance and coaching platform.",
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">

      {/* HEADER */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition group">
          <span className="group-hover:-translate-x-0.5 transition">←</span>
          <span>Back to home</span>
        </Link>
        <h1 className="text-5xl font-bold tracking-tighter mt-4">
          About Rankflow<span className="text-[#FF4654]">.</span>
        </h1>
        <p className="text-xl text-slate-300 mt-3">
          Climb smarter, not harder.
        </p>
      </div>

      {/* VISION */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-3">🎯 Our Vision</p>
        <h2 className="text-2xl font-bold mb-4">A coach in your pocket, before every session.</h2>
        <p className="text-slate-300 leading-relaxed mb-3">
          Rankflow exists because Valorant deserves more than just stats.
        </p>
        <p className="text-slate-400 leading-relaxed">
          Most trackers show you what happened. Rankflow tells you what to do about it. We turn raw match data into a clear plan: which maps to prioritize, which agents to play, what your weaknesses are, and how to fix them.
        </p>
      </section>

      {/* DIFFERENTIATION */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-3">⚡ What Makes Rankflow Different</p>
        <h2 className="text-2xl font-bold mb-5">Coaching insights, not data dumps.</h2>

        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="text-emerald-400 text-xl flex-shrink-0">✓</span>
            <div>
              <p className="font-semibold text-white">Personalized advice based on YOUR stats</p>
              <p className="text-sm text-slate-400 mt-1">
                Tips adapt to each player. A 32% first duel rate triggers a different recommendation than a 55% one.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-emerald-400 text-xl flex-shrink-0">✓</span>
            <div>
              <p className="font-semibold text-white">Plain language, not jargon</p>
              <p className="text-sm text-slate-400 mt-1">
                We translate metrics like KAST and Trade Rate into actionable guidance any player can understand.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-emerald-400 text-xl flex-shrink-0">✓</span>
            <div>
              <p className="font-semibold text-white">Built for ranked, not for show</p>
              <p className="text-sm text-slate-400 mt-1">
                Every feature serves one goal: helping you climb. No bloat, no clutter.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-emerald-400 text-xl flex-shrink-0">✓</span>
            <div>
              <p className="font-semibold text-white">Pro scene integration</p>
              <p className="text-sm text-slate-400 mt-1">
                Compare yourself directly to VCT pros across all 4 regions (EMEA, Americas, Pacific, China).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-3">🛠 How It Works</p>
        <h2 className="text-2xl font-bold mb-5">Three steps, one outcome: better gameplay.</h2>

        <div className="space-y-4">
          <div className="flex gap-4 items-start bg-slate-800/50 border border-slate-800 rounded-2xl p-5">
            <span className="bg-indigo-500/20 text-indigo-400 text-sm font-bold w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">1</span>
            <div>
              <p className="font-semibold text-white">Enter your Riot ID</p>
              <p className="text-sm text-slate-400 mt-1">
                Just type your in-game name with tag (e.g. Sparni#EUW). No login, no signup, no friction.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start bg-slate-800/50 border border-slate-800 rounded-2xl p-5">
            <span className="bg-indigo-500/20 text-indigo-400 text-sm font-bold w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">2</span>
            <div>
              <p className="font-semibold text-white">We analyze your last 10 competitive matches</p>
              <p className="text-sm text-slate-400 mt-1">
                Maps, agents, KDA, first duels, trades, KAST, pistol rounds, damage per round, eco performance — everything.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start bg-slate-800/50 border border-slate-800 rounded-2xl p-5">
            <span className="bg-indigo-500/20 text-indigo-400 text-sm font-bold w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">3</span>
            <div>
              <p className="font-semibold text-white">You get a session plan and personalized tips</p>
              <p className="text-sm text-slate-400 mt-1">
                Clear objective, action plan, and outcome prediction. Plus tips that adapt to your specific weaknesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-8">
        <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-3">🛡️ Compliance & Integrity</p>
        <h2 className="text-2xl font-bold mb-4">Built with respect for the game.</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Rankflow is built with strict respect for Riot Games' Developer Policies and the integrity of competitive Valorant.
        </p>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex gap-2">
            <span className="text-emerald-400">·</span>
            <span>No queue dodging suggestions or behaviors that harm other players</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400">·</span>
            <span>No boosting, smurfing, or account marketplace</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400">·</span>
            <span>No gambling or wagering features</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400">·</span>
            <span>No real-time in-game overlays — coaching happens between matches, not during them</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400">·</span>
            <span>No unauthorized game client modifications</span>
          </li>
        </ul>
      </section>

      {/* ROADMAP */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-3">🚀 What's Next</p>
        <h2 className="text-2xl font-bold mb-4">The road ahead.</h2>
        <p className="text-slate-300 leading-relaxed mb-5">
          We're just getting started. Here's what we're working on:
        </p>
        <ul className="space-y-3 text-sm text-slate-400">
          <li className="flex gap-3">
            <span className="text-indigo-400 flex-shrink-0">▸</span>
            <span><span className="text-white font-semibold">Official Riot API access</span> — to unlock full match history, real-time data, and deeper signals like clutch rates and ability efficiency</span>
          </li>
          <li className="flex gap-3">
            <span className="text-indigo-400 flex-shrink-0">▸</span>
            <span><span className="text-white font-semibold">Week-over-week progression</span> — track your growth over time, not just current state</span>
          </li>
          <li className="flex gap-3">
            <span className="text-indigo-400 flex-shrink-0">▸</span>
            <span><span className="text-white font-semibold">More coaching signals</span> — tilt detection, fatigue warnings, agent pool analysis</span>
          </li>
          <li className="flex gap-3">
            <span className="text-indigo-400 flex-shrink-0">▸</span>
            <span><span className="text-white font-semibold">Community features</span> — comparing with friends, sharing profiles, collaborative coaching</span>
          </li>
        </ul>
      </section>

      {/* CTA */}
      <section className="text-center py-8">
        <p className="text-slate-400 mb-4">Ready to start climbing smarter?</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#FF4654] hover:bg-[#ff5a66] transition px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#FF4654]/20 hover:shadow-[#FF4654]/40"
        >
          <span>Try Rankflow now</span>
          <span>→</span>
        </Link>
      </section>

    </div>
  )
}