"use client"
import { useState } from "react"

export default function AdvancedView({ metrics }) {
  const [openMetric, setOpenMetric] = useState(null)

  function toggleMetric(key) {
    setOpenMetric(openMetric === key ? null : key)
  }

  function getColor(value, good, bad) {
    if (value >= good) return "text-emerald-400"
    if (value <= bad) return "text-rose-400"
    return "text-indigo-400"
  }

  function getBgColor(value, good, bad) {
    if (value >= good) return "bg-emerald-500"
    if (value <= bad) return "bg-rose-500"
    return "bg-indigo-500"
  }

  return (
    <div className="space-y-6">

      {/* COMPACT OVERVIEW */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-4">📊 Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

          {metrics.map(m => (
            <button
              key={m.key}
              onClick={() => toggleMetric(m.key)}
              className={`group text-left p-4 rounded-2xl border-2 transition-all ${
                openMetric === m.key
                  ? "bg-slate-800 border-indigo-500/60 shadow-lg shadow-indigo-500/10"
                  : "bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/40 hover:bg-slate-800 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5"
              }`}
            >
              <p className="text-xs text-slate-400 mb-2">{m.icon} {m.shortTitle}</p>
              <p className={`text-2xl font-bold tracking-tight mb-2 ${getColor(m.value, m.goodThreshold, m.badThreshold)}`}>
                {m.displayValue}
              </p>
              <div className={`flex items-center gap-1 text-xs transition ${
                openMetric === m.key
                  ? "text-indigo-300"
                  : "text-slate-500 group-hover:text-indigo-300"
              }`}>
                <span>{openMetric === m.key ? "Close" : "View details"}</span>
                <span className="group-hover:translate-x-0.5 transition">
                  {openMetric === m.key ? "↑" : "→"}
                </span>
              </div>
            </button>
          ))}

        </div>
        <p className="text-xs text-slate-500 mt-4 text-center">
          Click a metric to view its details
        </p>
      </div>

      {/* SELECTED METRIC DETAIL */}
      {openMetric && (() => {
        const m = metrics.find(x => x.key === openMetric)
        if (!m) return null

        return (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 fade-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-2">{m.icon} {m.shortTitle}</p>
                <h2 className="text-2xl font-bold">{m.title}</h2>
                <p className="text-slate-400 text-sm mt-1">{m.description}</p>
              </div>
              <div className="text-right">
                <p className={`text-5xl font-bold tracking-tight ${getColor(m.value, m.goodThreshold, m.badThreshold)}`}>
                  {m.displayValue}
                </p>
                {m.subValue && <p className="text-xs text-slate-500 mt-1">{m.subValue}</p>}
              </div>
            </div>

            {/* Progress bar */}
            {m.showBar && (
              <>
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full ${getBgColor(m.value, m.goodThreshold, m.badThreshold)}`}
                    style={{ width: `${Math.min((m.value / (m.maxValue || 100)) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mb-4">
                  <span>0{m.unit || ""}</span>
                  <span>{Math.round((m.maxValue || 100) / 2)}{m.unit || ""}</span>
                  <span>{m.maxValue || 100}{m.unit || ""}{m.maxValue === 200 ? "+" : ""}</span>
                </div>
              </>
            )}

            {/* Coach insight */}
            <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">💡 Coach insight</p>
              <p className={`text-sm font-medium ${m.insightColor}`}>{m.insight}</p>
            </div>

            {/* Extra content (detail, benchmark, etc.) */}
            {m.extraContent}
          </div>
        )
      })()}

    </div>
  )
}