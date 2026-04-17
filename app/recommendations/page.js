export default function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_35%)]" />

      <main className="relative max-w-7xl mx-auto px-6 py-12 space-y-8">
        

        <div>
          <h1 className="text-4xl font-bold">Recommendations</h1>
        </div>

        <section className="grid lg:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <p className="text-sm text-slate-400">Best Queue Tonight</p>
            <h2 className="text-2xl font-semibold mt-2">
              Jett on Ascent / Split
            </h2>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <p className="text-sm text-slate-400">Priority Maps</p>
            <p className="text-emerald-300">Ascent · Split · Haven</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <p className="text-sm text-slate-400">Avoid</p>
            <p className="text-amber-300">Bind · Lotus</p>
          </div>
        </section>

      </main>
    </div>
  )
}