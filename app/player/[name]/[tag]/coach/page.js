import Link from "next/link"

export default async function CoachPage({ params }) {
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
      agent: me?.agent?.name || "Unknown",
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
    total: stats.total
  })).sort((a, b) => b.wr - a.wr)

  const bestMap = mapList[0]
  const worstMap = mapList[mapList.length - 1]

  // Stats par agent
  const agentStats = {}
  matches.forEach(match => {
    if (!agentStats[match.agent]) agentStats[match.agent] = { wins: 0, total: 0 }
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

  function getRankTips(tier) {
    if (tier >= 3 && tier <= 8) {
      return [
        "🎯 Travaille ton crosshair placement : vise toujours à hauteur de tête",
        "💰 Apprends l'économie : save ou full buy, évite les force buy",
        "🎧 Utilise le son : les pas et les tirs ennemis donnent des infos"
      ]
    }
    if (tier >= 9 && tier <= 14) {
      return [
        "🗣️ Communique en callouts clairs : zone + HP + arme",
        "🤝 Joue en équipe : évite les peeks solo sans info",
        "⏱️ Gère ton timing : attends tes utilities avant de rush"
      ]
    }
    if (tier >= 15 && tier <= 20) {
      return [
        "🔍 Joue pour l'info : un flash + swing > un tap solo",
        "🎭 Varie tes setups : ne fais pas le même play chaque round",
        "📊 Analyse les économies ennemies pour prédire leurs plays"
      ]
    }
    return [
      "🧠 Adapte ton style au mid-round : reads vs anti-strat",
      "🎯 Maximise l'impact de tes utilities (timing + placement)",
      "📈 Focus sur la consistance : jouer propre > faire des highlights"
    ]
  }

  const tips = mmr ? getRankTips(mmr.currenttier) : []

  return (
    <div className="space-y-6">

      {/* EN-TÊTE */}
      <div>
        <Link href={`/player/${name}/${tag}`} className="text-sm text-indigo-400 hover:text-indigo-300 transition">
          ← Retour au dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-2">Coach de {account.name}</h1>
        <p className="text-slate-400 text-sm">Tes conseils personnalisés pour cette session</p>
      </div>

      {/* SOUS-NAVIGATION */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <a href={`/player/${name}/${tag}`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition">
          Dashboard
        </a>
        <a href={`/player/${name}/${tag}/coach`} className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg">
          Coach
        </a>
        <a href={`/player/${name}/${tag}/history`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition">
          Historique
        </a>
      </div>

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

      {/* CONSEILS ADAPTÉS AU RANG */}
      {tips.length > 0 && mmr && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm text-indigo-300">💡 Conseils pour {mmr.currenttierpatched}</p>
          </div>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <p className="text-slate-200 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
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

    </div>
  )
}