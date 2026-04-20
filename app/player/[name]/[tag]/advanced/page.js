import Link from "next/link"

export default async function AdvancedPage({ params }) {
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

  const matchesRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v4/matches/eu/pc/${name}/${tag}?mode=competitive&size=20`,
    { headers: { Authorization: apiKey } }
  )
  const matchesData = await matchesRes.json()
  const matches = matchesData.data || []

  // Calculer le first duel rate
  let firstKillsWon = 0
  let firstKillsLost = 0
  let totalFirstDuels = 0

  matches.forEach(match => {
    const kills = match.kills || []

    // Grouper les kills par round
    const killsByRound = {}
    kills.forEach(kill => {
      if (!killsByRound[kill.round]) killsByRound[kill.round] = []
      killsByRound[kill.round].push(kill)
    })

    // Pour chaque round, regarder le premier kill
    Object.values(killsByRound).forEach(roundKills => {
      // Trier par temps pour avoir le premier
      roundKills.sort((a, b) => a.time_in_round_in_ms - b.time_in_round_in_ms)
      const firstKill = roundKills[0]

      if (!firstKill) return

      // Est-ce que je suis impliqué dans le premier duel ?
      if (firstKill.killer?.puuid === myPuuid) {
        firstKillsWon++
        totalFirstDuels++
      } else if (firstKill.victim?.puuid === myPuuid) {
        firstKillsLost++
        totalFirstDuels++
      }
    })
  })

  const firstKillRate = totalFirstDuels > 0 ? Math.round((firstKillsWon / totalFirstDuels) * 100) : 0

  // Calculer le trade rate
  let deathsTraded = 0
  let totalDeaths = 0
  const TRADE_WINDOW_MS = 5000 // 5 secondes pour qu'un trade compte

  matches.forEach(match => {
    const kills = match.kills || []

    // Trier tous les kills par timestamp global
    const sortedKills = [...kills].sort((a, b) => a.time_in_match_in_ms - b.time_in_match_in_ms)

    // Trouver toutes mes morts
    sortedKills.forEach((kill, i) => {
      if (kill.victim?.puuid === myPuuid) {
        totalDeaths++
        const myKiller = kill.killer?.puuid
        const myDeathTime = kill.time_in_match_in_ms

        // Regarder les kills qui suivent dans la fenêtre de 5s
        for (let j = i + 1; j < sortedKills.length; j++) {
          const nextKill = sortedKills[j]
          const timeDiff = nextKill.time_in_match_in_ms - myDeathTime

          if (timeDiff > TRADE_WINDOW_MS) break

          // Un coéquipier a-t-il tué mon tueur ?
          const killerTeam = kill.killer?.team
          if (
            nextKill.victim?.puuid === myKiller &&
            nextKill.killer?.team !== killerTeam
          ) {
            deathsTraded++
            break
          }
        }
      }
    })
  })

  const tradeRate = totalDeaths > 0 ? Math.round((deathsTraded / totalDeaths) * 100) : 0

  function getTradeInsight(value) {
    if (value >= 60) return { text: "Excellent, tu joues bien en équipe", color: "text-emerald-400" }
    if (value >= 45) return { text: "Bonne coordination avec tes coéquipiers", color: "text-emerald-400" }
    if (value >= 30) return { text: "Correct, mais tu peux mieux te positionner avec tes teammates", color: "text-indigo-400" }
    if (value >= 20) return { text: "Tu joues souvent trop isolé, rapproche-toi de ton équipe", color: "text-amber-400" }
    return { text: "Tu meurs souvent sans apport pour ton équipe, évite les peeks solo", color: "text-rose-400" }
  }

  const tradeInsight = getTradeInsight(tradeRate)

  // Calculer le KAST (Kill, Assist, Survive, Trade)
  let kastRounds = 0
  let totalRounds = 0

  matches.forEach(match => {
    const rounds = match.rounds || []
    const kills = match.kills || []

    rounds.forEach(round => {
      const roundId = round.id
      totalRounds++

      // Kills et assists du joueur dans ce round
      const myRoundStat = round.stats?.find(s => s.player?.puuid === myPuuid)
      const hasKill = (myRoundStat?.stats?.kills || 0) > 0

      // Tous les kills du round pour trouver assists et traits
      const roundKills = kills.filter(k => k.round === roundId)

      // Assist : je suis dans les assistants d'un kill allié
      const hasAssist = roundKills.some(k =>
        k.assistants?.some(a => a.puuid === myPuuid)
      )

      // Est-ce que je suis mort dans ce round ?
      const myDeath = roundKills.find(k => k.victim?.puuid === myPuuid)
      const survived = !myDeath

      // Traded : je suis mort mais un coéquipier a vengé dans 5s
      let wasTraded = false
      if (myDeath) {
        const myDeathTime = myDeath.time_in_match_in_ms
        const myKiller = myDeath.killer?.puuid
        const killerTeam = myDeath.killer?.team

        wasTraded = roundKills.some(k =>
          k.victim?.puuid === myKiller &&
          k.killer?.team !== killerTeam &&
          k.time_in_match_in_ms > myDeathTime &&
          k.time_in_match_in_ms - myDeathTime <= TRADE_WINDOW_MS
        )
      }

      // Le joueur a contribué si au moins un critère est rempli
      if (hasKill || hasAssist || survived || wasTraded) {
        kastRounds++
      }
    })
  })

  const kast = totalRounds > 0 ? Math.round((kastRounds / totalRounds) * 100) : 0

  function getKastInsight(value) {
    if (value >= 75) return { text: "Niveau pro — impact énorme sur chaque round", color: "text-emerald-400" }
    if (value >= 65) return { text: "Excellent, tu contribues régulièrement à ton équipe", color: "text-emerald-400" }
    if (value >= 55) return { text: "Bon KAST, continue comme ça", color: "text-indigo-400" }
    if (value >= 45) return { text: "Moyen — tu es parfois inexistant dans les rounds", color: "text-amber-400" }
    return { text: "Faible impact — travaille ta survie et ton positionnement", color: "text-rose-400" }
  }

  const kastInsight = getKastInsight(kast)

  // Calculer la performance sur les pistol rounds (round 0 et round 12)
  let pistolRoundsWon = 0
  let pistolRoundsTotal = 0

  matches.forEach(match => {
    const rounds = match.rounds || []
    const myPlayer = match.players?.find(p => p.puuid === myPuuid)
    const myTeam = myPlayer?.team_id

    // Round 0 (attaque ou défense) et Round 12 (changement de côté)
    const pistolRounds = rounds.filter(r => r.id === 0 || r.id === 12)

    pistolRounds.forEach(round => {
      pistolRoundsTotal++
      if (round.winning_team === myTeam) {
        pistolRoundsWon++
      }
    })
  })

  const pistolWinrate = pistolRoundsTotal > 0 ? Math.round((pistolRoundsWon / pistolRoundsTotal) * 100) : 0

  function getPistolInsight(value) {
    if (value >= 70) return { text: "Excellent pistol — tu donnes un énorme avantage à ton équipe", color: "text-emerald-400" }
    if (value >= 55) return { text: "Bon pistol, tu crées souvent l'avantage économique", color: "text-emerald-400" }
    if (value >= 45) return { text: "Correct, mais les pistols méritent plus d'attention", color: "text-indigo-400" }
    if (value >= 30) return { text: "Tu perds trop de pistols — travaille tes setups d'ouverture", color: "text-amber-400" }
    return { text: "Catastrophique — les pistols te font perdre la moitié des manches", color: "text-rose-400" }
  }

  const pistolInsight = getPistolInsight(pistolWinrate)

  // Calculer le damage per round (DPR)
  let totalDamageDealt = 0
  let totalRoundsPlayed = 0

  matches.forEach(match => {
    const myPlayer = match.players?.find(p => p.puuid === myPuuid)
    const damage = myPlayer?.stats?.damage?.dealt || 0
    const roundsInMatch = match.rounds?.length || 0

    totalDamageDealt += damage
    totalRoundsPlayed += roundsInMatch
  })

  const damagePerRound = totalRoundsPlayed > 0 ? Math.round(totalDamageDealt / totalRoundsPlayed) : 0

  function getDprInsight(value) {
    if (value >= 160) return { text: "Niveau pro — tu es un vrai frag leader", color: "text-emerald-400" }
    if (value >= 140) return { text: "Excellent damage output, tu portes ton équipe", color: "text-emerald-400" }
    if (value >= 120) return { text: "Bon niveau de dégâts, dans la moyenne haute", color: "text-indigo-400" }
    if (value >= 100) return { text: "Correct mais améliorable, implique-toi plus dans les duels", color: "text-amber-400" }
    return { text: "Faible — tu ne fais pas assez de dégâts pour ton équipe", color: "text-rose-400" }
  }

  const dprInsight = getDprInsight(damagePerRound)

  function getDprColor(value) {
    if (value >= 140) return "text-emerald-400"
    if (value >= 100) return "text-indigo-400"
    return "text-rose-400"
  }

  // Calculer la performance eco vs full buy
  let ecoKills = 0
  let ecoRounds = 0
  let fullBuyKills = 0
  let fullBuyRounds = 0

  matches.forEach(match => {
    const rounds = match.rounds || []

    rounds.forEach(round => {
      const myRoundStat = round.stats?.find(s => s.player?.puuid === myPuuid)
      if (!myRoundStat) return

      const loadoutValue = myRoundStat.economy?.loadout_value || 0
      const kills = myRoundStat.stats?.kills || 0

      // Eco = loadout < 2000 (pistolet + peut-être armure légère)
      // Full buy = loadout >= 3500 (fusil principal + armure)
      if (loadoutValue < 2000) {
        ecoRounds++
        ecoKills += kills
      } else if (loadoutValue >= 3500) {
        fullBuyRounds++
        fullBuyKills += kills
      }
    })
  })

  const ecoKpr = ecoRounds > 0 ? (ecoKills / ecoRounds).toFixed(2) : "0.00"
  const fullBuyKpr = fullBuyRounds > 0 ? (fullBuyKills / fullBuyRounds).toFixed(2) : "0.00"

  function getEcoProfile() {
    const eco = parseFloat(ecoKpr)
    const full = parseFloat(fullBuyKpr)

    if (fullBuyRounds < 5 || ecoRounds < 5) {
      return { text: "Pas assez de données pour analyser ton profil économique", color: "text-slate-400" }
    }

    if (full > eco * 2) return { text: "Profil opportuniste — tu excelles avec du budget, travaille tes clutch en eco", color: "text-indigo-400" }
    if (eco >= full * 0.7) return { text: "Profil clutch — tu fais beaucoup avec peu, continue", color: "text-emerald-400" }
    if (full >= 0.8 && eco >= 0.3) return { text: "Profil équilibré — tu performes dans toutes les situations", color: "text-emerald-400" }
    if (full < 0.6) return { text: "Même en full buy tu ne frag pas assez, revois ton gunfight", color: "text-rose-400" }
    return { text: "Profil standard, tu suis la tendance de l'économie", color: "text-indigo-400" }
  }

  const ecoProfile = getEcoProfile()

  function getMetricColor(value, goodThreshold, badThreshold) {
    if (value >= goodThreshold) return "text-emerald-400"
    if (value <= badThreshold) return "text-rose-400"
    return "text-indigo-400"
  }

  function getMetricInsight(value) {
    if (value >= 60) return { text: "Excellent entry fragger", color: "text-emerald-400" }
    if (value >= 50) return { text: "Tu tiens tes duels, continue", color: "text-emerald-400" }
    if (value >= 40) return { text: "Ton aim est correct en first duel, mais il y a du progrès à faire", color: "text-indigo-400" }
    if (value >= 30) return { text: "Tu perds trop de premiers duels, travaille ton crosshair placement", color: "text-amber-400" }
    return { text: "Tu handicap ton équipe en mourant trop tôt, évite les peeks aggressifs", color: "text-rose-400" }
  }

  const insight = getMetricInsight(firstKillRate)

  return (
    <div className="space-y-6">

      {/* EN-TÊTE */}
      <div>
        <Link href={`/player/${name}/${tag}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition group">
          <span className="group-hover:-translate-x-0.5 transition">←</span>
          <span>Retour au dashboard</span>
        </Link>
        <h1 className="text-3xl font-bold mt-2">Stats avancées de {account.name}</h1>
        <p className="text-slate-400 text-sm">Analyse détaillée basée sur tes {matches.length} derniers matchs</p>
      </div>

      {/* SOUS-NAVIGATION */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <a href={`/player/${name}/${tag}`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">
          Dashboard
        </a>
        <a href={`/player/${name}/${tag}/coach`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">
          Coach
        </a>
        <a href={`/player/${name}/${tag}/maps`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">
          Maps
        </a>
        <a href={`/player/${name}/${tag}/agents`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">
          Agents
        </a>
        <a href={`/player/${name}/${tag}/advanced`} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-lg border border-slate-700 shadow-sm whitespace-nowrap">
          Stats avancées
        </a>
        <a href={`/player/${name}/${tag}/history`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">
          Historique
        </a>
      </div>

      {/* FIRST DUEL RATE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-2">⚔️ First Duel Rate</p>
            <h2 className="text-2xl font-bold">Tes premiers duels</h2>
            <p className="text-slate-400 text-sm mt-1">% de premiers kills gagnés quand tu es impliqué</p>
          </div>
          <div className="text-right">
            <p className={`text-5xl font-bold tracking-tight ${getMetricColor(firstKillRate, 55, 40)}`}>
              {firstKillRate}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {firstKillsWon}W / {firstKillsLost}L
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className={`absolute top-0 left-0 h-full rounded-full ${
              firstKillRate >= 55 ? "bg-emerald-500" :
              firstKillRate >= 40 ? "bg-indigo-500" : "bg-rose-500"
            }`}
            style={{ width: `${firstKillRate}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 mb-4">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>

        {/* Insight coach */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">💡 Coach insight</p>
          <p className={`text-sm font-medium ${insight.color}`}>{insight.text}</p>
        </div>

        {/* Détail */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 p-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">{firstKillsWon}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">First kills</p>
          </div>
          <div className="bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/20 p-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-rose-400 tracking-tight">{firstKillsLost}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">First deaths</p>
          </div>
          <div className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 p-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-indigo-400 tracking-tight">{totalFirstDuels}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Total duels</p>
          </div>
        </div>
      </div>

      {/* TRADE RATE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-2">🤝 Trade Rate</p>
            <h2 className="text-2xl font-bold">Tes morts traded</h2>
            <p className="text-slate-400 text-sm mt-1">% de tes morts vengées par un coéquipier dans les 5s</p>
          </div>
          <div className="text-right">
            <p className={`text-5xl font-bold tracking-tight ${getMetricColor(tradeRate, 50, 30)}`}>
              {tradeRate}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {deathsTraded}/{totalDeaths} traded
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className={`absolute top-0 left-0 h-full rounded-full ${
              tradeRate >= 50 ? "bg-emerald-500" :
              tradeRate >= 30 ? "bg-indigo-500" : "bg-rose-500"
            }`}
            style={{ width: `${tradeRate}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 mb-4">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>

        {/* Insight coach */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">💡 Coach insight</p>
          <p className={`text-sm font-medium ${tradeInsight.color}`}>{tradeInsight.text}</p>
        </div>

        {/* Détail */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 p-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">{deathsTraded}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Morts traded</p>
          </div>
          <div className="bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/20 p-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-rose-400 tracking-tight">{totalDeaths - deathsTraded}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Morts non traded</p>
          </div>
        </div>
      </div>

      {/* KAST */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-2">⭐ KAST</p>
            <h2 className="text-2xl font-bold">Ton impact par round</h2>
            <p className="text-slate-400 text-sm mt-1">% de rounds où tu contribues (Kill / Assist / Survive / Trade)</p>
          </div>
          <div className="text-right">
            <p className={`text-5xl font-bold tracking-tight ${getMetricColor(kast, 65, 45)}`}>
              {kast}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {kastRounds}/{totalRounds} rounds
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className={`absolute top-0 left-0 h-full rounded-full ${
              kast >= 65 ? "bg-emerald-500" :
              kast >= 45 ? "bg-indigo-500" : "bg-rose-500"
            }`}
            style={{ width: `${kast}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 mb-4">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>

        {/* Insight coach */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">💡 Coach insight</p>
          <p className={`text-sm font-medium ${kastInsight.color}`}>{kastInsight.text}</p>
        </div>

        {/* Benchmark */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Joueur moyen</p>
            <p className="text-lg font-bold text-slate-300 mt-1">~60%</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Ton KAST</p>
            <p className={`text-lg font-bold mt-1 ${getMetricColor(kast, 65, 45)}`}>{kast}%</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Niveau pro</p>
            <p className="text-lg font-bold text-emerald-400 mt-1">75%+</p>
          </div>
        </div>
      </div>

      {/* PISTOL ROUNDS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-2">🔫 Pistol Rounds</p>
            <h2 className="text-2xl font-bold">Ton impact sur les pistols</h2>
            <p className="text-slate-400 text-sm mt-1">Winrate sur les rounds 1 et 13 (début de mi-temps)</p>
          </div>
          <div className="text-right">
            <p className={`text-5xl font-bold tracking-tight ${getMetricColor(pistolWinrate, 55, 40)}`}>
              {pistolWinrate}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {pistolRoundsWon}W / {pistolRoundsTotal - pistolRoundsWon}L
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className={`absolute top-0 left-0 h-full rounded-full ${
              pistolWinrate >= 55 ? "bg-emerald-500" :
              pistolWinrate >= 40 ? "bg-indigo-500" : "bg-rose-500"
            }`}
            style={{ width: `${pistolWinrate}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 mb-4">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>

        {/* Insight coach */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">💡 Coach insight</p>
          <p className={`text-sm font-medium ${pistolInsight.color}`}>{pistolInsight.text}</p>
        </div>

        {/* Info */}
        <div className="mt-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            💎 Les pistol rounds déterminent l'économie des 2-3 rounds suivants. Un pistol gagné = une avalanche de rounds faciles. Un pistol perdu = eco forcée pendant 2-3 rounds.
          </p>
        </div>
      </div>

      {/* DAMAGE PER ROUND */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-2">💥 Damage / Round</p>
            <h2 className="text-2xl font-bold">Tes dégâts par round</h2>
            <p className="text-slate-400 text-sm mt-1">Moyenne de dégâts infligés par round joué</p>
          </div>
          <div className="text-right">
            <p className={`text-5xl font-bold tracking-tight ${getDprColor(damagePerRound)}`}>
              {damagePerRound}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              DPR moyen
            </p>
          </div>
        </div>

        {/* Barre de progression (max affiché = 200) */}
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className={`absolute top-0 left-0 h-full rounded-full ${
              damagePerRound >= 140 ? "bg-emerald-500" :
              damagePerRound >= 100 ? "bg-indigo-500" : "bg-rose-500"
            }`}
            style={{ width: `${Math.min((damagePerRound / 200) * 100, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 mb-4">
          <span>0</span>
          <span>100</span>
          <span>200+</span>
        </div>

        {/* Insight coach */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">💡 Coach insight</p>
          <p className={`text-sm font-medium ${dprInsight.color}`}>{dprInsight.text}</p>
        </div>

        {/* Benchmark */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Joueur moyen</p>
            <p className="text-lg font-bold text-slate-300 mt-1">~125</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Ton DPR</p>
            <p className={`text-lg font-bold mt-1 ${getDprColor(damagePerRound)}`}>{damagePerRound}</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Niveau pro</p>
            <p className="text-lg font-bold text-emerald-400 mt-1">160+</p>
          </div>
        </div>
      </div>

      {/* ECO VS FULL BUY */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="mb-6">
          <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-2">💰 Économie</p>
          <h2 className="text-2xl font-bold">Eco vs Full buy</h2>
          <p className="text-slate-400 text-sm mt-1">Ta performance selon le budget de ton équipe</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* ECO */}
          <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-5">
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">🪙 Eco rounds</p>
            <p className="text-3xl font-bold text-white tracking-tight">{ecoKpr}</p>
            <p className="text-xs text-slate-400 mt-1">Kills / round</p>
            <p className="text-xs text-slate-500 mt-3">{ecoRounds} rounds joués</p>
          </div>

          {/* FULL BUY */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-2xl p-5">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">💎 Full buy</p>
            <p className="text-3xl font-bold text-white tracking-tight">{fullBuyKpr}</p>
            <p className="text-xs text-slate-400 mt-1">Kills / round</p>
            <p className="text-xs text-slate-500 mt-3">{fullBuyRounds} rounds joués</p>
          </div>
        </div>

        {/* Insight coach */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">💡 Profil économique</p>
          <p className={`text-sm font-medium ${ecoProfile.color}`}>{ecoProfile.text}</p>
        </div>

        {/* Info */}
        <div className="mt-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            💎 Eco = moins de 2000 d'équipement (pistolet seul). Full buy = plus de 3500 (fusil + armure). Le reste des rounds (force-buy, semi-buy) n'est pas compté pour cette analyse.
          </p>
        </div>
      </div>

      {/* INFO BOX */}
      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5">
        <p className="text-xs text-indigo-400 uppercase tracking-wider font-semibold mb-2">📖 Qu'est-ce que c'est ?</p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Le <span className="font-semibold text-white">First Duel Rate</span> mesure ta performance dans le premier duel de chaque round où tu es impliqué.
          C'est une statistique cruciale : gagner son premier duel donne à ton équipe l'avantage numérique et la prise d'info, tandis que le perdre met ton équipe en difficulté dès le début du round.
        </p>
      </div>

      <div className="text-center text-sm text-slate-500 pt-4">
        D'autres métriques avancées arrivent bientôt : Trade Rate, KAST, performance sur eco rounds...
      </div>

    </div>
  )
}