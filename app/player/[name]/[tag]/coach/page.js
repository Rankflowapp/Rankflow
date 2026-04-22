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

  // Récupérer le rang
  const mmrRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v2/mmr/eu/${name}/${tag}`,
    { headers: { Authorization: apiKey } }
  )
  const mmrData = await mmrRes.json()
  const currentTier = mmrData.data?.current_data?.currenttier || 0
  const currentTierName = mmrData.data?.current_data?.currenttierpatched || "Unranked"

  // Récupérer les matchs
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

  // Conseils selon le rang
  function getRankTips(tier) {
    if (tier >= 3 && tier <= 8) {
      // Iron / Bronze
      return [
        "Concentre-toi uniquement sur ton aim — ouvre Aim Lab ou le deathmatch pendant 15 min avant chaque session",
        "Crosshair placement à hauteur de tête, toujours — 80% des duels se jouent là",
        "Évite de sur-réfléchir les strats, ton équipe ne les exécutera pas parfaitement de toute façon",
      ]
    }
    if (tier >= 9 && tier <= 14) {
      // Silver / Gold
      return [
        "Apprends à lire l'économie — save quand l'équipe est à <2500, force uniquement sur pistol followup",
        "Utilise ton utility au début du round, pas à la fin — les infos valent plus que les frags",
        "Stop de trade mal tes duels, attends que ton coéquipier soit en position",
      ]
    }
    if (tier >= 15 && tier <= 20) {
      // Platinum / Diamond
      return [
        "Apprends 2-3 lineups par map (mollos, smokes post-plant) — ça change des rounds",
        "Map control avant contact — jouez des utilities coordonnées pour gagner du terrain sans combattre",
        "Mid-round calls : si le premier contact échoue, ayez un plan B immédiat (rotate, fake, stack)",
      ]
    }
    // Ascendant+
    return [
      "Timings millimétrés — chaque util doit être lancé dans la seconde optimale du round",
      "Utility combos avancés : flash + peek synchronisés avec l'équipe, pas en solo",
      "Lecture des tendances adverses — adapte tes exécutions après 5-6 rounds d'observation",
    ]
  }

  const rankTips = getRankTips(currentTier)

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

          {/* Streak */}
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

          {/* Agent problématique */}
          {problematicAgent && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 bg-amber-500/5 border-l-amber-500 border-y border-r border-amber-500/20">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  Agent en difficulté : {problematicAgent.agent}
                </p>
                <p className="text-xs text-slate-400">
                  Évite ce pick en ranked tant que tu ne l'as pas travaillé en custom
                </p>
              </div>
              <p className="text-lg font-bold text-amber-400">
                {problematicAgent.wr}%
              </p>
            </div>
          )}

          {/* Map problématique */}
          {problematicMap && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 bg-orange-500/5 border-l-orange-500 border-y border-r border-orange-500/20">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  Map défavorable : {problematicMap.map}
                </p>
                <p className="text-xs text-slate-400">
                  Dodge ou joue-la en unrated pour travailler tes setups
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

        {/* OBJECTIF */}
        <div className="mb-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Objectif de la session</p>
          {(() => {
            // Calcul du RR net des derniers matchs pour définir l'objectif
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

        {/* PLAN D'ACTION */}
        <div className="space-y-3 mb-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Ton plan d'action</p>

          {/* Action 1 : Maps à privilégier */}
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

          {/* Action 2 : Pick recommandé */}
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

          {/* Action 3 : Vigilance */}
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

        {/* PRÉDICTION */}
        {bestMap && bestAgent && (
          <div className="bg-slate-800/50 border border-indigo-500/30 rounded-2xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">📊 Prédiction</p>
            {(() => {
              // Moyenne du WR sur la meilleure map + meilleur agent
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

      {/* CONSEILS SELON LE RANG */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">💡 Conseils pour ton rang</p>
          <span className="text-xs text-slate-500">· {currentTierName}</span>
        </div>
        <div className="space-y-3">
          {rankTips.map((tip, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-indigo-400 font-bold mt-0.5">{i + 1}.</span>
              <p className="text-slate-300 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CARDS BEST/WORST MAP ET AGENT */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Meilleure map */}
        {bestMap && (
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-3xl p-6">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">🗺️ Ta meilleure map</p>
            <p className="text-3xl font-bold text-white">{bestMap.map}</p>
            <p className="text-slate-400 text-sm mt-1">{bestMap.wins}W · {bestMap.losses}L · {bestMap.wr}% de winrate</p>
            <p className="text-sm text-slate-300 mt-3">Force la queue sur cette map dès que possible.</p>
          </div>
        )}

        {/* Meilleur agent */}
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