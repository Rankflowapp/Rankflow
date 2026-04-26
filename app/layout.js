import Link from "next/link"
import { Space_Grotesk } from "next/font/google"
import Footer from "./components/Footer"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

export const metadata = {
  title: "Rankflow",
  description: "Your Valorant performance coach",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="relative bg-slate-950 text-white overflow-x-hidden font-sans flex flex-col min-h-screen">

        {/* BACKGROUND GLOW */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-500 opacity-20 blur-[120px]" />
          <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-emerald-500 opacity-20 blur-[120px]" />
        </div>

        {/* CONTENT */}
        <div className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full">

          {/* HEADER */}
          <header className="flex items-center justify-between mb-8">
            <Link href="/" className="group">
              <h1 className="text-xl font-bold tracking-tight group-hover:text-[#FF4654] transition">
                Rankflow
              </h1>
              <p className="text-xs text-slate-400">Performance Tracker</p>
            </Link>

            <nav className="flex gap-6 text-sm text-slate-400">
              <Link href="/" className="hover:text-white transition">Home</Link>
            </nav>
          </header>

          {children}

        </div>

        {/* FOOTER */}
        <Footer />

      </body>
    </html>
  )
}