import Link from "next/link"
import {
  calculateFirstDuelRate,
  calculateTradeRate,
  calculateKast,
  calculatePistolWinrate,
  calculateDpr,
  calculateEcoVsFullBuy,
  generatePersonalizedTips,
} from "../../../../utils/advancedMetrics"

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
  const myPuuid = account.puuid

  // Récupérer le rang
  const mmrRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v2/mmr/eu/${name}/${tag}`,
    { headers: { Authorization: apiKey } }
  )
  const mmrData = await mmrRes.json()
  const currentTierName = mmrData.data?.current_data?.currenttierpatched || "Unranked"

  // Récupérer les matchs
  const matchesRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v4/matches/eu/pc/${name}/${tag}?mode=competitive&size=20`,
    { headers: { Authorization: apiKey } }
  )
  const matchesData = await matchesRes.json()
  const rawMatches = matchesData.data || []

  const matches = rawMatches.map(match => {
    const me = match.players?.find(p => p.puuid === account.puuid)
    const myTeam = me?.team_id
    const won = match.teams?.find(t => t.team_id === myTeam)?.won
    return {
      map: match.metadata?.map?.name || "Unknown",
      result: won ? "Win" : "Loss",
      agent: me?.agent?.name || "Unknown",
    }
  })

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

  const bestMap = mapList.filter(m => m.total >= 2).sort((a, b) => b.wr - a.wr)[0]
  const worstMap = mapList.filter(m => m.total >= 2).sort((a, b) => a.wr - b.wr)[0]

  // Stats par agent
  const agentStats = {}
  matches.forEach(match => {
    if (!agentStats[match.agent]) agentStats[match.agent] = { wins: 0, total: 0 }
    agentStats[match.agent].total++
    if (match.result === "Win") agentStats[match.agent].wins++
  })

  const agentList = Object.entries(agentStats).map(([agent, stats]) => ({
    agent,
    wr: Math.round((stats.wins / stats.total) * 100),
    wins: stats.wins,
    losses: stats.total - stats.wins,
    total: stats.total
  }))

  const bestAgent = agentList.filter(a => a.total >= 2).sort((a, b) => b.wr - a.wr)[0]
  const worstAgent = agentList.filter(a => a.total >= 2).sort((a, b) => a.wr - b.wr)[0]

  // Détection streak
  let currentStreak = 0
  let streakType = null
  for (const match of matches) {
    if (streakType === null) {
      streakType = match.result
      currentStreak = 1
    } else if (match.result === streakType) {
      currentStreak++
    } else {
      break
    }
  }

  // Alertes agent/map problématiques (min 3 games, WR <= 35%)
  const problematicAgent = agentList.find(a => a.total >= 3 && a.wr <= 35)
  const problematicMap = mapList.find(m => m.total >= 3 && m.wr <= 35)

  // ========== CALCUL DES METRIQUES AVANCEES ==========
  const firstDuel = calculateFirstDuelRate(rawMatches, myPuuid)
  const trade = calculateTradeRate(rawMatches, myPuuid)
  const kast = calculateKast(rawMatches, myPuuid)
  const pistol = calculatePistolWinrate(rawMatches, myPuuid)
  const dpr = calculateDpr(rawMatches, myPuuid)
  const eco = calculateEcoVsFullBuy(rawMatches, myPuuid)

  const personalizedTips = generatePersonalizedTips({
    firstDuel,
    trade,
    kast,
    pistol,
    dpr,
    eco,
  })

  return (
    <div className="space-y-6">

      {/* EN-TÊTE */}
      <div>
        <Link href={`/player/${name}/${tag}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition group">
          <span className="group-hover:-translate-x-0.5 transition">←</span>
          <span>Retour au dashboard</span>
        </Link>
        <h1 className="text-3xl font-bold mt-2">Coach de {account.name}</h1>
        <p className="text-slate-400 text-sm">Conseils personnalisés pour ta session</p>
      </div>

      {/* SOUS-NAVIGATION */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <a href={`/player/${name}/${tag}`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Dashboard</a>
        <a href={`/player/${name}/${tag}/coach`} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-lg border border-slate-700 shadow-sm whitespace-nowrap">Coach</a>
        <a href={`/player/${name}/${tag}/maps`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Maps</a>
        <a href={`/player/${name}/${tag}/agents`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Agents</a>
        <a href={`/player/${name}/${tag}/advanced`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Stats avancées</a>
        <a href={`/player/${name}/${tag}/history`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Historique</a>
      </div>

      {/* ALERTES COMPACTES */}
      {(currentStreak >= 3 || problematicAgent || problematicMap) && (
        <div className="space-y-2">

          {currentStreak >= 3 && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 ${
              streakType === "Loss"
                ? "bg-[#FF4654]/5 border-l-[#FF4654] border-y border-r border-[#FF4654]/20"
                : "bg-emerald-500/5 border-l-emerald-500 border-y border-r border-emerald-500/20"
            }`}>
              <span className="text-xl">{streakType === "Loss" ? "🔥" : "⚡"}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  {streakType === "Loss" ? "Série de défaites en cours" : "Série de victoires en cours"}
                </p>
                <p className="text-xs text-slate-400">
                  {streakType === "Loss"
                    ? "Fais une pause ou switch de mode, le tilt se ressent"
                    : "Continue sur cette lancée, tu es en confiance"}
                </p>
              </div>
              <p className={`text-lg font-bold ${streakType === "Loss" ? "text-[#FF4654]" : "text-emerald-400"}`}>
                {currentStreak}
              </p>
            </div>
          )}

          {problematicAgent && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 bg-amber-500/5 border-l-amber-500 border-y border-r border-amber-500/20">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  Agent en difficulté : {problematicAgent.agent}
                </p>
                <p className="text-xs text-slate-400">
                  Garde ce pick pour les customs tant que tu ne l'as pas travaillé
                </p>
              </div>
              <p className="text-lg font-bold text-amber-400">
                {problematicAgent.wr}%
              </p>
            </div>
          )}

          {problematicMap && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 bg-orange-500/5 border-l-orange-500 border-y border-r border-orange-500/20">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  Map défavorable : {problematicMap.map}
                </p>
                <p className="text-xs text-slate-400">
                  Travaille cette map en unrated pour améliorer tes setups
                </p>
              </div>
              <p className="text-lg font-bold text-orange-400">
                {problematicMap.wr}%
              </p>
            </div>
          )}

        </div>
      )}

      {/* SESSION PLAN ENRICHI */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6">
        <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-4">🎯 Ton Session Plan</p>

        <div className="mb-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Objectif de la session</p>
          {(() => {
            const sessionWins = matches.filter(m => m.result === "Win").length
            const sessionLosses = matches.filter(m => m.result === "Loss").length
            const netScore = sessionWins - sessionLosses

            let objective = ""
            let objectiveColor = ""

            if (netScore < -2) {
              objective = "Stopper l'hémorragie, viser +10 RR minimum"
              objectiveColor = "text-rose-400"
            } else if (netScore > 2) {
              objective = "Confirmer la montée, viser +20 RR cette session"
              objectiveColor = "text-emerald-400"
            } else {
              objective = "Breakthrough, viser +25 RR pour décoller"
              objectiveColor = "text-indigo-400"
            }

            return (
              <p className={`text-2xl font-bold ${objectiveColor}`}>
                {objective}
              </p>
            )
          })()}
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Ton plan d'action</p>

          <div className="flex gap-3 items-start bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
            <span className="bg-emerald-500/20 text-emerald-400 text-sm font-bold w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">1</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Maps à privilégier</p>
              {bestMap ? (
                <p className="text-sm text-slate-400 mt-1">
                  Joue <span className="text-emerald-400 font-semibold">{bestMap.map}</span> quand elle tombe — {bestMap.wr}% de WR ({bestMap.wins}W/{bestMap.losses}L)
                </p>
              ) : (
                <p className="text-sm text-slate-500 mt-1">Pas encore assez de données sur tes maps</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 items-start bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
            <span className="bg-indigo-500/20 text-indigo-400 text-sm font-bold w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">2</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Pick recommandé</p>
              {bestAgent ? (
                <p className="text-sm text-slate-400 mt-1">
                  Prends <span className="text-indigo-400 font-semibold">{bestAgent.agent}</span> — tu y es à {bestAgent.wr}% de WR ({bestAgent.wins}W/{bestAgent.losses}L)
                </p>
              ) : (
                <p className="text-sm text-slate-500 mt-1">Pas encore assez de données sur tes agents</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 items-start bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
            <span className="bg-amber-500/20 text-amber-400 text-sm font-bold w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">3</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Points de vigilance</p>
              {worstMap || worstAgent ? (
                <p className="text-sm text-slate-400 mt-1">
                  {worstMap && <>Travaille <span className="text-amber-400 font-semibold">{worstMap.map}</span> en unrated ({worstMap.wr}% WR)</>}
                  {worstMap && worstAgent && " · "}
                  {worstAgent && <>Garde <span className="text-amber-400 font-semibold">{worstAgent.agent}</span> pour les customs ({worstAgent.wr}% WR)</>}
                </p>
              ) : (
                <p className="text-sm text-slate-500 mt-1">Aucun point de vigilance majeur détecté</p>
              )}
            </div>
          </div>
        </div>

        {bestMap && bestAgent && (
          <div className="bg-slate-800/50 border border-indigo-500/30 rounded-2xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">📊 Prédiction</p>
            {(() => {
              const avgWr = Math.round((bestMap.wr + bestAgent.wr) / 2)
              return (
                <p className="text-sm text-slate-300 leading-relaxed">
                  En respectant ce plan, tu as <span className="text-2xl font-bold text-indigo-300">{avgWr}%</span> de chances d'atteindre ton objectif cette session.
                </p>
              )
            })()}
          </div>
        )}
      </div>

      {/* CONSEILS PERSONNALISÉS */}
      <div className="bg-gradient-to-br from-violet-500/10 via-slate-900 to-slate-900 border border-violet-500/30 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs text-violet-300 uppercase tracking-wider font-semibold">🎯 Conseils pour TOI</p>
          <span className="text-xs text-slate-500">· {currentTierName}</span>
        </div>

        {personalizedTips.length > 0 ? (
          <div className="space-y-3">
            {personalizedTips.map((tip, i) => (
              <div key={i} className="flex gap-3 items-start bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
                <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-white">{tip.title}</p>
                    <span className="text-xs text-slate-500">{tip.stat}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{tip.advice}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-5 text-center">
            <p className="text-2xl mb-2">🏆</p>
            <p className="text-sm font-semibold text-emerald-400 mb-1">Aucune faiblesse critique détectée</p>
            <p className="text-sm text-slate-400">
              Tu es solide sur tous les fondamentaux. Concentre-toi maintenant sur l'optimisation de ton meilleur agent et pousse tes trades encore plus haut.
            </p>
          </div>
        )}
      </div>

      {/* CARDS BEST/WORST MAP ET AGENT */}
      <div className="grid md:grid-cols-2 gap-6">

        {bestMap && (
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-3xl p-6">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">🗺️ Ta meilleure map</p>
            <p className="text-3xl font-bold text-white">{bestMap.map}</p>
            <p className="text-slate-400 text-sm mt-1">{bestMap.wins}W · {bestMap.losses}L · {bestMap.wr}% de winrate</p>
            <p className="text-sm text-slate-300 mt-3">Privilégie cette map pendant tes sessions compétitives.</p>
          </div>
        )}

        {bestAgent && (
          <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/30 rounded-3xl p-6">
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">🎭 Ton meilleur agent</p>
            <p className="text-3xl font-bold text-white">{bestAgent.agent}</p>
            <p className="text-slate-400 text-sm mt-1">{bestAgent.wins}W · {bestAgent.losses}L · {bestAgent.wr}% de winrate</p>
            <p className="text-sm text-slate-300 mt-3">C'est ton pick principal, continue à le maîtriser.</p>
          </div>
        )}

      </div>

    </div>
  )
}