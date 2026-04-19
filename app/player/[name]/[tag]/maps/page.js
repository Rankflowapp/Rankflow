import Link from "next/link"

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
  })).sort((a, b) => b.wr - a.wr)

  function getWrColor(wr) {
    if (wr >= 60) return "text-emerald-400"
    if (wr >= 45) return "text-indigo-400"
    return "text-rose-400"
  }

  function getWrBorder(wr) {
    if (wr >= 60) return "border-emerald-500/30 hover:border-emerald-500/60"
    if (wr >= 45) return "border-slate-700 hover:border-indigo-500/60"
    return "border-rose-500/30 hover:border-rose-500/60"
  }

  return (
    <div className="space-y-6">

      {/* EN-TÊTE */}
      <div>
        <Link href={`/player/${name}/${tag}`} className="text-sm text-indigo-400 hover:text-indigo-300 transition">
          ← Retour au dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-2">Maps de {account.name}</h1>
        <p className="text-slate-400 text-sm">Tes stats sur les {matches.length} derniers matchs</p>
      </div>

      {/* SOUS-NAVIGATION */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <a href={`/player/${name}/${tag}`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">
          Dashboard
        </a>
        <a href={`/player/${name}/${tag}/coach`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">
          Coach
        </a>
        <a href={`/player/${name}/${tag}/maps`} className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg whitespace-nowrap">
          Maps
        </a>
        <a href={`/player/${name}/${tag}/history`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">
          Historique
        </a>
      </div>

      {/* LISTE DES MAPS */}
      <div className="space-y-3">
        {mapList.map((map) => (
          <Link
            key={map.map}
            href={`/player/${name}/${tag}/map/${map.map}`}
            className={`block bg-slate-900 border rounded-2xl p-5 transition ${getWrBorder(map.wr)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">{map.map}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {map.wins}W · {map.losses}L · {map.total} matchs
                </p>
              </div>

              <div className="text-right">
                <p className={`text-3xl font-bold ${getWrColor(map.wr)}`}>
                  {map.wr}%
                </p>
                <p className="text-xs text-slate-500">winrate</p>
              </div>
            </div>
          </Link>
        ))}

        {mapList.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Aucun match trouvé
          </div>
        )}
      </div>

    </div>
  )
}