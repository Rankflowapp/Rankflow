"use client"
import { useState } from "react"

export default function Footer() {
  const [modalOpen, setModalOpen] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [emailInput, setEmailInput] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  function closeModal() {
    setModalOpen(false)
    setNameInput("")
    setEmailInput("")
    setMessageInput("")
    setSubmitStatus(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!messageInput.trim()) return
    setSubmitting(true)
    setSubmitStatus(null)
    try {
      const res = await fetch("https://formspree.io/f/mgorplqw", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          type: "Contact",
          name: nameInput.trim() || "Anonymous",
          email: emailInput.trim() || "Not provided",
          message: messageInput.trim(),
        })
      })
      if (res.ok) {
        setSubmitStatus("success")
        setTimeout(() => { closeModal() }, 2000)
      } else {
        setSubmitStatus("error")
      }
    } catch (err) {
      setSubmitStatus("error")
    }
    setSubmitting(false)
  }

  return (
    <>
      <footer className="mt-20 border-t border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-3 gap-8 mb-8">

            <div>
              <h3 className="text-2xl font-bold tracking-tighter mb-2">RANKFLOW<span className="text-[#FF4654]">.</span></h3>
              <p className="text-sm text-slate-400 mb-2">Climb smarter<span className="text-[#FF4654]">.</span></p>
              <p className="text-xs text-slate-500 leading-relaxed">Valorant performance and coaching platform. Built for competitive players.</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Resources</p>
              <div className="space-y-2">
                <a href="/about" className="block text-sm text-slate-300 hover:text-indigo-300 transition">About</a>
                <a href="https://github.com/Rankflowapp/Rankflow" target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-300 hover:text-indigo-300 transition">GitHub</a>
                <button onClick={() => setModalOpen(true)} className="block text-sm text-slate-300 hover:text-indigo-300 transition">Contact us</button>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Legal</p>
              <p className="text-xs text-slate-500 leading-relaxed">Rankflow isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</p>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">Rankflow {new Date().getFullYear()}. All rights reserved.</p>
            <p className="text-xs text-slate-500">Made with passion for the Valorant community</p>
          </div>

        </div>
      </footer>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {submitStatus === "success" ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-emerald-400 mb-2">Message sent!</h3>
                <p className="text-sm text-slate-400">Thanks for reaching out. We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-2">📬 Get in touch</p>
                  <h3 className="text-xl font-bold text-white mb-1">Contact Rankflow</h3>
                  <p className="text-sm text-slate-400">Feedback, suggestions, bugs - we'd love to hear from you.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Name <span className="text-slate-600 normal-case">(optional)</span></label>
                    <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Your name" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition" />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Email <span className="text-slate-600 normal-case">(optional, if you'd like a reply)</span></label>
                    <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="you@example.com" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition" />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Message</label>
                    <textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="What's on your mind?" required rows={4} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition resize-none" />
                  </div>

                  {submitStatus === "error" && (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
                      <p className="text-sm text-rose-400">❌ An error occurred. Please try again in a moment.</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition">Cancel</button>
                    <button type="submit" disabled={submitting || !messageInput.trim()} className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition">{submitting ? "Sending..." : "Send"}</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}