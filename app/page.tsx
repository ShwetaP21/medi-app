import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">M</span>
          </div>
          <span className="font-semibold text-stone-900 text-lg">MediVault</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900 px-4 py-2 rounded-lg hover:bg-stone-100 transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Secure · Private · AI-powered
        </div>

        <h1 className="text-5xl md:text-6xl font-light text-stone-900 max-w-3xl leading-tight mb-6">
          Your health records,{' '}
          <span className="text-emerald-600 font-medium">organised and understood</span>
        </h1>

        <p className="text-lg text-stone-500 max-w-xl mb-10 leading-relaxed">
          MediVault helps you securely store health records, track medications, manage appointments,
          and understand lab reports with AI — all in one private place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-20">
          <Link href="/register" className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm">
            Create your vault — it's free
          </Link>
          <Link href="/login" className="bg-white text-stone-700 px-8 py-3.5 rounded-xl hover:bg-stone-100 transition-colors font-medium text-sm border border-stone-200">
            Sign in
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
          {[
            { icon: '🩺', title: 'Health Records', desc: 'Log visits, diagnoses & procedures' },
            { icon: '📅', title: 'Appointments', desc: 'Book and manage your schedule' },
            { icon: '💊', title: 'Medications', desc: 'Track dosages and schedules' },
            { icon: '🤖', title: 'AI Insights', desc: 'Understand your lab reports' },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-stone-200 rounded-2xl p-6 text-left hover:border-emerald-300 hover:shadow-sm transition-all">
              <div className="text-2xl mb-3">{f.icon}</div>
              <div className="font-medium text-stone-900 text-sm mb-1">{f.title}</div>
              <div className="text-xs text-stone-500 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
        <div>© 2025 MediVault. Built with Next.js, TypeScript & PostgreSQL.</div>
        <div className="flex items-center gap-4">
          <span>Built by <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Shweta Pachpute</a></span>
          <span>·</span>
          <a href="https://github.com/ShwetaP21" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900">GitHub</a>
          </div>
      </footer>
    </main>
  )
}
