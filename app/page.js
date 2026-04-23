"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ProTeams from "./components/ProTeams"

export default function HomePage() {
  const [riotId, setRiotId] = useState("")
  const router = useRouter()

  function handleSearch(e) {
    e.preventDefault()
    if (!riotId.includes("#")) return
    const [name, tag] = riotId.split("#")
    router.push(`/player/${name}/${tag}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-10">

      {/* HEADLINE */}
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF4654]/10 border border-[#FF4654]/30 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-[#FF4654] rounded-full animate-pulse"></span>
          <span className="text-xs text-[#FF4654] uppercase tracking-wider font-semibold">Valorant Performance Tracker</span>
        </div>

        <h1 className="text-7xl md:text-8xl font-bold tracking-tighter mb-3 leading-none" style={{textShadow: "0 0 30px rgba(255, 70, 84, 0.7), 0 0 60px rgba(255, 70, 84, 0.5), 0 0 100px rgba(255, 70, 84, 0.3)"}}>
          RANKFLOW
        </h1>

        <p className="text-3xl md:text-4xl font-semibold text-slate-300 mb-6">
          Climb smarter<span className="text-[#FF4654]">.</span>
        </p>

        <p className="text-slate-400 text-lg leading-relaxed">
          Analyze your performance, identify your best maps, get personalized coaching advice.
          <br />
          <span className="text-slate-300">Rankflow is your coach before every session.</span>
        </p>
      </div>

      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} className="w-full max-w-md">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Riot#ID"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF4654]/50 focus:ring-2 focus:ring-[#FF4654]/20 transition"
          />
          <button
            type="submit"
            className="bg-[#FF4654] hover:bg-[#ff5a66] transition px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#FF4654]/20 hover:shadow-[#FF4654]/40"
          >
            Search
          </button>
        </div>
        <p className="text-xs text-slate-500 text-center mt-3">
          Enter your Riot ID in the Name#TAG format
        </p>
      </form>

      {/* FEATURES TEASER */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mt-4">
        <div className="text-center">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm font-semibold text-slate-200">Dashboard</p>
          <p className="text-xs text-slate-500 mt-1">Overview</p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-sm font-semibold text-slate-200">Coach</p>
          <p className="text-xs text-slate-500 mt-1">Tailored advice</p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">📈</div>
          <p className="text-sm font-semibold text-slate-200">Progression</p>
          <p className="text-xs text-slate-500 mt-1">Rank tracking</p>
        </div>
      </div>

      {/* SECTION PRO TEAMS */}
      <ProTeams />

    </div>
  )
}