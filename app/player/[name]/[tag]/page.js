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

  // Récupérer l'historique MMR pour la courbe
  const historyRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v1/mmr-history/eu/${name}/${tag}`,
    { headers: { Authorization: apiKey } }
  )
  const historyData = await historyRes.json()
  const history = historyData.data?.slice(0, 15).reverse() || []

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

const agentList = Object.entries(agentStats)
    .map(([agent, stats]) => ({
      agent,
      wr: Math.round((stats.wins / stats.total) * 100),
      total: stats.total
    }))
    .sort((a, b) => b.wr - a.wr)

  const bestAgent = agentList[0]
  const worstAgent = agentList[agentList.length - 1]

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

{/* COURBE DE PROGRESSION */}
      {history.length > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-400 text-sm">Progression</p>
              <p className="text-xs text-slate-500 mt-1">{history.length} derniers matchs</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-400">Win</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-slate-400">Loss</span>
              </span>
            </div>
          </div>

          {(() => {
            // Noms des rangs Valorant (tier 3 = Iron 1 ... tier 27 = Radiant)
            const rankNames = {
              3: "Iron 1", 4: "Iron 2", 5: "Iron 3",
              6: "Bronze 1", 7: "Bronze 2", 8: "Bronze 3",
              9: "Silver 1", 10: "Silver 2", 11: "Silver 3",
              12: "Gold 1", 13: "Gold 2", 14: "Gold 3",
              15: "Plat 1", 16: "Plat 2", 17: "Plat 3",
              18: "Diamond 1", 19: "Diamond 2", 20: "Diamond 3",
              21: "Ascendant 1", 22: "Ascendant 2", 23: "Ascendant 3",
              24: "Immortal 1", 25: "Immortal 2", 26: "Immortal 3",
              27: "Radiant"
            }

            // Convertir chaque match en score absolu (tier * 100 + RR)
            const scores = history.map(h => ({
              score: h.currenttier * 100 + h.ranking_in_tier,
              tier: h.currenttier,
              rr: h.ranking_in_tier,
              change: h.mmr_change_to_last_game,
              rankName: h.currenttierpatched
            }))

            const minScore = Math.min(...scores.map(s => s.score))
            const maxScore = Math.max(...scores.map(s => s.score))

            // Déterminer les tiers à afficher (au moins 2, max 4)
            const minTier = Math.floor(minScore / 100) - 1
            const maxTier = Math.floor(maxScore / 100) + 1
            const tiersToShow = []
            for (let t = minTier; t <= maxTier; t++) {
              tiersToShow.push(t)
            }

            // L'échelle va du bas du tier minimum au haut du tier maximum
            const scaleMin = minTier * 100
            const scaleMax = (maxTier + 1) * 100
            const scaleRange = scaleMax - scaleMin

            const chartWidth = 320
            const chartHeight = 140
            const paddingLeft = 70
            const paddingRight = 10
            const paddingTop = 10
            const paddingBottom = 10
            const innerWidth = chartWidth - paddingLeft - paddingRight
            const innerHeight = chartHeight - paddingTop - paddingBottom

            const points = scores.map((s, i) => {
              const x = paddingLeft + (i / (scores.length - 1)) * innerWidth
              const y = paddingTop + innerHeight - ((s.score - scaleMin) / scaleRange) * innerHeight
              return { x, y, ...s }
            })

            const pointsStr = points.map(p => `${p.x},${p.y}`).join(" ")

            return (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-52">
                <defs>
                  <linearGradient id="rank-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Lignes de séparation des tiers + labels */}
                {tiersToShow.map((tier) => {
                  const tierTopScore = (tier + 1) * 100
                  const y = paddingTop + innerHeight - ((tierTopScore - scaleMin) / scaleRange) * innerHeight
                  const yLabel = paddingTop + innerHeight - ((tier * 100 + 50 - scaleMin) / scaleRange) * innerHeight
                  return (
                    <g key={tier}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray="2,3"
                      />
                      <text
                        x={paddingLeft - 6}
                        y={yLabel + 3}
                        fill="#64748b"
                        fontSize="9"
                        textAnchor="end"
                      >
                        {rankNames[tier] || `Tier ${tier}`}
                      </text>
                    </g>
                  )
                })}

                {/* Zone remplie */}
                <polygon
                  fill="url(#rank-gradient)"
                  points={`${paddingLeft},${paddingTop + innerHeight} ${pointsStr} ${chartWidth - paddingRight},${paddingTop + innerHeight}`}
                />

                {/* Ligne */}
                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={pointsStr}
                />

                {/* Points */}
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#0f172a"
                    stroke={p.change >= 0 ? "#10b981" : "#f43f5e"}
                    strokeWidth="2"
                  />
                ))}
              </svg>
            )
          })()}

          <div className="flex justify-between mt-2 text-xs text-slate-500 pl-16 pr-2">
            <span>Plus ancien</span>
            <span>Plus récent</span>
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

      {/* MEILLEURE / PIRE MAP */}
      {bestMap && worstMap && bestMap.map !== worstMap.map && (
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-gradient-to-br from-emerald-500/10 to-slate-900 border border-emerald-500/30 rounded-3xl p-6">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">Meilleure map</p>
            <p className="text-3xl font-bold mb-1">{bestMap.map}</p>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl font-bold text-emerald-400">{bestMap.wr}%</span>
              <span className="text-sm text-slate-400">winrate</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">{bestMap.total} matchs joués</p>
          </div>

          <div className="bg-gradient-to-br from-rose-500/10 to-slate-900 border border-rose-500/30 rounded-3xl p-6">
            <p className="text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">Pire map</p>
            <p className="text-3xl font-bold mb-1">{worstMap.map}</p>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl font-bold text-rose-400">{worstMap.wr}%</span>
              <span className="text-sm text-slate-400">winrate</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">{worstMap.total} matchs joués</p>
          </div>

        </div>
      )}

      {/* MEILLEUR / PIRE AGENT */}
      {bestAgent && worstAgent && bestAgent.agent !== worstAgent.agent && (
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-gradient-to-br from-emerald-500/10 to-slate-900 border border-emerald-500/30 rounded-3xl p-6">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">Meilleur agent</p>
            <p className="text-3xl font-bold mb-1">{bestAgent.agent}</p>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl font-bold text-emerald-400">{bestAgent.wr}%</span>
              <span className="text-sm text-slate-400">winrate</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">{bestAgent.total} matchs joués</p>
          </div>

          <div className="bg-gradient-to-br from-rose-500/10 to-slate-900 border border-rose-500/30 rounded-3xl p-6">
            <p className="text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">Pire agent</p>
            <p className="text-3xl font-bold mb-1">{worstAgent.agent}</p>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl font-bold text-rose-400">{worstAgent.wr}%</span>
              <span className="text-sm text-slate-400">winrate</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">{worstAgent.total} matchs joués</p>
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