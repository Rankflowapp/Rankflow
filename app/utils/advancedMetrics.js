// Advanced metrics calculation functions
// Reusable across all pages (Coach, Advanced, etc.)

const TRADE_WINDOW_MS = 5000

// ========== FIRST DUEL RATE ==========
export function calculateFirstDuelRate(matches, myPuuid) {
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

  const rate = totalFirstDuels > 0 ? Math.round((firstKillsWon / totalFirstDuels) * 100) : 0
  return { rate, firstKillsWon, firstKillsLost, totalFirstDuels }
}

// ========== TRADE RATE ==========
export function calculateTradeRate(matches, myPuuid) {
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

  const rate = totalDeaths > 0 ? Math.round((deathsTraded / totalDeaths) * 100) : 0
  return { rate, deathsTraded, totalDeaths }
}

// ========== KAST ==========
export function calculateKast(matches, myPuuid) {
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

  const rate = totalRounds > 0 ? Math.round((kastRounds / totalRounds) * 100) : 0
  return { rate, kastRounds, totalRounds }
}

// ========== PISTOL ROUNDS ==========
export function calculatePistolWinrate(matches, myPuuid) {
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

  const rate = pistolRoundsTotal > 0 ? Math.round((pistolRoundsWon / pistolRoundsTotal) * 100) : 0
  return { rate, pistolRoundsWon, pistolRoundsTotal }
}

// ========== DAMAGE PER ROUND ==========
export function calculateDpr(matches, myPuuid) {
  let totalDamageDealt = 0
  let totalRoundsPlayed = 0

  matches.forEach(match => {
    const myPlayer = match.players?.find(p => p.puuid === myPuuid)
    const damage = myPlayer?.stats?.damage?.dealt || 0
    const roundsInMatch = match.rounds?.length || 0
    totalDamageDealt += damage
    totalRoundsPlayed += roundsInMatch
  })

  const dpr = totalRoundsPlayed > 0 ? Math.round(totalDamageDealt / totalRoundsPlayed) : 0
  return { dpr, totalDamageDealt, totalRoundsPlayed }
}

// ========== ECO VS FULL BUY ==========
export function calculateEcoVsFullBuy(matches, myPuuid) {
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

  const ecoKpr = ecoRounds > 0 ? parseFloat((ecoKills / ecoRounds).toFixed(2)) : 0
  const fullBuyKpr = fullBuyRounds > 0 ? parseFloat((fullBuyKills / fullBuyRounds).toFixed(2)) : 0
  return { ecoKpr, fullBuyKpr, ecoRounds, fullBuyRounds }
}

// ========== PERSONALIZED TIPS GENERATION ==========
export function generatePersonalizedTips(metrics) {
  const tips = []

  // First Duel Rate
  if (metrics.firstDuel.totalFirstDuels >= 5) {
    if (metrics.firstDuel.rate < 35) {
      tips.push({
        icon: "⚔️",
        priority: "high",
        title: "Improve your first duels",
        advice: "Before each session, spend 10 minutes in the Range. Use moving bots at medium-long range to warm up your aim, then work on crosshair placement at head height.",
        stat: `${metrics.firstDuel.rate}% first duel rate`
      })
    } else if (metrics.firstDuel.rate < 45) {
      tips.push({
        icon: "⚔️",
        priority: "medium",
        title: "Sharpen your first duels",
        advice: "Get in the habit of clearing close angles before engaging. Avoid peeks without prior info from your team or your utility.",
        stat: `${metrics.firstDuel.rate}% first duel rate`
      })
    }
  }

  // Trade Rate
  if (metrics.trade.totalDeaths >= 10) {
    if (metrics.trade.rate < 30) {
      tips.push({
        icon: "🤝",
        priority: "high",
        title: "Get closer to your team",
        advice: "You're dying too isolated. Stay within your teammates' line of sight, peek together rather than solo. Stick with your duelist as an initiator or controller.",
        stat: `${metrics.trade.rate}% trade rate`
      })
    } else if (metrics.trade.rate < 45) {
      tips.push({
        icon: "🤝",
        priority: "medium",
        title: "Improve your positioning",
        advice: "Try to play in pairs with a nearby teammate. Trades are the foundation of team play — always make sure someone can avenge your death.",
        stat: `${metrics.trade.rate}% trade rate`
      })
    }
  }

  // KAST
  if (metrics.kast.totalRounds >= 20) {
    if (metrics.kast.rate < 55) {
      tips.push({
        icon: "⭐",
        priority: "high",
        title: "Boost your round impact",
        advice: "Even without a frag, contribute with utility or info. Never be invisible in a round — use your abilities early to gather info or support your team's execution.",
        stat: `${metrics.kast.rate}% KAST`
      })
    }
  }

  // Pistol Rounds
  if (metrics.pistol.pistolRoundsTotal >= 4) {
    if (metrics.pistol.rate < 40) {
      tips.push({
        icon: "🔫",
        priority: "high",
        title: "Work on your pistols",
        advice: "Watch pistol setups on YouTube for your main maps. Communicate with your team before round 1 to plan a default strat and stack a site together.",
        stat: `${metrics.pistol.rate}% pistol winrate`
      })
    }
  }

  // Damage per Round
  if (metrics.dpr.totalRoundsPlayed >= 20) {
    if (metrics.dpr.dpr < 100) {
      tips.push({
        icon: "💥",
        priority: "high",
        title: "Get more involved in duels",
        advice: "Your damage output is low. Don't play passively — look for engagement opportunities or support your teammates' duels with your fire.",
        stat: `${metrics.dpr.dpr} damage/round`
      })
    }
  }

  // Eco performance
  if (metrics.eco.fullBuyRounds >= 10 && metrics.eco.fullBuyKpr < 0.6) {
    tips.push({
      icon: "💰",
      priority: "high",
      title: "Capitalize on your full buys",
      advice: "Even with the best gear, your buy rounds don't pay off. Review your gunfights: aim precision, peek timing, positioning. Try the Range to warm up your aim before ranked.",
      stat: `${metrics.eco.fullBuyKpr} kills/round on full buy`
    })
  }

  // Sort by priority and limit to 4 tips max
  const sorted = tips.sort((a, b) => (a.priority === "high" ? -1 : 1))
  return sorted.slice(0, 4)
}