import "./globals.css"

export const metadata = {
  title: "Rankflow",
  description: "Your Valorant performance coach",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative bg-slate-950 text-white overflow-x-hidden">

        {/* 🔥 BACKGROUND GLOW */}
        <div className="fixed inset-0 -z-10">

          {/* GLOW 1 */}
          <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-500 opacity-20 blur-[120px]" />

          {/* GLOW 2 */}
          <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-emerald-500 opacity-20 blur-[120px]" />

        </div>

        {/* CONTENT */}
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* HEADER */}
          <header className="flex items-center justify-between mb-8">

            <div>
              <h1 className="text-xl font-bold">Rankflow</h1>
              <p className="text-xs text-slate-400">
                Performance Tracker
              </p>
            </div>

            <nav className="flex gap-6 text-sm text-slate-400">
              <a href="/" className="hover:text-white transition">Home</a>
              <a href="/maps" className="hover:text-white transition">Maps</a>
              <a href="/agents" className="hover:text-white transition">Agents</a>
            </nav>

          </header>

          {children}

        </div>

      </body>
    </html>
  )
}