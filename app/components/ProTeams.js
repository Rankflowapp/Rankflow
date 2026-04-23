"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { vctTeams } from "../data/vctTeams"

const regions = [
  {
    key: "emea",
    name: "EMEA",
    fullName: "Europe, Middle East & Africa",
    logo: "/teams/vct-emea.png",
    color: "#EAB308",
    bgGradient: "from-yellow-500/20 to-amber-500/10",
    borderColor: "border-yellow-500",
    textColor: "text-yellow-500",
    shadowColor: "shadow-yellow-500/30",
  },
  {
    key: "americas",
    name: "Americas",
    fullName: "North & South America",
    logo: "/teams/vct-americas.png",
    color: "#F97316",
    bgGradient: "from-orange-500/20 to-orange-600/10",
    borderColor: "border-orange-500",
    textColor: "text-orange-500",
    shadowColor: "shadow-orange-500/30",
  },
  {
    key: "pacific",
    name: "Pacific",
    fullName: "Asia-Pacific",
    logo: "/teams/vct-pacific.png",
    color: "#38BDF8",
    bgGradient: "from-sky-400/20 to-sky-500/10",
    borderColor: "border-sky-400",
    textColor: "text-sky-400",
    shadowColor: "shadow-sky-400/30",
  },
  {
    key: "china",
    name: "China",
    fullName: "China League",
    logo: "/teams/vct-china.png",
    color: "#DC2626",
    bgGradient: "from-red-600/20 to-red-700/10",
    borderColor: "border-red-600",
    textColor: "text-red-500",
    shadowColor: "shadow-red-600/30",
  },
]

export default function ProTeams() {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [modalPlayer, setModalPlayer] = useState(null)
  const [modalTeam, setModalTeam] = useState(null)
  const [riotIdInput, setRiotIdInput] = useState("")
  const [sourceInput, setSourceInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  function handlePlayerClick(player, team) {
    if (player.riotId) {
      const [name, tag] = player.riotId.split("#")
      if (name && tag) {
        router.push(`/player/${name}/${tag}`)
      }
    } else {
      setModalPlayer(player)
      setModalTeam(team)
    }
  }

  function openSuggestModal(player, team, e) {
    e.stopPropagation()
    setModalPlayer(player)
    setModalTeam(team)
  }

  function closeModal() {
    setModalPlayer(null)
    setModalTeam(null)
    setRiotIdInput("")
    setSourceInput("")
    setSubmitStatus(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!riotIdInput.trim()) return

    setSubmitting(true)
    setSubmitStatus(null)

    try {
      const res = await fetch("https://formspree.io/f/mgorplqw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          player: modalPlayer.ign,
          team: modalTeam.name,
          currentRiotId: modalPlayer.riotId || "Aucun",
          suggestedRiotId: riotIdInput.trim(),
          source: sourceInput.trim() || "Non précisé",
          type: modalPlayer.riotId ? "Correction" : "Ajout",
        })
      })

      if (res.ok) {
        setSubmitStatus("success")
        setTimeout(() => {
          closeModal()
        }, 2000)
      } else {
        setSubmitStatus("error")
      }
    } catch (err) {
      setSubmitStatus("error")
    }

    setSubmitting(false)
  }

  const currentRegion = regions.find(r => r.key === selectedRegion)
  const currentTeams = selectedRegion ? vctTeams[selectedRegion] : []

  return (
    <div className="w-full max-w-6xl mx-auto mt-20 px-4">

      {/* SECTION HEADER */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF4654]/10 border border-[#FF4654]/30 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-[#FF4654] rounded-full animate-pulse"></span>
          <span className="text-xs text-[#FF4654] uppercase tracking-wider font-semibold">Pro Scene</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-3">
          VCT 2026
        </h2>
        <p className="text-slate-400 text-lg">
          Compare-toi à tes idoles de la scène pro
        </p>
      </div>

      {/* SÉLECTEUR DE RÉGION */}
      <div className="mb-10">
        <p className="text-center text-sm text-slate-400 mb-5 uppercase tracking-wider font-semibold">
          Choisis ta région
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {regions.map(region => {
            const isActive = selectedRegion === region.key
            return (
              <button
                key={region.key}
                onClick={() => setSelectedRegion(region.key)}
                className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 border-2 ${
                  isActive
                    ? `${region.borderColor} bg-gradient-to-br ${region.bgGradient} shadow-lg ${region.shadowColor} scale-105`
                    : "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-900/80"
                }`}
              >
                <div className="relative z-10 flex items-center gap-3">
                  {/* Logo de la région */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 transition ${
                    isActive ? "bg-white/10" : "bg-slate-800/50"
                  }`}>
                    <img
                      src={region.logo}
                      alt={region.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = '<span class="text-xl">🌍</span>'
                      }}
                    />
                  </div>

                  {/* Texte */}
                  <div className="text-left">
                    <p className={`text-xl md:text-2xl font-bold tracking-tight transition ${
                      isActive ? region.textColor : "text-white"
                    }`}>
                      {region.name}
                    </p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider line-clamp-1">
                      {region.fullName}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* MESSAGE SI AUCUNE RÉGION SÉLECTIONNÉE */}
      {!selectedRegion && (
        <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl">
          <div className="text-5xl mb-3">🌍</div>
          <p className="text-lg font-semibold text-slate-300 mb-1">Sélectionne une région pour commencer</p>
          <p className="text-sm text-slate-500">Découvre les équipes et joueurs de la scène pro Valorant</p>
        </div>
      )}

      {/* TEAMS GRID */}
      {selectedRegion && currentRegion && (
        <>
          <div className="mb-6 flex items-center gap-3">
            <div className={`w-1 h-8 rounded-full`} style={{ backgroundColor: currentRegion.color }}></div>
            <div>
              <p className={`text-xs uppercase tracking-wider font-semibold ${currentRegion.textColor}`}>
                VCT {currentRegion.name}
              </p>
              <p className="text-lg font-bold text-white">{currentTeams.length} équipes · {currentTeams.length * 5} joueurs</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentTeams.map((team, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-4 mb-4 pb-3 border-b border-slate-800">
                  <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = '<span class="text-2xl">🎮</span>'
                        }}
                      />
                    ) : (
                      <span className="text-2xl">🎮</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-lg truncate">{team.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{team.country}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {team.players.map((player, pidx) => {
                    const hasId = !!player.riotId

                    return (
                      <div
                        key={pidx}
                        onClick={() => handlePlayerClick(player, team)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition cursor-pointer group ${
                          hasId
                            ? "bg-slate-800/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 border border-transparent"
                            : "bg-slate-800/30 hover:bg-slate-800/60 border border-transparent"
                        }`}
                      >
                        <span className={`text-sm font-medium ${hasId ? "text-white" : "text-slate-400"}`}>
                          {player.ign}
                        </span>

                        {hasId ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => openSuggestModal(player, team, e)}
                              className="text-xs text-slate-600 hover:text-amber-400 transition opacity-0 group-hover:opacity-100"
                              title="Corriger le Riot ID"
                            >
                              ✎
                            </button>
                            <span className="text-xs text-slate-500 group-hover:text-indigo-300 transition flex items-center gap-1">
                              <span>Voir</span>
                              <span className="group-hover:translate-x-0.5 transition">→</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 group-hover:text-indigo-300 transition">
                            Suggérer
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-500 mt-8">
            Les Riot IDs sont ajoutés au fur et à mesure grâce à la communauté
          </p>
        </>
      )}

      {/* MODAL DE SUGGESTION */}
      {modalPlayer && modalTeam && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {submitStatus === "success" ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-emerald-400 mb-2">Merci !</h3>
                <p className="text-sm text-slate-400">
                  Ta suggestion a bien été envoyée. Elle sera vérifiée et ajoutée rapidement.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-2">🤝 Aide la communauté</p>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {modalPlayer.riotId ? `Corriger le Riot ID de ${modalPlayer.ign}` : `Riot ID de ${modalPlayer.ign}`}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {modalTeam.name}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                      Riot ID du joueur
                    </label>
                    <input
                      type="text"
                      value={riotIdInput}
                      onChange={(e) => setRiotIdInput(e.target.value)}
                      placeholder="Nom#TAG"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                    {modalPlayer.riotId && (
                      <p className="text-xs text-slate-500 mt-1.5">
                        Actuellement : {modalPlayer.riotId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                      Source <span className="text-slate-600 normal-case">(optionnel)</span>
                    </label>
                    <input
                      type="text"
                      value={sourceInput}
                      onChange={(e) => setSourceInput(e.target.value)}
                      placeholder="ex: stream Twitch, annonce officielle..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                  </div>

                  {submitStatus === "error" && (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
                      <p className="text-sm text-rose-400">
                        ❌ Une erreur s'est produite. Réessaye dans un instant.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !riotIdInput.trim()}
                      className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition"
                    >
                      {submitting ? "Envoi..." : "Envoyer"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}