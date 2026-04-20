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