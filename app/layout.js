import "./globals.css"

export const metadata = {
  title: "Rankflow",
  description: "Your Valorant performance coach",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">

        <div className="max-w-5xl mx-auto px-6 py-10">

          <header className="flex items-center justify-between mb-10">

            <h1 className="text-xl font-bold">
              Rankflow
            </h1>

            <nav className="flex gap-6 text-sm text-slate-400">
              <a href="/">Home</a>
              <a href="/maps">Maps</a>
              <a href="/agents">Agents</a>
            </nav>

          </header>

          {children}

        </div>

      </body>
    </html>
  )
}