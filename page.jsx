export default function RankflowLandingPage() {
  const features = [
    {
      title: 'Progress Tracking',
      text: 'Follow your mastery evolution over time with automatic snapshots and delta analysis.'
    },
    {
      title: 'Agent Intelligence',
      text: 'Understand which agents and maps maximize your performance and confidence.'
    },
    {
      title: 'Goal Coaching',
      text: 'Set rank-up targets and get actionable recommendations on what to improve next.'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_35%)]" />

      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-indigo-300 mb-4">Rankflow</p>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Turn your matches into a progression system
            </h1>
            <p className="text-slate-300 text-lg mt-6 leading-8 max-w-xl">
              More than a tracker: Rankflow acts like a personal coach for Valorant,
              translating every session into growth signals, weaknesses, comfort picks,
              and the fastest path to your next rank.
            </p>
            <div className="mt-8 flex gap-4">
              <button className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-semibold shadow-lg">
                Join Beta
              </button>
              <button className="px-6 py-3 rounded-2xl border border-slate-700 text-white">
                See Progress Engine
              </button>
            </div>
          </div>

          <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs">
              +12 this week
            </div>
            <h2 className="text-2xl font-semibold mb-6">Rank Progress Engine</h2>
            <div className="space-y-4">
              <div className="flex justify-between"><span>Duel Score</span><span>80</span></div>
              <div className="flex justify-between"><span>Eco Score</span><span>60</span></div>
              <div className="flex justify-between"><span>Mastery</span><span>70</span></div>
              <div className="mt-4 h-24 rounded-2xl border border-slate-800 p-4 flex items-end gap-2">
                {[35, 45, 50, 62, 70, 82].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-xl bg-gradient-to-t from-indigo-500 to-emerald-400" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="pt-4 border-t border-slate-800 text-slate-300">
                Insight: your mechanics are stable, but your economy discipline is delaying your climb.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        {features.map((item) => (
          <div key={item.title} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur">
            <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
            <p className="text-slate-300 leading-7">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
