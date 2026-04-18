import { mapsData } from "../data/mapsData"
import { playerData } from "../data/playerData"
import { getBestMap, getWorstMap, getFocus, getMainAgent } from "../lib/logic"

export default function HomePage() {

  const maps = mapsData

  const bestMap = getBestMap(maps)
  const worstMap = getWorstMap(maps)
  const focus = getFocus(maps)
  const mainAgent = getMainAgent(bestMap)

  const fallbackAgent = "Raze"

  const rankData = playerData.history
  const rank = playerData.rank
  const rr = playerData.rr

  const wins = playerData.session.wins
  const losses = playerData.session.losses
  const totalGames = wins + losses
  const winrate = Math.round((wins / totalGames) * 100)

  const points = rankData.map((y, i) => `${i * 15},${y}`).join(" ")

  const first = rankData[0]
  const last = rankData[rankData.length - 1]
  const diff = last - first
  const isUp = diff > 0
  const rrGain = isUp ? `+${Math.abs(diff)}` : `-${Math.abs(diff)}`

  function getRankColor(rank) {
    if (rank.includes("Gold")) return "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.6)]"
    if (rank.includes("Silver")) return "bg-slate-300 text-black"
    return "bg-slate-500"
  }

  function getSessionMessage() {
    if (winrate >= 60) return "Great session — keep playing"
    if (winrate >= 50) return "Decent session"
    return "Rough session — review mistakes"
  }

  function getMapImage(mapSlug) {
    return `/maps/${mapSlug}.jpg`
  }

  const sessionMessage = getSessionMessage()

  return (
    <div className="space-y-12">

      {/* PLAYER */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            {playerData.name}
          </h1>
          <p className="text-slate-400 text-sm">
            Ready to climb
          </p>
        </div>

        <div className="bg-emerald-500/10 text-emerald-300 px-4 py-2 rounded-xl border border-emerald-400/30">
          ● Online
        </div>

      </div>

      {/* SESSION PLAN */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-800 transition hover:scale-[1.01] hover:border-indigo-400/40">

        <img
          src={getMapImage(bestMap.slug)}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />

        <div className="relative bg-gradient-to-r from-slate-950/90 to-slate-900/70 p-6">

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
            <div className="bg-black/40 px-4 py-2 rounded-xl border border-slate-700 hover:border-indigo-400 transition">
              🎯 {mainAgent}
            </div>
            <div className="bg-black/40 px-4 py-2 rounded-xl border border-slate-700 hover:border-indigo-400 transition">
              🔁 {fallbackAgent}
            </div>
          </div>

          <p className="mt-4 text-slate-300">
            Focus: {focus}
          </p>

        </div>

      </section>

      {/* RANK */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-6 shadow-lg transition hover:-translate-y-1">

        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center gap-4">

            <div className={`px-4 py-2 rounded-xl font-bold ${getRankColor(rank)}`}>
              {rank}
            </div>

            <div>
              <p className="text-slate-400 text-sm">RR</p>
              <p className="text-lg font-semibold">{rr}</p>
            </div>

          </div>

          <div className={`text-lg font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
            {rrGain} RR
          </div>

        </div>

        <svg viewBox="0 0 100 40" className="w-full h-32">

          <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          <polygon fill="url(#gradient)" points={`${points} 100,40 0,40`} />

          <polyline
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            points={points}
          />

          {rankData.map((y, i) => (
            <circle key={i} cx={i * 15} cy={y} r="2" fill="#6366f1" />
          ))}

        </svg>

      </section>

      {/* SESSION RECAP */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 transition hover:-translate-y-1">

        <p className="text-slate-400 mb-4">Session Recap</p>

        <div className="grid grid-cols-3 gap-4 text-center">

          <div className="bg-slate-800 p-4 rounded-xl hover:bg-slate-700 transition">
            <p className="text-emerald-400 text-xl font-bold">{wins}</p>
            <p className="text-sm text-slate-400">Wins</p>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl hover:bg-slate-700 transition">
            <p className="text-rose-400 text-xl font-bold">{losses}</p>
            <p className="text-sm text-slate-400">Losses</p>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl hover:bg-slate-700 transition">
            <p className="text-indigo-400 text-xl font-bold">{winrate}%</p>
            <p className="text-sm text-slate-400">Winrate</p>
          </div>

        </div>

        <p className="mt-4 text-slate-300">
          {sessionMessage}
        </p>

      </section>

    </div>
  )
}