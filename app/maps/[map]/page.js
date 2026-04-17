import { mapsData } from "../../../data/mapsData"

export default async function MapDetailPage({ params }) {
  const resolvedParams = await params
  const mapSlug = resolvedParams.map

  const data = mapsData.find(m => m.slug === mapSlug)

  if (!data) {
    return <div className="p-10 text-white">Map not found</div>
  }

  // 🎯 SCORE
  const score = Math.round((data.wr + data.atk + data.def) / 3)

  // 🔥 INSIGHTS
  function getInsights(data) {
    let insights = []

    if (data.wr < 45) {
      insights.push("Weak overall performance")
    }

    if (data.eco < 40) {
      insights.push("Eco rounds need improvement")
    }

    if (data.entryDiff < 0) {
      insights.push("Too many early deaths")
    }

    if (data.wr > 65) {
      insights.push("Strong map — play more")
    }

    return insights
  }

  const insights = getInsights(data)

  // 🧠 WHY
  function getWhy(data) {
    let reasons = []

    data.zones.forEach((zone) => {
      if (zone.win > 65) {
        reasons.push(`Strong performance on ${zone.name} due to high win rate`)
      }

      if (zone.deaths > 60) {
        reasons.push(`You die too often on ${zone.name}`)
      }
    })

    if (data.entryDiff < 0) {
      reasons.push("You often lose early duels")
    }

    if (data.eco < 40) {
      reasons.push("Poor eco round performance affects your games")
    }

    return reasons
  }

  const reasons = getWhy(data)

  // 🎯 ACTIONS
  function getActions(data) {
    let actions = []

    data.zones.forEach((zone) => {
      if (zone.win < 50 && zone.deaths > 60) {
        actions.push(`Avoid ${zone.name} — play safer or rotate`)
      }

      if (zone.win > 65) {
        actions.push(`Prioritize ${zone.name} — strong win rate`)
      }
    })

    if (data.entryDiff < 0) {
      actions.push("Stop taking early duels — play second entry")
    }

    if (data.eco < 40) {
      actions.push("Play eco rounds slower and group with team")
    }

    return actions
  }

  const actions = getActions(data)

  return (
    <div className="space-y-10">

      {/* NAV */}
      <a href="/maps" className="text-indigo-400">
        ← Back to Maps
      </a>

      {/* HEADER */}
      <div>
        <h1 className="text-5xl font-bold">{data.name}</h1>
        <p className="text-slate-400 mt-2">
          Win Rate: {data.wr}%
        </p>
      </div>

      {/* SCORE */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <p className="text-slate-400">Map Score</p>
        <p className="text-4xl font-bold text-emerald-300">
          {score}/100
        </p>
      </div>

      {/* INSIGHTS */}
      <div className="space-y-3">
        {insights.map((i, idx) => (
          <div
            key={idx}
            className="bg-indigo-500/10 border border-indigo-400/30 p-4 rounded-2xl"
          >
            {i}
          </div>
        ))}
      </div>

      {/* 🧠 WHY */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <h2 className="text-xl font-semibold mb-4">
          Why you perform like this
        </h2>

        <div className="space-y-2 text-slate-300">
          {reasons.map((r, idx) => (
            <div key={idx}>
              • {r}
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 ACTIONS */}
      <div className="bg-emerald-500/10 border border-emerald-400/30 p-6 rounded-3xl">
        <h2 className="text-xl font-semibold mb-4 text-emerald-300">
          What you should do
        </h2>

        <div className="space-y-2 text-slate-200">
          {actions.map((a, idx) => (
            <div key={idx}>
              • {a}
            </div>
          ))}
        </div>
      </div>

      {/* CORE STATS */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-6 rounded-2xl">
          ATK: {data.atk}%
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl">
          DEF: {data.def}%
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl">
          ECO: {data.eco}%
        </div>
      </div>

      {/* 🔫 PISTOL */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900 p-6 rounded-2xl">
          Attack Pistol: {data.pistol.attack}%
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl">
          Defense Pistol: {data.pistol.defense}%
        </div>
      </div>

      {/* 🎯 AGENTS */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <h2 className="text-xl font-semibold mb-4">
          Best Agents
        </h2>

        <div className="space-y-2">
          {data.agents.map((agent) => (
            <div key={agent.name}>
              {agent.name} — {agent.wr}%
            </div>
          ))}
        </div>
      </div>

      {/* 📍 ZONES */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <h2 className="text-xl font-semibold mb-4">
          Zone Performance
        </h2>

        <div className="space-y-2">
          {data.zones.map((zone) => (
            <div key={zone.name}>
              {zone.name} — Win: {zone.win}% — Death: {zone.deaths}%
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}