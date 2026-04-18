export default async function PlayerPage({ params }) {
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
        <p className="text-slate-400 mt-2">Check the Riot ID and try again</p>
      </div>
    )
  }

  const account = accountData.data

  const mmrRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v2/mmr/eu/${name}/${tag}`,
    { headers: { Authorization: apiKey } }
  )
  const mmrData = await mmrRes.json()
  const mmr = mmrData.data?.current_data

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
      kills: me?.stats?.kills || 0,
      deaths: me?.stats?.deaths || 0,
      assists: me?.stats?.assists || 0,
      agent: me?.agent?.name || "Unknown",
    }
  }) || []

  const wins = matches.filter(m => m.result === "Win").length
  const losses = matches.filter(m => m.result === "Loss").length
  const winrate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0

  // Calculer les stats par map
  const mapStats = {}
  matches.forEach(match => {
    if (!mapStats[match.map]) {
      mapStats[match.map] = { wins: 0, total: 0 }
    }
    mapStats[match.map].total++
    if (match.result === "Win") mapStats[match.map].wins++
  })

  const mapList = Object.entries(mapStats).map(([map, stats]) => ({
    map,
    wr: Math.round((stats.wins / stats.total) * 100),
    total: stats.total
  })).sort((a, b) => b.wr - a.wr)

  const bestMap = mapList[0]
  const worstMap = mapList[mapList.length - 1]

  // Calculer le meilleur agent
  const agentStats = {}
  matches.forEach(match => {
    if (!agentStats[match.agent]) {
      agentStats[match.agent] = { wins: 0, total: 0 }
    }
    agentStats[match.agent].total++
    if (match.result === "Win") agentStats[match.agent].wins++
  })

  const bestAgent = Object.entries(agentStats)
    .map(([agent, stats]) => ({
      agent,
      wr: Math.round((stats.wins / stats.total) * 100),
      total: stats.total
    }))
    .sort((a, b) => b.wr - a.wr)[0]

  function getRankColor(tier) {
    if (tier >= 21) return "text-green-400"
    if (tier >= 18) return "text-blue-400"
    if (tier >= 15) return "text-purple-400"
    if (tier >= 12) return "text-yellow-400"
    return "text-slate-400"
  }

  return (
    <div className="space-y-8">

      {/* JOUEUR */}
      <div className="flex items-center gap-6">
        <img
          src={account.card.small}
          className="rounded-xl w-16 h-16 object-cover border border-slate-700"
        />
        <div>
          <h1 className="text-4xl font-bold">{account.name}</h1>
          <p className="text-slate-400">#{account.tag} · Niveau {account.account_level}</p>
        </div>
      </div>

      {/* RANG */}
      {mmr && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <p className="text-slate-400 text-sm mb-3">Rang actuel</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={mmr.images.large} className="w-16 h-16" />
              <div>
                <p className={`text-2xl font-bold ${getRankColor(mmr.currenttier)}`}>
                  {mmr.currenttierpatched}
                </p>
                <p className="text-slate-400">{mmr.ranking_in_tier} RR</p>
              </div>
            </div>
            <div className={`text-lg font-bold ${mmr.mmr_change_to_last_game >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {mmr.mmr_change_to_last_game >= 0 ? "+" : ""}{mmr.mmr_change_to_last_game} RR
            </div>
          </div>
        </div>
      )}

      {/* SESSION PLAN */}
      {bestMap && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 hover:border-indigo-400/40 transition">
          <div className="bg-gradient-to-r from-slate-950/90 to-slate-900/70 p-6">
            <p className="text-sm text-indigo-300 mb-2">🎮 Session Plan</p>
            <h2 className="text-2xl font-semibold">Play {bestMap.map}</h2>
            <p className="text-slate-300 mt-1">Avoid {worstMap.map}</p>
            <div className="mt-4 flex gap-4 text-sm flex-wrap">
              <div className="bg-black/40 px-4 py-2 rounded-xl border border-slate-700">
                🎯 {bestAgent?.agent}
              </div>
              <div className="bg-black/40 px-4 py-2 rounded-xl border border-slate-700">
                📊 {bestMap.wr}% WR sur {bestMap.map}
              </div>
              <div className="bg-black/40 px-4 py-2 rounded-xl border border-slate-700">
                ⚠️ {worstMap.wr}% WR sur {worstMap.map}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SESSION RECAP */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
         <p className="text-slate-400 mb-4">{matches.length} derniers matchs compétitifs</p>
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div className="bg-slate-800 p-4 rounded-xl">
            <p className="text-emerald-400 text-xl font-bold">{wins}</p>
            <p className="text-sm text-slate-400">Wins</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl">
            <p className="text-rose-400 text-xl font-bold">{losses}</p>
            <p className="text-sm text-slate-400">Losses</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl">
            <p className="text-indigo-400 text-xl font-bold">{winrate}%</p>
            <p className="text-sm text-slate-400">Winrate</p>
          </div>
        </div>

        {/* LISTE DES MATCHS */}
        <div className="space-y-3">
          {matches.map((match, i) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${match.result === "Win" ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
              <div className="flex items-center gap-3">
                <span className={`font-bold text-sm px-2 py-1 rounded ${match.result === "Win" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                  {match.result}
                </span>
                <span className="text-white font-medium">{match.map}</span>
                <span className="text-slate-400 text-sm">{match.agent}</span>
              </div>
              <span className="text-slate-300 font-mono">{match.kills}/{match.deaths}/{match.assists}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}