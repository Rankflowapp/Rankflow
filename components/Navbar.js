"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { name: "Overview", href: "/" },
    { name: "Maps", href: "/maps" },
    { name: "Agents", href: "/agents" },
    { name: "Recommendations", href: "/recommendations" },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => {
        const isActive = pathname === link.href

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`px-4 py-2 rounded-2xl border transition ${
              isActive
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/30"
                : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-900/60"
            }`}
          >
            {link.name}
          </Link>
        )
      })}
    </div>
  )
}