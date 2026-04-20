"use client"
import { useState } from "react"

export default function HistoryView({ matches, totalRr }) {
  const [filter, setFilter] = useState("all")

  const filteredMatches = matches.filter(m => {
    if (filter === "wins") return m.result === "Win"
    if (filter === "losses") return m.result === "Loss"
    return true
  })

  return (
    <div className="space-y-6">

      {/* TOTAL RR SESSION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-1">Session totale</p>
            <p className="text-sm text-slate-400">{matches.length} matchs compétitifs</p>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold tracking-tight ${totalRr >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {totalRr >= 0 ? "+" : ""}{totalRr} RR
            </p>
            <p className="text-xs text-slate-500 mt-1">Net sur la session</p>
          </div>
        </div>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            filter === "all"
              ? "text-white bg-gradient-to-b from-slate-800 to-slate-800/50 border border-slate-700 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
          }`}
        >
          Tous ({matches.length})
        </button>
        <button
          onClick={() => setFilter("wins")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            filter === "wins"
              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
          }`}
        >
          Victoires ({matches.filter(m => m.result === "Win").length})
        </button>
        <button
          onClick={() => setFilter("losses")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            filter === "losses"
              ? "text-rose-400 bg-rose-500/10 border border-rose-500/30 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
          }`}
        >
          Défaites ({matches.filter(m => m.result === "Loss").length})
        </button>
      </div>

      {/* LISTE DES MATCHS */}
      <div className="space-y-3">
        {filteredMatches.map((match, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-4 rounded-xl border ${
              match.result === "Win"
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-rose-500/30 bg-rose-500/5"
            }`}
          >
            <div className="flex items-center gap-4">
              {match.agentIcon && (
                <img src={match.agentIcon} className="w-10 h-10 rounded-lg" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-xs px-2 py-0.5 rounded ${
                      match.result === "Win"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {match.result}
                  </span>
                  <span className="text-white font-semibold">{match.map}</span>
                  <span className="text-slate-400 text-sm">· {match.agent}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Score: {match.score}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-slate-200 font-mono text-lg">
                  {match.kills}<span className="text-slate-500">/</span>{match.deaths}<span className="text-slate-500">/</span>{match.assists}
                </p>
                <p className="text-xs text-slate-500">K / D / A</p>
              </div>

              {match.rrChange !== null && (
                <div className="text-right min-w-[70px]">
                  <p className={`text-xl font-bold ${match.rrChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {match.rrChange >= 0 ? "+" : ""}{match.rrChange}
                  </p>
                  <p className="text-xs text-slate-500">RR</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredMatches.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Aucun match dans cette catégorie
          </div>
        )}
      </div>

    </div>
  )
}