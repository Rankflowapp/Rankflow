"use client"
import { useRouter } from "next/navigation"
import { vctTeams } from "../data/vctTeams"

export default function ProTeams() {
  const router = useRouter()

  function handlePlayerClick(player) {
    if (!player.riotId) return
    const [name, tag] = player.riotId.split("#")
    if (name && tag) {
      router.push(`/player/${name}/${tag}`)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-20 px-4">

      {/* SECTION HEADER */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF4654]/10 border border-[#FF4654]/30 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-[#FF4654] rounded-full animate-pulse"></span>
          <span className="text-xs text-[#FF4654] uppercase tracking-wider font-semibold">Pro Scene</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-3">
          VCT EMEA
        </h2>
        <p className="text-slate-400 text-lg">
          Compare-toi à tes idoles de la scène pro
        </p>
      </div>

      {/* TEAMS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vctTeams.emea.map((team, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition"
          >
           {/* En-tête équipe */}
            <div className="flex items-center gap-4 mb-4 pb-3 border-b border-slate-800">
              {/* Logo */}
              <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-2xl">🎮</span>
                )}
              </div>

              {/* Nom + pays */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-lg truncate">{team.name}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{team.country}</p>
              </div>
            </div>

            {/* Liste des joueurs */}
            <div className="space-y-2">
              {team.players.map((player, pidx) => {
                const isClickable = !!player.riotId

                return (
                  <button
                    key={pidx}
                    onClick={() => handlePlayerClick(player)}
                    disabled={!isClickable}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
                      isClickable
                        ? "bg-slate-800/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 border border-transparent cursor-pointer group"
                        : "bg-slate-800/30 border border-transparent cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span className={`text-sm font-medium ${isClickable ? "text-white" : "text-slate-500"}`}>
                      {player.ign}
                    </span>
                    {isClickable ? (
                      <span className="text-xs text-slate-500 group-hover:text-indigo-300 transition flex items-center gap-1">
                        <span>Voir</span>
                        <span className="group-hover:translate-x-0.5 transition">→</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">Bientôt</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* NOTE DE FIN */}
      <p className="text-center text-xs text-slate-500 mt-8">
        Les Riot IDs des joueurs sont ajoutés au fur et à mesure. Plus de régions (Americas, Pacific, China) à venir.
      </p>

    </div>
  )
}