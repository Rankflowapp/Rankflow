import Link from "next/link"
import { mapsData } from "../../data/mapsData"

export default function MapsPage() {

  return (
    <div className="space-y-8">

      <h1 className="text-4xl font-bold">Maps</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {mapsData.map((map) => (
          <Link
            key={map.slug}
            href={`/maps/${map.slug}`}
            className="bg-slate-900 p-6 rounded-3xl border border-slate-800"
          >
            <h2 className="text-2xl font-semibold">{map.name}</h2>
            <p className="text-slate-400 mt-2">
              WR: {map.wr}%
            </p>
          </Link>
        ))}
      </div>

    </div>
  )
}