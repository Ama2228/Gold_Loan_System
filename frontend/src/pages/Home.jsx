import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Sparkles, Clock3, BadgePercent, Landmark } from 'lucide-react'

export default function Home() {
  const goldRates = [
    { karatage: '24K', purity: '99.9%', advancePerGram: 'LKR 8,500' },
    { karatage: '22K', purity: '91.6%', advancePerGram: 'LKR 7,800' },
    { karatage: '20K', purity: '83.3%', advancePerGram: 'LKR 7,100' },
    { karatage: '18K', purity: '75.0%', advancePerGram: 'LKR 6,400' }
  ]

  const highlights = [
    { icon: Clock3, title: 'Fast processing', text: 'Quick evaluation and smooth handling at the branch.' },
    { icon: Shield, title: 'Safe storage', text: 'Gold items are logged, protected, and securely managed.' },
    { icon: BadgePercent, title: 'One annual rate', text: 'A single annual interest rate applies to every karatage.' }
  ]

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-slate-900"
      style={{ backgroundImage: "url('/Background.png')" }}
    >
      <div className="min-h-screen bg-amber-50/98 backdrop-blur-[1px]">
        <nav className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <img
                src="/BOC%20logo.jpg"
                alt="Smart Gold logo"
                className="h-11 w-11 rounded-2xl border border-slate-200 object-cover shadow-lg shadow-black/10"
              />
              <div>
                <h1 className="text-xl font-semibold text-slate-950">Smart Gold</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-yellow-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-yellow-400"
              >
                Register
              </Link>
            </div>
          </div>
        </nav>

        <main>
          <section className="px-6 py-18 text-center sm:py-20">
            <div className="mx-auto max-w-4xl rounded-[2.25rem] border border-slate-200 bg-white/85 backdrop-blur-md px-8 py-12 shadow-2xl shadow-black/10 sm:px-12 sm:py-14">
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-300/60 bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-900">
                <Sparkles className="h-4 w-4" />
                Smart Gold Pawning Management System
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Welcome to Smart Gold
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                Access a refined digital experience for gold valuation, customer service, and branch operations.
                The annual interest rate is shown once and applies to all karatages.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-yellow-400"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </section>

          <section className="border-t border-slate-200/70 px-6 py-14">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-6 md:grid-cols-3">
                {highlights.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white/85 backdrop-blur-md p-6 shadow-xl shadow-black/5">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="px-6 py-16">
            <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white/85 backdrop-blur-md p-8 shadow-2xl shadow-black/10">
              <div className="mb-8 text-center">
                <h3 className="text-3xl font-bold text-slate-950">Gold valuation by karatage</h3>
                <p className="mt-2 text-slate-600">Clear tiers for 24K, 22K, 20K, and 18K gold</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {goldRates.map((rate) => (
                  <div
                    key={rate.karatage}
                    className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-lg shadow-black/5 transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-2xl font-bold text-slate-950">{rate.karatage}</h4>
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-900">
                        {rate.purity}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-500">Advance per gram</p>
                        <p className="text-xl font-bold text-yellow-700">{rate.advancePerGram}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-white/85 backdrop-blur-md px-6 py-5 text-center shadow-sm">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                  <div className="flex items-center gap-2 text-slate-950">
                    <Landmark className="h-5 w-5 text-yellow-600" />
                    <span className="text-lg font-semibold">Current annual interest rate: 12% p.a.</span>
                  </div>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
                  <span className="text-sm text-slate-600">Adjustable by administrators in System Settings</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-200 bg-white/85 px-6 py-8 text-slate-900 backdrop-blur-md shadow-[0_-1px_0_rgba(15,23,42,0.05)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold">Smart Gold Pawning Management System</p>
              <p className="text-sm text-slate-600">Clear rates, simple access, and a professional customer experience.</p>
            </div>
            <p className="text-sm text-slate-500">&copy; 2026 Smart Gold. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
