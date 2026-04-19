import Link from "next/link"

export default async function AgentsPage({ params }) {
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
      agent: me?.agent?.name || "Unknown",
      agentIcon: me?.agent?.small || null,
      result: won ? "Win" : "Loss",
    }
  }) || []

  // Stats par agent
  const agentStats = {}
  matches.forEach(match => {
    if (!agentStats[match.agent]) {
      agentStats[match.agent] = { wins: 0, total: 0, icon: match.agentIcon }
    }
    agentStats[match.agent].total++
    if (match.result === "Win") agentStats[match.agent].wins++
  })

  const agentList = Object.entries(agentStats).map(([agent, stats]) => ({
    agent,
    wr: Math.round((stats.wins / stats.total) * 100),
    wins: stats.wins,
    losses: stats.total - stats.wins,
    total: stats.total,
    icon: stats.icon
  })).sort((a, b) => b.wr - a.wr)

  function getWrColor(wr) {
    if (wr >= 60) return "text-emerald-400"
    if (wr >= 45) return "text-indigo-400"
    return "text-rose-400"
  }

  function getWrBorder(wr) {
    if (wr >= 60) return "border-emerald-500/30 hover:border-emerald-500/60"
    if (wr >= 45) return "border-slate-700 hover:border-indigo-500/60"
    return "border-rose-500/30 hover:border-rose-500/60"
  }

  return (
    <div className="space-y-6">

      {/* EN-TÊTE */}
      <div>
        <Link href={`/player/${name}/${tag}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition group">
          <span className="group-hover:-translate-x-0.5 transition">←</span>
          <span>Retour au dashboard</span>
        </Link>
        <h1 className="text-3xl font-bold mt-2">Agents de {account.name}</h1>
        <p className="text-slate-400 text-sm">Tes stats sur les {matches.length} derniers matchs</p>
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
        <a href={`/player/${name}/${tag}/agents`} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-lg border border-slate-700 shadow-sm">
          Agents
        </a>
        <a href={`/player/${name}/${tag}/history`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">
          Historique
        </a>
      </div>

      {/* LISTE DES AGENTS */}
      <div className="space-y-3">
        {agentList.map((agent) => (
          <Link
            key={agent.agent}
            href={`/player/${name}/${tag}/agent/${agent.agent}`}
            className={`block bg-slate-900 border rounded-2xl p-5 card-interactive ${getWrBorder(agent.wr)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {agent.icon && (
                  <img src={agent.icon} className="w-12 h-12 rounded-lg" />
                )}
                <div>
                  <p className="text-xl font-bold">{agent.agent}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {agent.wins}W · {agent.losses}L · {agent.total} matchs
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-3xl font-bold ${getWrColor(agent.wr)}`}>
                  {agent.wr}%
                </p>
                <p className="text-xs text-slate-500">winrate</p>
              </div>
            </div>
          </Link>
        ))}

        {agentList.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Aucun match trouvé
          </div>
        )}
      </div>

    </div>
  )
}