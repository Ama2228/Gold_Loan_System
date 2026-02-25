import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function ManagerDashboardHome() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    activeTickets: 0,
    overdueCount: 0,
    dueTodayCount: 0,
    reversePawningCount: 0
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.getManagerDashboard()
        if (res.success && res.data) {
          setStats({
            activeTickets: res.data.activeTickets ?? 0,
            overdueCount: res.data.overdueCount ?? 0,
            dueTodayCount: res.data.dueTodayCount ?? 0,
            reversePawningCount: res.data.reversePawningCount ?? 0
          })
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the Smart Gold Manager Portal</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="mb-8 rounded-lg bg-white border border-gray-200 p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Quick Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
              <p className="text-sm font-semibold text-blue-600 mb-2">Active Tickets</p>
              <p className="text-3xl font-bold text-blue-900">{stats.activeTickets}</p>
              <p className="text-xs text-blue-600 mt-2">Branch total</p>
            </div>

            <div className="rounded-lg bg-red-50 border border-red-200 p-6">
              <p className="text-sm font-semibold text-red-600 mb-2">Overdue Tickets</p>
              <p className="text-3xl font-bold text-red-900">{stats.overdueCount}</p>
              <p className="text-xs text-red-600 mt-2">Urgent action needed</p>
            </div>

            <div className="rounded-lg bg-orange-50 border border-orange-200 p-6">
              <p className="text-sm font-semibold text-orange-600 mb-2">Due Today</p>
              <p className="text-3xl font-bold text-orange-900">{stats.dueTodayCount}</p>
              <p className="text-xs text-orange-600 mt-2">Requires attention</p>
            </div>

            <button
              onClick={() => navigate('/manager/reverse-pawning')}
              className="rounded-lg bg-purple-50 border border-purple-200 p-6 text-left hover:bg-purple-100 transition-colors"
            >
              <p className="text-sm font-semibold text-purple-600 mb-2">Reverse Pawning</p>
              <p className="text-3xl font-bold text-purple-900">{stats.reversePawningCount}</p>
              <p className="text-xs text-purple-600 mt-2">Total records — Click to manage</p>
            </button>
          </div>

          {/* Info Card */}
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-6">
            <h3 className="font-bold text-yellow-900 mb-2">Welcome, Manager!</h3>
            <p className="text-sm text-yellow-800">
              Use the navigation menu above to access staff functions and manager-only features like Reverse Pawning.
              You have full access to manage branch operations and oversee all transactions.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
