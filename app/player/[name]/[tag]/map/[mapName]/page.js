import PlayerNotFound from "../../../../components/PlayerNotFound"
import Link from "next/link"

export default async function MapDetailPage({ params }) {
  const { name, tag, mapName } = await params
  const apiKey = process.env.HENRIK_API_KEY

  const decodedMapName = decodeURIComponent(mapName)

  const accountRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`,
    { headers: { Authorization: apiKey } }
  )
  const accountData = await accountRes.json()

  if (!accountData.data) {
    return <PlayerNotFound />
  }

  const account = accountData.data

  const matchesRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v4/matches/eu/pc/${name}/${tag}?mode=competitive&size=20`,
    { headers: { Authorization: apiKey } }
  )
  const matchesData = await matchesRes.json()

  // Filter only matches on this map
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
      score: `${myTeamData?.rounds?.won || 0} - ${enemyTeamData?.rounds?.won || 0}`,
    }
  }).filter(m => m.map === decodedMapName) || []

  const wins = matches.filter(m => m.result === "Win").length
  const losses = matches.filter(m => m.result === "Loss").length
  const winrate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0

  // Stats per agent on this map
  const agentStats = {}
  matches.forEach(match => {
    if (!agentStats[match.agent]) agentStats[match.agent] = { wins: 0, total: 0, icon: match.agentIcon }
    agentStats[match.agent].total++
    if (match.result === "Win") agentStats[match.agent].wins++
  })

  const agentList = Object.entries(agentStats)
    .map(([agent, stats]) => ({
      agent,
      wr: Math.round((stats.wins / stats.total) * 100),
      total: stats.total,
      wins: stats.wins,
      icon: stats.icon
    }))
    .sort((a, b) => b.total - a.total)

  function getWrColor(wr) {
    if (wr >= 60) return "text-emerald-400"
    if (wr >= 45) return "text-indigo-400"
    return "text-rose-400"
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <Link href={`/player/${name}/${tag}/maps`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition group">
          <span className="group-hover:-translate-x-0.5 transition">←</span>
          <span>Back to maps</span>
        </Link>
        <h1 className="text-4xl font-bold mt-2">{decodedMapName}</h1>
        <p className="text-slate-400 text-sm">{matches.length} games analyzed</p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <p className="text-slate-400">No matches found on this map in your last 20 games.</p>
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

          {/* AGENTS PLAYED ON THIS MAP */}
          {agentList.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <p className="text-sm text-indigo-300 mb-4">🎯 Agents played on {decodedMapName}</p>
              <div className="space-y-3">
                {agentList.map((agent) => (
                  <div key={agent.agent} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      {agent.icon && (
                        <img src={agent.icon} className="w-10 h-10 rounded-lg" />
                      )}
                      <div>
                        <p className="font-semibold">{agent.agent}</p>
                        <p className="text-xs text-slate-500">{agent.wins}W / {agent.total - agent.wins}L</p>
                      </div>
                    </div>
                    <p className={`text-xl font-bold ${getWrColor(agent.wr)}`}>{agent.wr}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECENT MATCHES ON THIS MAP */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <p className="text-sm text-indigo-300 mb-4">📜 Recent matches on {decodedMapName}</p>
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
                  <div className="flex items-center gap-3">
                    {match.agentIcon && (
                      <img src={match.agentIcon} className="w-8 h-8 rounded-lg" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                          match.result === "Win"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}>
                          {match.result}
                        </span>
                        <span className="text-sm text-slate-300">{match.agent}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Score: {match.score}</p>
                    </div>
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