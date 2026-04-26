import Link from "next/link"

export default function PlayerNotFound() {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-3">We couldn't load this player</h1>
        <p className="text-slate-400 leading-relaxed mb-6">
          This usually means one of two things:
        </p>

        <div className="space-y-3 text-left mb-6">
          <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
            <p className="text-sm font-semibold text-white mb-1">🎮 Wrong Riot ID</p>
            <p className="text-xs text-slate-400">
              Double-check the format: Name#TAG (e.g. Sparni#EUW). Tags are case-sensitive.
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4">
            <p className="text-sm font-semibold text-white mb-1">⚡ API temporarily unavailable</p>
            <p className="text-xs text-slate-400">
              The Valorant data API can be busy. Wait a few seconds and try again.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#FF4654] hover:bg-[#ff5a66] transition px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#FF4654]/20 hover:shadow-[#FF4654]/40 text-white"
        >
          <span>Back to search</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  )
}