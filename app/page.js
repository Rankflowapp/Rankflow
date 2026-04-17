import { mapsData } from "../data/mapsData"
import { getBestMap, getWorstMap, getFocus, getMainAgent } from "../lib/logic"

export default function HomePage() {

  const maps = mapsData

  // 🧠 LOGIC ENGINE
  const bestMap = getBestMap(maps)
  const worstMap = getWorstMap(maps)
  const focus = getFocus(maps)
  const mainAgent = getMainAgent(bestMap)

  const fallbackAgent = "Raze"

  const scoreCards = [
    ['Duel Score', '84', 'text-emerald-300'],
    ['Eco Score', '61', 'text-amber-300'],
    ['Mastery', '78', 'text-emerald-300'],
    ['Clutch Rate', '29%', 'text-rose-300'],
  ]

  return (
    <div className="space-y-10">

      {/* 🎮 SESSION PLAN */}
      <section className="bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 border border-indigo-400/30 p-6 rounded-3xl">

        <p className="text-sm text-indigo-300 mb-2">
          🎮 Session Plan
        </p>

        <h2 className="text-2xl font-semibold">
          Play {bestMap.name}
        </h2>

        <p className="text-slate-300 mt-2">
          Avoid {worstMap.name}
        </p>

        <div className="mt-4 flex gap-4 text-sm">
          <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
            🎯 Main: {mainAgent}
          </div>
          <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
            🔁 Fallback: {fallbackAgent}
          </div>
        </div>

        <p className="mt-4 text-slate-300">
          Focus: {focus}
        </p>

      </section>

      {/* MAIN INSIGHT */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <h2 className="text-2xl font-semibold">
          Your aim is rank-ready.
        </h2>
        <p className="text-slate-400 mt-2">
          Improve eco discipline to rank up faster.
        </p>
      </section>

      {/* KPI */}
      <section className="grid md:grid-cols-4 gap-4">
        {scoreCards.map(([label, value, color]) => (
          <div key={label} className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <p className="text-slate-400">{label}</p>
            <p className={`text-3xl font-bold mt-2 ${color}`}>
              {value}
            </p>
          </div>
        ))}
      </section>

      {/* MAPS OVERVIEW */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-slate-400">Best Map</p>
          <p className="text-2xl font-semibold text-emerald-300 mt-2">
            {bestMap.name}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-slate-400">Weakest Map</p>
          <p className="text-2xl font-semibold text-amber-300 mt-2">
            {worstMap.name}
          </p>
        </div>
      </section>

    </div>
  )
}