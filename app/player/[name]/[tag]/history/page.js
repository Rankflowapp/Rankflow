import PlayerNotFound from "../../../../components/PlayerNotFound"
import Link from "next/link"
import HistoryView from "./HistoryView"

export default async function HistoryPage({ params }) {
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

  // Get matches
  const matchesRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v4/matches/eu/pc/${name}/${tag}?mode=competitive&size=20`,
    { headers: { Authorization: apiKey } }
  )
  const matchesData = await matchesRes.json()

  // Get MMR history for RR per match
  const historyRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v1/mmr-history/eu/${name}/${tag}`,
    { headers: { Authorization: apiKey } }
  )
  const historyData = await historyRes.json()
  const mmrHistory = historyData.data || []

  const matches = matchesData.data?.map(match => {
    const me = match.players?.find(p => p.puuid === account.puuid)
    const myTeam = me?.team_id
    const won = match.teams?.find(t => t.team_id === myTeam)?.won
    const myTeamData = match.teams?.find(t => t.team_id === myTeam)
    const enemyTeamData = match.teams?.find(t => t.team_id !== myTeam)
    const matchId = match.metadata?.match_id

    // Find the RR corresponding to this match in MMR history
    const mmrEntry = mmrHistory.find(h => h.match_id === matchId)
    const rrChange = mmrEntry ? mmrEntry.mmr_change_to_last_game : null

    return {
      map: match.metadata?.map?.name || "Unknown",
      result: won ? "Win" : "Loss",
      kills: me?.stats?.kills || 0,
      deaths: me?.stats?.deaths || 0,
      assists: me?.stats?.assists || 0,
      agent: me?.agent?.name || "Unknown",
      agentIcon: me?.agent?.small || null,
      score: `${myTeamData?.rounds?.won || 0} - ${enemyTeamData?.rounds?.won || 0}`,
      rrChange,
    }
  }) || []

  // Calculate total session RR
  const totalRr = matches.reduce((sum, m) => sum + (m.rrChange || 0), 0)

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <Link href={`/player/${name}/${tag}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition group">
          <span className="group-hover:-translate-x-0.5 transition">←</span>
          <span>Back to dashboard</span>
        </Link>
        <h1 className="text-3xl font-bold mt-2">{account.name}'s History</h1>
        <p className="text-slate-400 text-sm">Last {matches.length} competitive matches</p>
      </div>

      {/* SUB-NAVIGATION */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <a href={`/player/${name}/${tag}`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Dashboard</a>
        <a href={`/player/${name}/${tag}/coach`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Coach</a>
        <a href={`/player/${name}/${tag}/maps`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Maps</a>
        <a href={`/player/${name}/${tag}/agents`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Agents</a>
        <a href={`/player/${name}/${tag}/advanced`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition whitespace-nowrap">Advanced Stats</a>
        <a href={`/player/${name}/${tag}/history`} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-lg border border-slate-700 shadow-sm whitespace-nowrap">History</a>
      </div>

      {/* CLIENT COMPONENT */}
      <HistoryView matches={matches} totalRr={totalRr} />

    </div>
  )
}