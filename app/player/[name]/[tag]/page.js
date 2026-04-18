export default async function PlayerPage({ params }) {
  const { name, tag } = await params
  const apiKey = process.env.HENRIK_API_KEY

  // 1. Récupérer le compte
  const accountRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`,
    { headers: { Authorization: apiKey } }
  )
  const accountData = await accountRes.json()

  if (!accountData.data) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-bold text-rose-400">Player not found</h1>
        <p className="text-slate-400 mt-2">Check the Riot ID and try again</p>
      </div>
    )
  }

  const account = accountData.data

  // 2. Récupérer le rang
  const mmrRes = await fetch(
    `https://api.henrikdev.xyz/valorant/v2/mmr/eu/${name}/${tag}`,
    { headers: { Authorization: apiKey } }
  )
  const mmrData = await mmrRes.json()
  const mmr = mmrData.data?.current_data

  function getRankColor(tier) {
    if (tier >= 21) return "text-green-400"
    if (tier >= 18) return "text-blue-400"
    if (tier >= 15) return "text-purple-400"
    if (tier >= 12) return "text-yellow-400"
    return "text-slate-400"
  }

  return (
    <div className="space-y-8">

      {/* JOUEUR */}
      <div className="flex items-center gap-6">
        <img
          src={account.card.small}
          className="rounded-xl w-16 h-16 object-cover border border-slate-700"
        />
        <div>
          <h1 className="text-4xl font-bold">{account.name}</h1>
          <p className="text-slate-400">#{account.tag} · Niveau {account.account_level}</p>
        </div>
      </div>

      {/* RANG */}
      {mmr && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <p className="text-slate-400 text-sm mb-3">Rang actuel</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={mmr.images.large} className="w-16 h-16" />
              <div>
                <p className={`text-2xl font-bold ${getRankColor(mmr.currenttier)}`}>
                  {mmr.currenttierpatched}
                </p>
                <p className="text-slate-400">{mmr.ranking_in_tier} RR</p>
              </div>
            </div>
            <div className={`text-lg font-bold ${mmr.mmr_change_to_last_game >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {mmr.mmr_change_to_last_game >= 0 ? "+" : ""}{mmr.mmr_change_to_last_game} RR
            </div>
          </div>
        </div>
      )}

    </div>
  )
}