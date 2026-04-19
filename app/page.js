"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [riotId, setRiotId] = useState("")
  const router = useRouter()

  function handleSearch(e) {
    e.preventDefault()
    if (!riotId.includes("#")) return
    const [name, tag] = riotId.split("#")
    router.push(`/player/${name}/${tag}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">

      <div className="text-center">
        <h1 className="text-5xl font-bold mb-3">Rankflow</h1>
        <p className="text-slate-400 text-lg">
          Your pre-game decision tool for climbing in Valorant
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 w-full max-w-md">
        <input
          type="text"
          placeholder="Sparni#EUW"
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
       <button
          type="submit"
          className="bg-[#FF4654] hover:bg-[#ff5a66] transition px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#FF4654]/20 hover:shadow-[#FF4654]/40"
        >
          Search
        </button>
      </form>

    </div>
  )
}