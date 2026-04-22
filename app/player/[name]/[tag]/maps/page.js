import Link from "next/link"
import { getMapImage } from "@/app/mapImages"

export default async function MapsPage({ params }) {
  const { name, tag } = await params
  const apiKey = process.env.HENRIK_API_KEY

  const accountRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`,
    { headers: { Authorization: apiKey } }
  )
  const accountData = await accountRes.json()

  if (!accountData.data) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-bold text-rose-400">Player not found</h1>
      </div>
    )
  }

  const account = accountData.data

  const matchesRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v4/matches/eu/pc/${name}/${tag}?mode=competitive&size=20`,
    { headers: { Authorization: apiKey } }
  )
  const matchesData = await matchesRes.json()

  const matches = matchesData.data?.map(match => {
    const me = match.players?.find(p => p.puuid === account.puuid)
    const myTeam = me?.team_id
    const won = match.teams?.find(t => t.team_id === myTeam)?.won
    return {
      map: match.metadata?.map?.name || "Unknown",
      result: won ? "Win" : "Loss",
    }
  }) || []

  // Stats par map
  const mapStats = {}
  matches.forEach(match => {
    if (!mapStats[match.map]) mapStats[match.map] = { wins: 0, total: 0 }
    mapStats[match.map].total++
    if (match.result === "Win") mapStats[match.map].wins++
  })

  const mapList = Object.entries(mapStats).map(([map, stats]) => ({
    map,
    wr: Math.round((stats.wins / stats.total) * 100),
    wins: stats.wins,
    losses: stats.total - stats.wins,
    total: stats.total
  }))

  // Séparer en 3 catégories
  const bestMaps = mapList.filter(m => m.wr > 55).sort((a, b) => b.wr - a.wr)
  const masteredMaps = mapList.filter(m => m.wr >= 45 && m.wr <= 55).sort((a, b) => b.wr - a.wr)
  const worstMaps = mapList.filter(m => m.wr < 45).sort((a, b) => a.wr - b.wr)

  function MapCard({ mapData, borderColor, wrColor }) {
    const mapImage = getMapImage(mapData.map)

    return (
      <Link
        href={`/player/${name}/${tag}/map/${mapData.map}`}
        className={`group relative block bg-slate-900 border rounded-2xl overflow-hidden card-interactive ${borderColor}`}
      >
        {/* Image de fond */}
        {mapImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition"
            style={{ backgroundImage: `url(${mapImage})` }}
          />
        )}

        {/* Dégradé sombre pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900/40" />

        {/* Contenu */}
        <div className="relative p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-lg">{mapData.map}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {mapData.wins}W · {mapData.losses}L
              </p>
            </div>
            <p className={`text-2xl font-bold ${wrColor}`}>
              {mapData.wr}%
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-indigo-300 transition">
            <span>Voir détails</span>
            <span className="group-hover:translate-x-0.5 transition">→</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="space-y-6">

      {/* EN-TÊTE */}
      <div>
        <Link href={`/player/${name}/${tag}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition group">
          <span className="group-hover:-translate-x-0.5 transition">←</span>
          <span>Retour au dashboard</span>
        </Link>
        <h1 className="text-3xl font-bold mt-2">Maps de {account.name}</h1>
        <p className="text-slate-400 text-sm">Tes stats sur les {matches.length} derniers matchs</p>
      </div>

      {/* SOUS-NAVIGATION */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <a href={`/player/${name}/${tag}`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Dashboard</a>
        <a href={`/player/${name}/${tag}/coach`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Coach</a>
        <a href={`/player/${name}/${tag}/maps`} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-lg border border-slate-700 shadow-sm whitespace-nowrap">Maps</a>
        <a href={`/player/${name}/${tag}/agents`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Agents</a>
        <a href={`/player/${name}/${tag}/advanced`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Stats avancées</a>
        <a href={`/player/${name}/${tag}/history`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Historique</a>
      </div>

      {/* 3 COLONNES */}
      {mapList.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Aucun match trouvé
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">

          {/* MEILLEURES MAPS */}
          <div className="bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔥</span>
              <div>
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">À privilégier</p>
                <p className="text-base text-white font-semibold">Meilleures maps</p>
              </div>
            </div>

            <div className="space-y-3">
              {bestMaps.length > 0 ? (
                bestMaps.map(m => (
                  <MapCard
                    key={m.map}
                    mapData={m}
                    borderColor="border-emerald-500/30 hover:border-emerald-500/60"
                    wrColor="text-emerald-400"
                  />
                ))
              ) : (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-sm text-slate-500">Aucune map avec &gt;55% de WR</p>
                </div>
              )}
            </div>
          </div>

          {/* MAPS MAÎTRISÉES */}
          <div className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/30 rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚖️</span>
              <div>
                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">À consolider</p>
                <p className="text-base text-white font-semibold">Maps maîtrisées</p>
              </div>
            </div>

            <div className="space-y-3">
              {masteredMaps.length > 0 ? (
                masteredMaps.map(m => (
                  <MapCard
                    key={m.map}
                    mapData={m}
                    borderColor="border-slate-700 hover:border-indigo-500/60"
                    wrColor="text-indigo-400"
                  />
                ))
              ) : (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-sm text-slate-500">Aucune map entre 45% et 55%</p>
                </div>
              )}
            </div>
          </div>

          {/* PIRES MAPS */}
          <div className="bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/30 rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <p className="text-rose-400 text-xs font-semibold uppercase tracking-wider">À éviter</p>
                <p className="text-base text-white font-semibold">Pires maps</p>
              </div>
            </div>

            <div className="space-y-3">
              {worstMaps.length > 0 ? (
                worstMaps.map(m => (
                  <MapCard
                    key={m.map}
                    mapData={m}
                    borderColor="border-rose-500/30 hover:border-rose-500/60"
                    wrColor="text-rose-400"
                  />
                ))
              ) : (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-sm text-slate-500">Aucune map avec &lt;45% de WR</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}