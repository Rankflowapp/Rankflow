import Link from "next/link"

export default async function HistoryPage({ params }) {
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
      startedAt: match.metadata?.started_at || null,
    }
  }) || []

  return (
    <div className="space-y-6">

      <div>
        <Link href={`/player/${name}/${tag}`} className="text-sm text-indigo-400 hover:text-indigo-300 transition">
          ← Retour au dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-2">Historique de {account.name}</h1>
        <p className="text-slate-400 text-sm">{matches.length} derniers matchs compétitifs</p>
      </div>

{/* SOUS-NAVIGATION */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <a href={`/player/${name}/${tag}`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition">
          Dashboard
        </a>
        <a href={`/player/${name}/${tag}/coach`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition">
          Coach
        </a>
        <a href={`/player/${name}/${tag}/history`} className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg">
          Historique
        </a>
      </div>

      <div className="space-y-3">
        {matches.map((match, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-4 rounded-xl border ${
              match.result === "Win"
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-rose-500/30 bg-rose-500/5"
            }`}
          >
            <div className="flex items-center gap-4">
              {match.agentIcon && (
                <img src={match.agentIcon} className="w-10 h-10 rounded-lg" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-xs px-2 py-0.5 rounded ${
                      match.result === "Win"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {match.result}
                  </span>
                  <span className="text-white font-semibold">{match.map}</span>
                  <span className="text-slate-400 text-sm">· {match.agent}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Score: {match.score}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-slate-200 font-mono text-lg">
                {match.kills}<span className="text-slate-500">/</span>{match.deaths}<span className="text-slate-500">/</span>{match.assists}
              </p>
              <p className="text-xs text-slate-500">K / D / A</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}