import { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  ChartNoAxesCombined,
  CircleAlert,
  Flag,
  Landmark,
  Target,
  Wallet
} from 'lucide-react'
import api from '../../services/api'

function formatMoney(value) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(Number(value || 0))
}

function formatPct(value) {
  return `${Math.max(0, Number(value || 0)).toFixed(0)}%`
}

function shortDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function toIsoDate(dateValue) {
  const d = new Date(dateValue)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function buildDailySeries(from, to, points) {
  if (!from || !to) return []

  const start = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return []

  const amountByDate = new Map(
    (points || []).map((p) => [toIsoDate(p.date), Number(p.amount || 0)])
  )

  const series = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const key = toIsoDate(cursor)
    series.push({ date: key, amount: amountByDate.get(key) || 0 })
    cursor.setDate(cursor.getDate() + 1)
  }

  return series
}

function LineChart({ points }) {
  if (!points || points.length === 0) {
    return <p className="text-xs text-slate-500">No trend data available</p>
  }

  const values = points.map((p) => Number(p.amount || 0))
  const max = Math.max(...values, 1)
  const width = 760
  const height = 240
  const pad = { top: 18, right: 18, bottom: 36, left: 18 }
  const chartW = width - pad.left - pad.right
  const chartH = height - pad.top - pad.bottom
  const step = points.length > 1 ? chartW / (points.length - 1) : chartW

  const pathD = points
    .map((p, index) => {
      const x = pad.left + index * step
      const y = pad.top + chartH - (Number(p.amount || 0) / max) * chartH
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')

  const yTicks = [0, max * 0.5, max]
  const midIndex = Math.floor((points.length - 1) / 2)

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        {yTicks.map((tick, idx) => {
          const y = pad.top + chartH - (tick / max) * chartH
          return (
            <g key={`grid-${idx}`}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={width - pad.right} y={y - 4} textAnchor="end" fontSize="11" fill="#64748b">
                {formatMoney(tick)}
              </text>
            </g>
          )
        })}

        <path d={pathD} fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, index) => {
          const x = pad.left + index * step
          const y = pad.top + chartH - (Number(p.amount || 0) / max) * chartH
          return <circle key={`pt-${p.date}-${index}`} cx={x} cy={y} r="2.7" fill="#b45309" />
        })}

        <text x={pad.left} y={height - 10} fontSize="12" fill="#64748b" textAnchor="start">
          {shortDate(points[0]?.date)}
        </text>
        <text x={pad.left + midIndex * step} y={height - 10} fontSize="12" fill="#64748b" textAnchor="middle">
          {shortDate(points[midIndex]?.date)}
        </text>
        <text x={width - pad.right} y={height - 10} fontSize="12" fill="#64748b" textAnchor="end">
          {shortDate(points[points.length - 1]?.date)}
        </text>
      </svg>
    </div>
  )
}

// Backward-compatible alias for older JSX usage.
const SparkLine = LineChart

export default function ManagerDashboardHome() {
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState({ from: monthStart, to: today })
  const [appliedPeriod, setAppliedPeriod] = useState({ from: monthStart, to: today })
  const [stats, setStats] = useState({
    period: null,
    headlineKpis: {
      todayNewLoansCount: 0,
      todayNewLoansAmount: 0,
      mtdNewLoansAmount: 0,
      targetAchievementPct: 0,
      remainingToTarget: 0,
      requiredPerRemainingDay: 0
    },
    portfolio: {
      activeTicketsCount: 0,
      activeLoanAmount: 0,
      overdueTicketsCount: 0,
      overdueLoanAmount: 0
    },
    collections: {
      renewalAmount: 0,
      partPaymentAmount: 0,
      redemptionAmount: 0,
      otherAmount: 0
    },
    ranking: {
      branchRank: null,
      totalBranches: 0,
      leaderboard: []
    },
    timeSeries: {
      dailyLoans: [],
      dailyCollections: []
    },
    branchName: ''
  })

  const loadDashboard = useCallback(async (from, to) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getManagerDashboard({ from, to })
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard(appliedPeriod.from, appliedPeriod.to)
  }, [loadDashboard, appliedPeriod.from, appliedPeriod.to])

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyPeriod = () => {
    if (dateRange.from && dateRange.to && dateRange.from > dateRange.to) {
      setError('From date cannot be later than To date')
      return
    }
    setAppliedPeriod({ from: dateRange.from || monthStart, to: dateRange.to || today })
  }

  const handleResetPeriod = () => {
    const resetFrom = monthStart
    const resetTo = today
    setDateRange({ from: resetFrom, to: resetTo })
    setAppliedPeriod({ from: resetFrom, to: resetTo })
  }

  const targetPct = useMemo(() => {
    return Math.max(0, Math.min(100, Number(stats.headlineKpis?.targetAchievementPct || 0)))
  }, [stats.headlineKpis?.targetAchievementPct])

  const collectionsTotal =
    Number(stats.collections?.renewalAmount || 0) +
    Number(stats.collections?.partPaymentAmount || 0) +
    Number(stats.collections?.redemptionAmount || 0) +
    Number(stats.collections?.otherAmount || 0)

  const chartPoints = useMemo(() => {
    return buildDailySeries(stats.period?.from, stats.period?.to, stats.timeSeries?.dailyLoans || [])
  }, [stats.period?.from, stats.period?.to, stats.timeSeries?.dailyLoans])

  const periodLoanTotal = useMemo(() => {
    return chartPoints.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  }, [chartPoints])

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-slate-100 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-700">
              <ChartNoAxesCombined className="h-3.5 w-3.5 text-amber-600" />
              
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Branche Performance</h1>
            <p className="mt-1 text-sm text-slate-600">
              {stats.branchName || 'Your Branch'} · Period {shortDate(stats.period?.from)} to {shortDate(stats.period?.to)}
            </p>
          </div>
          <button
            onClick={() => navigate('/manager/reverse-pawning')}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-white"
          >
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            Manage Reverse Pawning
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">From</label>
            <input
              type="date"
              name="from"
              value={dateRange.from}
              onChange={handleDateChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">To</label>
            <input
              type="date"
              name="to"
              value={dateRange.to}
              onChange={handleDateChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleApplyPeriod}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Apply Period
            </button>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetPeriod}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl border border-slate-200 bg-slate-100"></div>
          ))}
          {[4, 5].map((i) => (
            <div key={i} className="h-64 rounded-2xl border border-slate-200 bg-slate-100 lg:col-span-3"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today New Loans</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.headlineKpis?.todayNewLoansCount || 0}</p>
              <p className="mt-1 text-sm text-emerald-700">{formatMoney(stats.headlineKpis?.todayNewLoansAmount)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Coverage (MTD)</p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" style={{ width: `${targetPct}%` }} />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatPct(stats.headlineKpis?.targetAchievementPct)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">End-of-Day Loan Balance</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatMoney(stats.portfolio?.activeLoanAmount)}</p>
              <p className="mt-1 text-sm text-slate-600">Across {stats.portfolio?.activeTicketsCount || 0} active tickets</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue Exposure</p>
              <p className="mt-2 text-3xl font-bold text-rose-700">{formatMoney(stats.portfolio?.overdueLoanAmount)}</p>
              <p className="mt-1 text-sm text-rose-600">{stats.portfolio?.overdueTicketsCount || 0} overdue tickets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Loan Issuance Trend (Selected Period)</h3>
                <span className="text-xs text-slate-500">Daily Loans</span>
              </div>
              <LineChart points={chartPoints} />
              <p className="mt-4 text-sm text-slate-600">
                Period loans: <span className="font-semibold text-slate-900">{formatMoney(periodLoanTotal)}</span>
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900">Collections Snapshot</h3>
              <p className="mt-1 text-xs text-slate-500">Period total {formatMoney(collectionsTotal)}</p>
              <div className="mt-5 space-y-4">
                {[
                  { label: 'Renewals', value: stats.collections?.renewalAmount || 0, icon: CalendarDays, tone: 'text-indigo-600' },
                  { label: 'Part Payments', value: stats.collections?.partPaymentAmount || 0, icon: Wallet, tone: 'text-sky-600' },
                  { label: 'Redemptions', value: stats.collections?.redemptionAmount || 0, icon: Landmark, tone: 'text-emerald-600' }
                ].map((item) => {
                  const Icon = item.icon
                  const base = collectionsTotal > 0 ? (Number(item.value) / collectionsTotal) * 100 : 0
                  return (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2 text-slate-700">
                          <Icon className={`h-4 w-4 ${item.tone}`} />
                          {item.label}
                        </span>
                        <span className="font-medium text-slate-900">{formatMoney(item.value)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-slate-600" style={{ width: `${Math.min(base, 100)}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Target Coverage Details</h3>
              <div className="mt-4 space-y-3 text-sm">
                <p className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-slate-600"><Target className="h-4 w-4 text-amber-600" />Remaining to target</span>
                  <span className="font-semibold text-slate-900">{formatMoney(stats.headlineKpis?.remainingToTarget)}</span>
                </p>
                <p className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-slate-600"><Activity className="h-4 w-4 text-blue-600" />Required per remaining day</span>
                  <span className="font-semibold text-slate-900">{formatMoney(stats.headlineKpis?.requiredPerRemainingDay)}</span>
                </p>
                <p className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-slate-600"><CircleAlert className="h-4 w-4 text-rose-600" />Overdue loan amount</span>
                  <span className="font-semibold text-rose-700">{formatMoney(stats.portfolio?.overdueLoanAmount)}</span>
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Branch Ranking</h3>
              <p className="mt-1 text-sm text-slate-600">
                Rank {stats.ranking?.branchRank || '-'} of {stats.ranking?.totalBranches || 0} branches
              </p>
              <div className="mt-4 space-y-3">
                {(stats.ranking?.leaderboard || []).length === 0 && (
                  <p className="text-sm text-slate-500">No ranking data available for this month.</p>
                )}
                {(stats.ranking?.leaderboard || []).map((row, idx) => (
                  <div key={`${row.branchId}-${idx}`} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{row.branchName}</p>
                      <p className="text-xs text-slate-500">{formatMoney(row.mtdAmount)} MTD</p>
                    </div>
                    <div className="text-right">
                      <p className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                        <Flag className="h-3.5 w-3.5 text-amber-600" />
                        {formatPct(row.achievementPct)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </>
      )}
    </div>
  )
}
