import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, AlertCircle, Clock, RotateCcw, LogOut, ChevronDown } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts'

export default function ManagerDashboard() {
  const navigate = useNavigate()
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)

  const handleLogout = () => {
    navigate('/login')
  }

  // ---------- MOCK DASHBOARD DATA (UI-only) ----------
  const dashboard = {
    period: { from: '2026-03-01', to: '2026-03-31' },
    branchName: '0001 - Colombo Central',
    headlineKpis: {
      todayNewLoansCount: 8,
      todayNewLoansAmount: 1500000,
      mtdNewLoansAmount: 32000000,
      targetAchievementPct: 68,
      remainingToTarget: 15000000,
      requiredPerRemainingDay: 1200000
    },
    portfolio: {
      activeTicketsCount: 230,
      activeLoanAmount: 90000000,
      overdueTicketsCount: 12,
      overdueLoanAmount: 4500000
    },
    collections: {
      renewalAmount: 500000,
      partPaymentAmount: 200000,
      redemptionAmount: 800000
    },
    ranking: {
      branchRank: 3,
      totalBranches: 10,
      leaderboard: [
        { branchId: 2, branchName: '0002 - Kandy City', achievementPct: 110, mtdAmount: 42000000 },
        { branchId: 3, branchName: '0003 - Galle', achievementPct: 95, mtdAmount: 36000000 },
        { branchId: 1, branchName: '0001 - Colombo Central', achievementPct: 68, mtdAmount: 32000000 },
        { branchId: 4, branchName: '0004 - Kurunegala', achievementPct: 55, mtdAmount: 26000000 },
        { branchId: 5, branchName: '0005 - Matara', achievementPct: 48, mtdAmount: 22000000 }
      ]
    },
    timeSeries: {
      dailyLoans: [
        { date: '2026-03-01', amount: 1000000 },
        { date: '2026-03-02', amount: 1200000 },
        { date: '2026-03-03', amount: 800000 },
        { date: '2026-03-04', amount: 1600000 },
        { date: '2026-03-05', amount: 900000 }
      ],
      dailyCollections: [
        { date: '2026-03-01', amount: 400000 },
        { date: '2026-03-02', amount: 350000 },
        { date: '2026-03-03', amount: 500000 },
        { date: '2026-03-04', amount: 300000 },
        { date: '2026-03-05', amount: 450000 }
      ]
    }
  }

  const headline = dashboard.headlineKpis
  const portfolio = dashboard.portfolio
  const collections = dashboard.collections
  const ranking = dashboard.ranking
  const timeSeries = dashboard.timeSeries

  const maxDailyLoan = timeSeries.dailyLoans.reduce(
    (max, d) => (d.amount > max ? d.amount : max),
    0
  )
  const maxDailyCollection = timeSeries.dailyCollections.reduce(
    (max, d) => (d.amount > max ? d.amount : max),
    0
  )
  const branchName = dashboard.branchName || '—'

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar - Matching Staff Dashboard */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <img
                src="/BOC%20logo.jpg"
                alt="BOC logo"
                className="h-10 w-10 rounded-lg bg-black object-cover shadow-md"
              />
              <div>
                <h1 className="text-xl font-bold text-black">Smart Gold</h1>
                <p className="text-xs text-black/70">Manager Dashboard</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-semibold text-black">
                Logged in as: <span className="text-black/80">Manager</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsLogoutOpen(prev => !prev)}
                  className="flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-black/30"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isLogoutOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200">
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      Logout to Login
                    </button>
                    <button
                      onClick={() => navigate('/login-as')}
                      className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      Switch Portal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Manager Dashboard</h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="inline-block rounded-lg bg-yellow-100 px-4 py-1 text-sm font-semibold text-yellow-800">
                  {branchName}
                </span>
                {dashboard?.period && (
                  <span className="text-xs text-gray-600">
                    Period: {dashboard.period.from} → {dashboard.period.to}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden text-xs">
                <button className="px-3 py-2 font-semibold bg-yellow-500 text-black">
                  Today
                </button>
                <button className="px-3 py-2 font-semibold border-l border-gray-200 text-gray-700">
                  This Month
                </button>
              </div>
              <button
                onClick={() => navigate('/manager/reverse-pawning')}
                className="rounded-lg border-2 border-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-50"
              >
                Review Reverse Pawning
              </button>
              <button
                onClick={() => navigate('/manager/auction')}
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-600"
              >
                View Auction List
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Today New Loans */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">Today&apos;s New Loans</h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                Rs. {Number(headline.todayNewLoansAmount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {headline.todayNewLoansCount || 0} tickets
              </p>
            </div>

            {/* MTD Target Achievement */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">MTD Target Achievement</h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {headline.targetAchievementPct || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Remaining: Rs. {Number(headline.remainingToTarget || 0).toLocaleString()}<br />
                Required per day: Rs. {Number(headline.requiredPerRemainingDay || 0).toLocaleString()}
              </p>
            </div>

            {/* Active Portfolio */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">Active Portfolio</h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <RotateCcw className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                Rs. {Number(portfolio.activeLoanAmount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {portfolio.activeTicketsCount || 0} active tickets
              </p>
            </div>

            {/* Overdue Exposure */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">Overdue Exposure</h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                Rs. {Number(portfolio.overdueLoanAmount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {portfolio.overdueTicketsCount || 0} overdue tickets
              </p>
            </div>
          </div>

          {/* Main Content - 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-8">
              {/* Daily Loans Chart (Line chart) */}
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-yellow-600 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Daily Loans (This Month)
                  </h2>
                </div>
                <div className="p-4 h-72">
                  {timeSeries.dailyLoans.length === 0 ? (
                    <p className="text-sm text-gray-500">No loans yet for this month.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={timeSeries.dailyLoans.map(d => ({
                          date: String(d.date).slice(5, 10),
                          amount: Number(d.amount || 0)
                        }))}
                        margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis
                          tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(v) => `Rs. ${Number(v).toLocaleString()}`}
                          labelFormatter={(l) => `Date: ${l}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#eab308"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Loan amount"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Daily Collections Chart (Bar chart) */}
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-yellow-600 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Daily Collections (This Month)
                  </h2>
                </div>
                <div className="p-4 h-72">
                  {timeSeries.dailyCollections.length === 0 ? (
                    <p className="text-sm text-gray-500">No collections yet for this month.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={timeSeries.dailyCollections.map(d => ({
                          date: String(d.date).slice(5, 10),
                          amount: Number(d.amount || 0)
                        }))}
                        margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis
                          tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(v) => `Rs. ${Number(v).toLocaleString()}`}
                          labelFormatter={(l) => `Date: ${l}`}
                        />
                        <Legend />
                        <Bar
                          dataKey="amount"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          name="Collections"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Ranking & Collections Breakdown */}
            <div className="space-y-8">
              {/* Branch Ranking */}
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-bold text-yellow-600">Branch Ranking</h2>
                </div>
                <div className="p-6 space-y-3 text-sm">
                  {ranking.branchRank && ranking.totalBranches ? (
                    <p className="font-semibold text-gray-800">
                      You are currently{' '}
                      <span className="text-yellow-700">
                        #{ranking.branchRank} of {ranking.totalBranches}
                      </span>{' '}
                      branches by target achievement.
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Ranking will appear once there is data for this month.
                    </p>
                  )}
                  <div className="mt-4 space-y-2">
                    {ranking.leaderboard?.map((b, idx) => (
                      <div key={b.branchId || idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-gray-800">
                            {idx + 1}. {b.branchName}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {b.achievementPct}% ({Number(b.mtdAmount || 0).toLocaleString()})
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-yellow-500"
                            style={{ width: `${Math.min(b.achievementPct, 130)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Collections Breakdown */}
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-bold text-yellow-600">Collections Breakdown</h2>
                </div>
                <div className="p-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Renewals (Interest)</span>
                    <span className="font-semibold text-gray-900">
                      Rs. {Number(collections.renewalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Part Payments</span>
                    <span className="font-semibold text-gray-900">
                      Rs. {Number(collections.partPaymentAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Redemptions</span>
                    <span className="font-semibold text-gray-900">
                      Rs. {Number(collections.redemptionAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
