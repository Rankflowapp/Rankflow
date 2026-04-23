import Link from "next/link"

export default async function AgentDetailPage({ params }) {
  const { name, tag, agentName } = await params
  const apiKey = process.env.HENRIK_API_KEY

  const decodedAgentName = decodeURIComponent(agentName)

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

  const matchesRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v4/matches/eu/pc/${name}/${tag}?mode=competitive&size=20`,
    { headers: { Authorization: apiKey } }
  )
  const matchesData = await matchesRes.json()

  // Filter only matches with this agent
  const matches = matchesData.data?.map(match => {
    const me = match.players?.find(p => p.puuid === account.puuid)
    const myTeam = me?.team_id
    const won = match.teams?.find(t => t.team_id === myTeam)?.won
    const myTeamData = match.teams?.find(t => t.team_id === myTeam)
    const enemyTeamData = match.teams?.find(t => t.team_id !== myTeam)
    return {
      map: match.metadata?.map?.name || "Unknown",
      result: won ? "Win" : "Loss",
      kills: me?.stats?.kills || 0,
      deaths: me?.stats?.deaths || 0,
      assists: me?.stats?.assists || 0,
      agent: me?.agent?.name || "Unknown",
      agentIcon: me?.agent?.small || null,
      agentIconLarge: me?.agent?.large || null,
      score: `${myTeamData?.rounds?.won || 0} - ${enemyTeamData?.rounds?.won || 0}`,
    }
  }).filter(m => m.agent === decodedAgentName) || []

  const wins = matches.filter(m => m.result === "Win").length
  const losses = matches.filter(m => m.result === "Loss").length
  const winrate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0

  // Average KDA
  const totalKills = matches.reduce((sum, m) => sum + m.kills, 0)
  const totalDeaths = matches.reduce((sum, m) => sum + m.deaths, 0)
  const totalAssists = matches.reduce((sum, m) => sum + m.assists, 0)
  const avgKills = matches.length > 0 ? (totalKills / matches.length).toFixed(1) : 0
  const avgDeaths = matches.length > 0 ? (totalDeaths / matches.length).toFixed(1) : 0
  const avgAssists = matches.length > 0 ? (totalAssists / matches.length).toFixed(1) : 0

  // Stats per map with this agent
  const mapStats = {}
  matches.forEach(match => {
    if (!mapStats[match.map]) mapStats[match.map] = { wins: 0, total: 0 }
    mapStats[match.map].total++
    if (match.result === "Win") mapStats[match.map].wins++
  })

  const mapList = Object.entries(mapStats)
    .map(([map, stats]) => ({
      map,
      wr: Math.round((stats.wins / stats.total) * 100),
      total: stats.total,
      wins: stats.wins,
    }))
    .sort((a, b) => b.total - a.total)

  const agentIcon = matches[0]?.agentIconLarge || matches[0]?.agentIcon

  function getWrColor(wr) {
    if (wr >= 60) return "text-emerald-400"
    if (wr >= 45) return "text-indigo-400"
    return "text-rose-400"
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <Link href={`/player/${name}/${tag}/agents`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition group">
          <span className="group-hover:-translate-x-0.5 transition">←</span>
          <span>Back to agents</span>
        </Link>
        <div className="flex items-center gap-4 mt-3">
          {agentIcon && (
            <img src={agentIcon} className="w-16 h-16 rounded-xl" />
          )}
          <div>
            <h1 className="text-4xl font-bold">{decodedAgentName}</h1>
            <p className="text-slate-400 text-sm">{matches.length} games analyzed</p>
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <p className="text-slate-400">No matches found with this agent in your last 20 games.</p>
        </div>
      ) : (
        <>
          {/* GLOBAL STATS */}
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
              <p className={`text-3xl font-bold tracking-tight ${getWrColor(winrate)}`}>{winrate}%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Winrate</p>
            </div>
          </div>

          {/* AVERAGE KDA */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <p className="text-sm text-indigo-300 mb-4">📊 Average KDA on {decodedAgentName}</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 p-4 rounded-2xl text-center">
                <p className="text-2xl font-bold text-emerald-400 tracking-tight">{avgKills}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Kills / game</p>
              </div>
              <div className="bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/20 p-4 rounded-2xl text-center">
                <p className="text-2xl font-bold text-rose-400 tracking-tight">{avgDeaths}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Deaths / game</p>
              </div>
              <div className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 p-4 rounded-2xl text-center">
                <p className="text-2xl font-bold text-indigo-400 tracking-tight">{avgAssists}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Assists / game</p>
              </div>
            </div>
          </div>

          {/* MAPS PLAYED WITH THIS AGENT */}
          {mapList.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <p className="text-sm text-indigo-300 mb-4">🗺️ Maps played with {decodedAgentName}</p>
              <div className="space-y-3">
                {mapList.map((map) => (
                  <div key={map.map} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                    <div>
                      <p className="font-semibold">{map.map}</p>
                      <p className="text-xs text-slate-500">{map.wins}W / {map.total - map.wins}L</p>
                    </div>
                    <p className={`text-xl font-bold ${getWrColor(map.wr)}`}>{map.wr}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECENT MATCHES WITH THIS AGENT */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <p className="text-sm text-indigo-300 mb-4">📜 Recent matches with {decodedAgentName}</p>
            <div className="space-y-3">
              {matches.map((match, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    match.result === "Win"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-rose-500/30 bg-rose-500/5"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                        match.result === "Win"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}>
                        {match.result}
                      </span>
                      <span className="text-sm text-slate-300">{match.map}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Score: {match.score}</p>
                  </div>
                  <p className="font-mono text-sm text-slate-200">
                    {match.kills}/{match.deaths}/{match.assists}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  )
}