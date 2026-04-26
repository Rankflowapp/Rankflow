import PlayerNotFound from "../../../../components/PlayerNotFound"
import Link from "next/link"
import AdvancedView from "./AdvancedView"

export default async function AdvancedPage({ params }) {
  const { name, tag } = await params
  const apiKey = process.env.HENRIK_API_KEY

  const accountRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`,
    { headers: { Authorization: apiKey } }
  )
  const accountData = await accountRes.json()

  if (!accountData.data) {
    return <PlayerNotFound />
  }

  const account = accountData.data
  const myPuuid = account.puuid

  const matchesRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v4/matches/eu/pc/${name}/${tag}?mode=competitive&size=20`,
    { headers: { Authorization: apiKey } }
  )
  const matchesData = await matchesRes.json()
  const matches = matchesData.data || []

  const TRADE_WINDOW_MS = 5000

  // ========== FIRST DUEL RATE ==========
  let firstKillsWon = 0
  let firstKillsLost = 0
  let totalFirstDuels = 0

  matches.forEach(match => {
    const kills = match.kills || []
    const killsByRound = {}
    kills.forEach(kill => {
      if (!killsByRound[kill.round]) killsByRound[kill.round] = []
      killsByRound[kill.round].push(kill)
    })
    Object.values(killsByRound).forEach(roundKills => {
      roundKills.sort((a, b) => a.time_in_round_in_ms - b.time_in_round_in_ms)
      const firstKill = roundKills[0]
      if (!firstKill) return
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

  // ========== TRADE RATE ==========
  let deathsTraded = 0
  let totalDeaths = 0

  matches.forEach(match => {
    const kills = match.kills || []
    const sortedKills = [...kills].sort((a, b) => a.time_in_match_in_ms - b.time_in_match_in_ms)
    sortedKills.forEach((kill, i) => {
      if (kill.victim?.puuid === myPuuid) {
        totalDeaths++
        const myKiller = kill.killer?.puuid
        const myDeathTime = kill.time_in_match_in_ms
        for (let j = i + 1; j < sortedKills.length; j++) {
          const nextKill = sortedKills[j]
          const timeDiff = nextKill.time_in_match_in_ms - myDeathTime
          if (timeDiff > TRADE_WINDOW_MS) break
          const killerTeam = kill.killer?.team
          if (nextKill.victim?.puuid === myKiller && nextKill.killer?.team !== killerTeam) {
            deathsTraded++
            break
          }
        }
      }
    })
  })

  const tradeRate = totalDeaths > 0 ? Math.round((deathsTraded / totalDeaths) * 100) : 0

  // ========== KAST ==========
  let kastRounds = 0
  let totalRounds = 0

  matches.forEach(match => {
    const rounds = match.rounds || []
    const kills = match.kills || []
    rounds.forEach(round => {
      const roundId = round.id
      totalRounds++
      const myRoundStat = round.stats?.find(s => s.player?.puuid === myPuuid)
      const hasKill = (myRoundStat?.stats?.kills || 0) > 0
      const roundKills = kills.filter(k => k.round === roundId)
      const hasAssist = roundKills.some(k => k.assistants?.some(a => a.puuid === myPuuid))
      const myDeath = roundKills.find(k => k.victim?.puuid === myPuuid)
      const survived = !myDeath
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
      if (hasKill || hasAssist || survived || wasTraded) kastRounds++
    })
  })

  const kast = totalRounds > 0 ? Math.round((kastRounds / totalRounds) * 100) : 0

  // ========== PISTOL ROUNDS ==========
  let pistolRoundsWon = 0
  let pistolRoundsTotal = 0

  matches.forEach(match => {
    const rounds = match.rounds || []
    const myPlayer = match.players?.find(p => p.puuid === myPuuid)
    const myTeam = myPlayer?.team_id
    const pistolRounds = rounds.filter(r => r.id === 0 || r.id === 12)
    pistolRounds.forEach(round => {
      pistolRoundsTotal++
      if (round.winning_team === myTeam) pistolRoundsWon++
    })
  })

  const pistolWinrate = pistolRoundsTotal > 0 ? Math.round((pistolRoundsWon / pistolRoundsTotal) * 100) : 0

  // ========== DAMAGE PER ROUND ==========
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

  // ========== ECO VS FULL BUY ==========
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

  // ========== INSIGHTS ==========
  function getFirstDuelInsight(v) {
    if (v >= 60) return { text: "Excellent entry fragger", color: "text-emerald-400" }
    if (v >= 50) return { text: "You win your duels, keep it up", color: "text-emerald-400" }
    if (v >= 40) return { text: "Your aim is decent in first duels, but there's room to improve", color: "text-indigo-400" }
    if (v >= 30) return { text: "You lose too many first duels, work on your crosshair placement", color: "text-amber-400" }
    return { text: "You handicap your team by dying too early, avoid aggressive peeks", color: "text-rose-400" }
  }

  function getTradeInsight(v) {
    if (v >= 60) return { text: "Excellent, you play well with your team", color: "text-emerald-400" }
    if (v >= 45) return { text: "Good coordination with your teammates", color: "text-emerald-400" }
    if (v >= 30) return { text: "Decent, but you could position better with your team", color: "text-indigo-400" }
    if (v >= 20) return { text: "You often play too isolated, stay closer to your team", color: "text-amber-400" }
    return { text: "You die without value for your team, avoid solo peeks", color: "text-rose-400" }
  }

  function getKastInsight(v) {
    if (v >= 75) return { text: "Pro level — huge impact on every round", color: "text-emerald-400" }
    if (v >= 65) return { text: "Excellent, you contribute consistently to your team", color: "text-emerald-400" }
    if (v >= 55) return { text: "Good KAST, keep it up", color: "text-indigo-400" }
    if (v >= 45) return { text: "Average — you're sometimes invisible in rounds", color: "text-amber-400" }
    return { text: "Low impact — work on your survival and positioning", color: "text-rose-400" }
  }

  function getPistolInsight(v) {
    if (v >= 70) return { text: "Excellent pistol — you give your team a huge advantage", color: "text-emerald-400" }
    if (v >= 55) return { text: "Strong pistols, you often create an economic lead", color: "text-emerald-400" }
    if (v >= 45) return { text: "Decent, but pistols deserve more attention", color: "text-indigo-400" }
    if (v >= 30) return { text: "You lose too many pistols — work on your opening setups", color: "text-amber-400" }
    return { text: "Critical — pistols cost you half your rounds", color: "text-rose-400" }
  }

  function getDprInsight(v) {
    if (v >= 160) return { text: "Pro level — you're a real frag leader", color: "text-emerald-400" }
    if (v >= 140) return { text: "Excellent damage output, you carry your team", color: "text-emerald-400" }
    if (v >= 120) return { text: "Good damage level, above average", color: "text-indigo-400" }
    if (v >= 100) return { text: "Decent but improvable, get involved in more duels", color: "text-amber-400" }
    return { text: "Low — you don't deal enough damage for your team", color: "text-rose-400" }
  }

  function getEcoProfileInsight() {
    const eco = parseFloat(ecoKpr)
    const full = parseFloat(fullBuyKpr)
    if (fullBuyRounds < 5 || ecoRounds < 5) return { text: "Not enough data to analyze your economic profile", color: "text-slate-400" }
    if (full > eco * 2) return { text: "Opportunist profile — you excel with money, work on your eco clutches", color: "text-indigo-400" }
    if (eco >= full * 0.7) return { text: "Clutch profile — you do a lot with little, keep it up", color: "text-emerald-400" }
    if (full >= 0.8 && eco >= 0.3) return { text: "Balanced profile — you perform in all situations", color: "text-emerald-400" }
    if (full < 0.6) return { text: "Even on full buy you don't frag enough, review your gunfights", color: "text-rose-400" }
    return { text: "Standard profile, you follow the economic trend", color: "text-indigo-400" }
  }

  // ========== PREPARE DATA FOR CLIENT COMPONENT ==========
  const firstDuelInsight = getFirstDuelInsight(firstKillRate)
  const tradeInsight = getTradeInsight(tradeRate)
  const kastInsight = getKastInsight(kast)
  const pistolInsight = getPistolInsight(pistolWinrate)
  const dprInsight = getDprInsight(damagePerRound)
  const ecoInsight = getEcoProfileInsight()

  const metrics = [
    {
      key: "firstDuel",
      icon: "⚔️",
      shortTitle: "First Duel",
      title: "Your first duels",
      description: "% of first kills won when you're involved",
      value: firstKillRate,
      displayValue: `${firstKillRate}%`,
      subValue: `${firstKillsWon}W / ${firstKillsLost}L`,
      goodThreshold: 55,
      badThreshold: 40,
      showBar: true,
      maxValue: 100,
      unit: "%",
      insight: firstDuelInsight.text,
      insightColor: firstDuelInsight.color,
      extraContent: (
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
      )
    },
    {
      key: "trade",
      icon: "🤝",
      shortTitle: "Trade Rate",
      title: "Your traded deaths",
      description: "% of your deaths avenged by a teammate within 5s",
      value: tradeRate,
      displayValue: `${tradeRate}%`,
      subValue: `${deathsTraded}/${totalDeaths} traded`,
      goodThreshold: 50,
      badThreshold: 30,
      showBar: true,
      maxValue: 100,
      unit: "%",
      insight: tradeInsight.text,
      insightColor: tradeInsight.color,
      extraContent: (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 p-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">{deathsTraded}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Traded deaths</p>
          </div>
          <div className="bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/20 p-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-rose-400 tracking-tight">{totalDeaths - deathsTraded}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Untraded deaths</p>
          </div>
        </div>
      )
    },
    {
      key: "kast",
      icon: "⭐",
      shortTitle: "KAST",
      title: "Your round impact",
      description: "% of rounds where you contribute (Kill / Assist / Survive / Trade)",
      value: kast,
      displayValue: `${kast}%`,
      subValue: `${kastRounds}/${totalRounds} rounds`,
      goodThreshold: 65,
      badThreshold: 45,
      showBar: true,
      maxValue: 100,
      unit: "%",
      insight: kastInsight.text,
      insightColor: kastInsight.color,
      extraContent: (
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Average player</p>
            <p className="text-lg font-bold text-slate-300 mt-1">~60%</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Your KAST</p>
            <p className="text-lg font-bold text-indigo-400 mt-1">{kast}%</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Pro level</p>
            <p className="text-lg font-bold text-emerald-400 mt-1">75%+</p>
          </div>
        </div>
      )
    },
    {
      key: "pistol",
      icon: "🔫",
      shortTitle: "Pistol Rounds",
      title: "Your pistol impact",
      description: "Winrate on rounds 1 and 13 (start of each half)",
      value: pistolWinrate,
      displayValue: `${pistolWinrate}%`,
      subValue: `${pistolRoundsWon}W / ${pistolRoundsTotal - pistolRoundsWon}L`,
      goodThreshold: 55,
      badThreshold: 40,
      showBar: true,
      maxValue: 100,
      unit: "%",
      insight: pistolInsight.text,
      insightColor: pistolInsight.color,
      extraContent: (
        <div className="mt-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            💎 Pistol rounds determine the economy for the next 2-3 rounds. A pistol won = easy rounds rolling in. A pistol lost = forced eco for 2-3 rounds.
          </p>
        </div>
      )
    },
    {
      key: "dpr",
      icon: "💥",
      shortTitle: "Damage / Round",
      title: "Your damage per round",
      description: "Average damage dealt per round played",
      value: damagePerRound,
      displayValue: damagePerRound.toString(),
      subValue: "Avg DPR",
      goodThreshold: 140,
      badThreshold: 100,
      showBar: true,
      maxValue: 200,
      unit: "",
      insight: dprInsight.text,
      insightColor: dprInsight.color,
      extraContent: (
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Average player</p>
            <p className="text-lg font-bold text-slate-300 mt-1">~125</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Your DPR</p>
            <p className="text-lg font-bold text-indigo-400 mt-1">{damagePerRound}</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Pro level</p>
            <p className="text-lg font-bold text-emerald-400 mt-1">160+</p>
          </div>
        </div>
      )
    },
    {
      key: "eco",
      icon: "💰",
      shortTitle: "Eco vs Full",
      title: "Eco vs Full buy",
      description: "Your performance based on your team's economy",
      value: parseFloat(fullBuyKpr) * 50,
      displayValue: `${ecoKpr} / ${fullBuyKpr}`,
      subValue: "Kills per round",
      goodThreshold: 100,
      badThreshold: 30,
      showBar: false,
      insight: ecoInsight.text,
      insightColor: ecoInsight.color,
      extraContent: (
        <>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-5">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">🪙 Eco rounds</p>
              <p className="text-3xl font-bold text-white tracking-tight">{ecoKpr}</p>
              <p className="text-xs text-slate-400 mt-1">Kills / round</p>
              <p className="text-xs text-slate-500 mt-3">{ecoRounds} rounds played</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-2xl p-5">
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">💎 Full buy</p>
              <p className="text-3xl font-bold text-white tracking-tight">{fullBuyKpr}</p>
              <p className="text-xs text-slate-400 mt-1">Kills / round</p>
              <p className="text-xs text-slate-500 mt-3">{fullBuyRounds} rounds played</p>
            </div>
          </div>
          <div className="mt-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              💎 Eco = less than 2000 in equipment (pistol only). Full buy = more than 3500 (rifle + armor).
            </p>
          </div>
        </>
      )
    }
  ]

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <Link href={`/player/${name}/${tag}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition group">
          <span className="group-hover:-translate-x-0.5 transition">←</span>
          <span>Back to dashboard</span>
        </Link>
        <h1 className="text-3xl font-bold mt-2">{account.name}'s Advanced Stats</h1>
        <p className="text-slate-400 text-sm">Detailed analysis based on your last {matches.length} games</p>
      </div>

      {/* SUB-NAVIGATION */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <a href={`/player/${name}/${tag}`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Dashboard</a>
        <a href={`/player/${name}/${tag}/coach`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Coach</a>
        <a href={`/player/${name}/${tag}/maps`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Maps</a>
        <a href={`/player/${name}/${tag}/agents`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Agents</a>
        <a href={`/player/${name}/${tag}/advanced`} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-lg border border-slate-700 shadow-sm whitespace-nowrap">Advanced Stats</a>
        <a href={`/player/${name}/${tag}/history`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">History</a>
      </div>

      {/* CLIENT COMPONENT FOR DISPLAY */}
      <AdvancedView metrics={metrics} />

    </div>
  )
}