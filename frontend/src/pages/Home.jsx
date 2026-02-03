import { Link } from 'react-router-dom'
import { TrendingUp, Shield, Clock, ArrowRight } from 'lucide-react'

export default function Home() {
  const goldRates = [
    { karatage: '24K', purity: '99.9%', advancePerGram: 'LKR 8,500', interestRate: '1.2%' },
    { karatage: '22K', purity: '91.6%', advancePerGram: 'LKR 7,800', interestRate: '1.2%' },
    { karatage: '18K', purity: '75.0%', advancePerGram: 'LKR 6,400', interestRate: '1.3%' },
    { karatage: '14K', purity: '58.5%', advancePerGram: 'LKR 4,900', interestRate: '1.4%' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 font-black text-black shadow-lg">
              SG
            </div>
            <div className="text-xl font-bold">
              <span className="text-gray-900">Smart</span>
              <span className="text-yellow-600"> Gold</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg border-2 border-gray-900 px-6 py-2 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-900 hover:text-white"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-yellow-600 hover:shadow-md"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800">
            <TrendingUp className="h-4 w-4" />
            Trusted Since 1995
          </div>
          <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl">
            Welcome to <span className="text-yellow-600">Smart Gold</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Get instant cash loans against your gold jewelry with competitive rates and transparent terms
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button className="rounded-lg bg-yellow-500 px-8 py-4 text-lg font-semibold text-black transition-all hover:bg-yellow-600 hover:shadow-lg">
              Calculate Your Loan
            </button>
            <button className="rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-900 transition-all hover:border-yellow-500 hover:shadow-md">
              Visit Branch
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Quick Processing</h3>
              <p className="mt-2 text-gray-600">Get your loan approved within 15 minutes</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100">
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">100% Secure</h3>
              <p className="mt-2 text-gray-600">Your gold is safely stored in our vault</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Best Rates</h3>
              <p className="mt-2 text-gray-600">Competitive interest rates starting at 1.2%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Gold Rates */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Current Gold Advance Rates</h2>
            <p className="mt-2 text-gray-600">Updated daily based on international gold prices</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
              Live Rates - Last updated: Today, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {goldRates.map((rate) => (
              <div
                key={rate.karatage}
                className="group rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-yellow-400 hover:shadow-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">{rate.karatage}</h3>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                    {rate.purity}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Advance per gram</p>
                    <p className="text-xl font-bold text-yellow-600">{rate.advancePerGram}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly interest</p>
                    <p className="text-lg font-semibold text-gray-900">{rate.interestRate}</p>
                  </div>
                </div>
                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors group-hover:bg-yellow-50 group-hover:text-yellow-900">
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-yellow-50 p-6 text-center">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Rates are subject to gold purity verification and may vary based on market conditions. 
              No hidden charges. Processing fee: LKR 500 (one-time)
            </p>
          </div>
        </div>
      </section>

      {/* Interest Rate Details */}
      <section className="border-t border-gray-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">Transparent Interest Rates</h2>
          <p className="mt-4 text-lg text-gray-600">
            Our monthly interest rates are among the most competitive in Sri Lanka
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-6">
              <p className="text-4xl font-bold text-yellow-600">1.2%</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">24K & 22K Gold</p>
              <p className="mt-1 text-xs text-gray-600">Per month</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-6">
              <p className="text-4xl font-bold text-yellow-600">1.3%</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">18K Gold</p>
              <p className="mt-1 text-xs text-gray-600">Per month</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-6">
              <p className="text-4xl font-bold text-yellow-600">1.4%</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">14K Gold</p>
              <p className="mt-1 text-xs text-gray-600">Per month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-900 px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 font-black text-black">
                  SG
                </div>
                <div className="text-lg font-bold">
                  <span className="text-white">Smart</span>
                  <span className="text-yellow-400"> Gold</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Your trusted partner for gold loans since 1995
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Quick Links</h4>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-yellow-400">About Us</a></li>
                <li><a href="#" className="hover:text-yellow-400">Branches</a></li>
                <li><a href="#" className="hover:text-yellow-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Services</h4>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-yellow-400">Gold Loans</a></li>
                <li><a href="#" className="hover:text-yellow-400">Renewals</a></li>
                <li><a href="#" className="hover:text-yellow-400">Gold Storage</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Contact</h4>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li>+94 11 234 5678</li>
                <li>info@smartgold.lk</li>
                <li>Colombo, Sri Lanka</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Smart Gold. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


