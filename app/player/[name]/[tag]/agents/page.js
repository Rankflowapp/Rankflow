import Link from "next/link"
import { getAgentImage } from "../../../../agentImages"

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
  }))

  const bestAgents = agentList.filter(a => a.wr > 55).sort((a, b) => b.wr - a.wr)
  const masteredAgents = agentList.filter(a => a.wr >= 45 && a.wr <= 55).sort((a, b) => b.wr - a.wr)
  const worstAgents = agentList.filter(a => a.wr < 45).sort((a, b) => a.wr - b.wr)

  function AgentCard({ agentData, borderColor, wrColor }) {
    const agentImage = getAgentImage(agentData.agent) || agentData.icon

    return (
      <Link
        href={`/player/${name}/${tag}/agent/${agentData.agent}`}
        className={`group block bg-slate-900 border rounded-2xl p-4 card-interactive ${borderColor}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {agentImage && (
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                <img
                  src={agentImage}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  alt={agentData.agent}
                />
              </div>
            )}
            <div>
              <p className="font-bold text-lg">{agentData.agent}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {agentData.wins}W · {agentData.losses}L
              </p>
            </div>
          </div>
          <p className={`text-2xl font-bold ${wrColor}`}>
            {agentData.wr}%
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-indigo-400 transition">
          <span>Voir détails</span>
          <span className="group-hover:translate-x-0.5 transition">→</span>
        </div>
      </Link>
    )
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
        <a href={`/player/${name}/${tag}`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Dashboard</a>
        <a href={`/player/${name}/${tag}/coach`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Coach</a>
        <a href={`/player/${name}/${tag}/maps`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Maps</a>
        <a href={`/player/${name}/${tag}/agents`} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-lg border border-slate-700 shadow-sm whitespace-nowrap">Agents</a>
        <a href={`/player/${name}/${tag}/advanced`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Stats avancées</a>
        <a href={`/player/${name}/${tag}/history`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Historique</a>
      </div>

      {/* 3 COLONNES */}
      {agentList.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Aucun match trouvé
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">

          {/* MEILLEURS AGENTS */}
          <div className="bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔥</span>
              <div>
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">À privilégier</p>
                <p className="text-base text-white font-semibold">Meilleurs agents</p>
              </div>
            </div>

            <div className="space-y-3">
              {bestAgents.length > 0 ? (
                bestAgents.map(a => (
                  <AgentCard
                    key={a.agent}
                    agentData={a}
                    borderColor="border-emerald-500/30 hover:border-emerald-500/60"
                    wrColor="text-emerald-400"
                  />
                ))
              ) : (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-sm text-slate-500">Aucun agent avec &gt;55% de WR</p>
                </div>
              )}
            </div>
          </div>

          {/* AGENTS MAÎTRISÉS */}
          <div className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/30 rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚖️</span>
              <div>
                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">À consolider</p>
                <p className="text-base text-white font-semibold">Agents maîtrisés</p>
              </div>
            </div>

            <div className="space-y-3">
              {masteredAgents.length > 0 ? (
                masteredAgents.map(a => (
                  <AgentCard
                    key={a.agent}
                    agentData={a}
                    borderColor="border-slate-700 hover:border-indigo-500/60"
                    wrColor="text-indigo-400"
                  />
                ))
              ) : (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-sm text-slate-500">Aucun agent entre 45% et 55%</p>
                </div>
              )}
            </div>
          </div>

          {/* PIRES AGENTS */}
          <div className="bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/30 rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <p className="text-rose-400 text-xs font-semibold uppercase tracking-wider">À éviter</p>
                <p className="text-base text-white font-semibold">Pires agents</p>
              </div>
            </div>

            <div className="space-y-3">
              {worstAgents.length > 0 ? (
                worstAgents.map(a => (
                  <AgentCard
                    key={a.agent}
                    agentData={a}
                    borderColor="border-rose-500/30 hover:border-rose-500/60"
                    wrColor="text-rose-400"
                  />
                ))
              ) : (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-sm text-slate-500">Aucun agent avec &lt;45% de WR</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}