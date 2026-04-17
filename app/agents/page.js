export default function AgentsPage() {
  const agents = [
    ['Jett', '42', '64%', 'Ascent · Split', 'Sova', '+22', 'text-emerald-300'],
    ['Omen', '35', '41%', 'Ascent', 'Killjoy', '-8', 'text-amber-300'],
    ['Raze', '28', '61%', 'Bind · Split', 'Breach', '+16', 'text-emerald-300'],
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_35%)]" />

      <main className="relative max-w-7xl mx-auto px-6 py-12 space-y-8">
        

        <div>
          <h1 className="text-4xl font-bold">All Agents</h1>
        </div>

        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-6 py-4 text-xs text-slate-400 border-b border-slate-800">
            <span>Agent</span>
            <span>Games</span>
            <span>WR</span>
            <span>Best Maps</span>
            <span>Best Duo</span>
            <span>RR Avg</span>
          </div>

          {agents.map(([agent, games, wr, maps, duo, rr, color]) => (
            <div key={agent} className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-slate-800">
              <span>{agent}</span>
              <span>{games}</span>
              <span className={color}>{wr}</span>
              <span>{maps}</span>
              <span>{duo}</span>
              <span>{rr}</span>
            </div>
          ))}
        </section>

      </main>
    </div>
  )
}