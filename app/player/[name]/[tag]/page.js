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
    }
  }) || []

  const wins = matches.filter(m => m.result === "Win").length
  const losses = matches.filter(m => m.result === "Loss").length
  const winrate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0

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

      {/* SOUS-NAVIGATION */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <a href={`/player/${name}/${tag}`} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-lg border border-slate-700 shadow-sm">
          Dashboard
        </a>
        <a href={`/player/${name}/${tag}/coach`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition">
          Coach
        </a>
        <a href={`/player/${name}/${tag}/maps`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">
          Maps
        </a>
        <a href={`/player/${name}/${tag}/agents`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">
          Agents
        </a>
        <a href={`/player/${name}/${tag}/advanced`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">
          Stats avancées
        </a>
        <a href={`/player/${name}/${tag}/history`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition">
          Historique
        </a>
      </div>

      {/* RANG */}
      {mmr && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 card-hover">
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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 card-hover">
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

            const scores = history.map(h => ({
              score: h.currenttier * 100 + h.ranking_in_tier,
              tier: h.currenttier,
              rr: h.ranking_in_tier,
              change: h.mmr_change_to_last_game,
              rankName: h.currenttierpatched
            }))

            const minScore = Math.min(...scores.map(s => s.score))
            const maxScore = Math.max(...scores.map(s => s.score))

            const minTier = Math.floor(minScore / 100) - 1
            const maxTier = Math.floor(maxScore / 100) + 1
            const tiersToShow = []
            for (let t = minTier; t <= maxTier; t++) {
              tiersToShow.push(t)
            }

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

                <polygon
                  fill="url(#rank-gradient)"
                  points={`${paddingLeft},${paddingTop + innerHeight} ${pointsStr} ${chartWidth - paddingRight},${paddingTop + innerHeight}`}
                />

                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={pointsStr}
                />

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

      {/* SESSION RECAP */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 card-hover">
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-400">Session Recap</p>
          <a href={`/player/${name}/${tag}/coach`} className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition group">
            <span>Voir les conseils</span>
            <span className="group-hover:translate-x-0.5 transition">→</span>
          </a>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 p-5 rounded-2xl text-center">
            <p className="text-3xl font-bold text-emerald-400 tracking-tight">{wins}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Wins</p>
          </div>
          <div className="bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/20 p-5 rounded-2xl text-center">
            <p className="text-3xl font-bold text-rose-400 tracking-tight">{losses}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Losses</p>
          </div>
          <div className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 p-5 rounded-2xl text-center">
            <p className="text-3xl font-bold text-indigo-400 tracking-tight">{winrate}%</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Winrate</p>
          </div>
        </div>
      </div>

    </div>
  )
}