import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

function formatDate(d) {
  if (!d) return '—'
  return String(d).slice(0, 10)
}

function formatTimeSlot(start, end) {
  if (!start && !end) return '—'
  const s = start ? String(start).slice(0, 5) : '—'
  const e = end ? String(end).slice(0, 5) : '—'
  return `${s} - ${e}`
}

function formatMemberSince(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800'
    case 'RENEWED': return 'bg-blue-100 text-blue-800'
    case 'OVERDUE': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getDaysLabel(daysUntilDue) {
  if (daysUntilDue === null || daysUntilDue === undefined) return '—'
  if (daysUntilDue < 0) return `Overdue ${Math.abs(daysUntilDue)} days`
  if (daysUntilDue === 0) return 'Due today'
  if (daysUntilDue === 1) return '1 day'
  return `${daysUntilDue} days`
}

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [activeAppointmentId, setActiveAppointmentId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [dashboardData, setDashboardData] = useState({
    customerInfo: null,
    activeReceiptCount: 0,
    totalLoanAmount: 0,
    overdueCount: 0,
    totalOutstanding: 0,
    allActiveTickets: [],
    receiptsNeedingAttention: [],
    recentActivity: []
  })
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [dashRes, apptRes, notifRes] = await Promise.all([
          api.getCustomerDashboard(),
          api.getCustomerAppointments().catch(() => ({ data: [] })),
          api.getCustomerNotifications().catch(() => ({ data: [] }))
        ])
        if (dashRes.success && dashRes.data) {
          setDashboardData({
            customerInfo: dashRes.data.customerInfo ?? null,
            activeReceiptCount: dashRes.data.activeReceiptCount ?? 0,
            totalLoanAmount: dashRes.data.totalLoanAmount ?? 0,
            overdueCount: dashRes.data.overdueCount ?? 0,
            totalOutstanding: dashRes.data.totalOutstanding ?? 0,
            allActiveTickets: dashRes.data.allActiveTickets ?? [],
            receiptsNeedingAttention: dashRes.data.receiptsNeedingAttention ?? [],
            recentActivity: dashRes.data.recentActivity ?? []
          })
        }
        setAppointments(Array.isArray(apptRes?.data) ? apptRes.data : [])
        setNotifications(Array.isArray(notifRes?.data) ? notifRes.data : [])
      } catch (err) {
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const upcomingAppointments = appointments
    .filter(apt => {
      const aptDate = apt.appointment_date ? String(apt.appointment_date).slice(0, 10) : ''
      return aptDate >= new Date().toISOString().split('T')[0]
    })
    .sort((a, b) => String(a.appointment_date).localeCompare(String(b.appointment_date)))
    .slice(0, 5)

  const notificationsPreview = notifications.slice(0, 5)
  const { customerInfo, activeReceiptCount, totalLoanAmount, overdueCount, totalOutstanding, allActiveTickets, receiptsNeedingAttention, recentActivity } = dashboardData

  const handleLogout = () => {
    api.logout()
    navigate('/login')
  }

  const handleViewReceipt = (receiptNo) => {
    navigate('/customer/receipts', { state: { selectedReceiptNo: receiptNo } })
  }

  const handlePartPay = (receiptNo) => {
    navigate('/customer/part-payments', { state: { receiptNo } })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/BOC%20logo.jpg"
                alt="BOC logo"
                className="h-10 w-10 rounded-lg bg-black object-cover shadow-md"
              />
              <div>
                <h1 className="text-lg font-bold text-black">Smart Gold</h1>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-3 text-sm font-semibold text-black">
              <button onClick={() => navigate('/customer/receipts')} className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50">My Receipts</button>
              <span className="text-black/40">|</span>
              <button onClick={() => navigate('/customer/part-payments')} className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50">Part Payments</button>
              <span className="text-black/40">|</span>
              <button onClick={() => navigate('/customer/appointments')} className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50">Appointments</button>
              <span className="text-black/40">|</span>
              <button onClick={() => navigate('/customer/notifications')} className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50">Notifications</button>
            </nav>

            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/customer/profile')} className="rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-black/30">Profile</button>
              <button onClick={handleLogout} className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-6 py-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {loading && (
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
                </div>
              </div>
              <p className="text-center py-8 text-gray-500">Loading dashboard...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
          )}

          {!loading && !error && (
            <>
              {/* Welcome Banner */}
              <div className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-black shadow-md">
                <h2 className="text-2xl font-bold">Welcome, {customerInfo?.full_name || 'Customer'}</h2>
                {customerInfo?.registered_date && (
                  <p className="text-black/80 mt-1">Member since {formatMemberSince(customerInfo.registered_date)}</p>
                )}
              </div>

              {/* Profile Card */}
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-6 text-sm text-gray-900">
                  <span><span className="font-semibold text-gray-600">NIC:</span> {customerInfo?.nic || '—'}</span>
                  <span><span className="font-semibold text-gray-600">Branch:</span> {customerInfo?.branch_name || '—'}</span>
                  <span><span className="font-semibold text-gray-600">Phone:</span> {customerInfo?.phone || '—'}</span>
                </div>
                <button onClick={() => navigate('/customer/profile')} className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-600">Edit Profile</button>
              </div>

              {/* Stats Row */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700">Active Receipts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{activeReceiptCount}</p>
                </div>
                <div className="rounded-lg bg-white p-6 border border-yellow-200 shadow-sm bg-yellow-50/50">
                  <p className="text-sm font-semibold text-yellow-700">Total Loan</p>
                  <p className="text-3xl font-bold text-yellow-800 mt-2">Rs. {Number(totalLoanAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700">Outstanding</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">Rs. {Number(totalOutstanding).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-lg bg-white p-6 border border-red-200 shadow-sm">
                  <p className="text-sm font-semibold text-red-700">Overdue</p>
                  <p className="text-3xl font-bold text-red-800 mt-2">{overdueCount}</p>
                </div>
              </div>

              {/* Alerts */}
              {receiptsNeedingAttention.length > 0 && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-center justify-between flex-wrap gap-3">
                  <p className="text-red-800 font-semibold">
                    {receiptsNeedingAttention.length} receipt{receiptsNeedingAttention.length !== 1 ? 's' : ''} need attention
                  </p>
                  <button onClick={() => navigate('/customer/receipts')} className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">View Receipts</button>
                </div>
              )}

              {/* Main Content */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {/* All Active Tickets */}
                  <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-yellow-600 mb-4">All Active Tickets</h3>
                    {allActiveTickets.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-yellow-500 bg-yellow-50">
                              <th className="px-4 py-3 text-left font-semibold text-gray-900">Receipt</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900">Loan</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900">Outstanding</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900">Due</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allActiveTickets.map((t) => (
                              <tr key={t.ticket_id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-900 font-medium">{t.receipt_no}</td>
                                <td className="px-4 py-3 text-gray-900">Rs. {Number(t.loan_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3 text-gray-900">Rs. {Number(t.payment_summary?.outstandingPrincipal ?? t.loan_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3 text-gray-900">{formatDate(t.due_date)} ({getDaysLabel(t.daysUntilDue)})</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(t.status)}`}>{t.status}</span>
                                </td>
                                <td className="px-4 py-3 space-x-2">
                                  <button onClick={() => handlePartPay(t.receipt_no)} className="text-yellow-600 font-semibold hover:text-yellow-700 text-xs">Part Pay</button>
                                  <span className="text-gray-300">|</span>
                                  <button onClick={() => handleViewReceipt(t.receipt_no)} className="text-yellow-600 font-semibold hover:text-yellow-700 text-xs">View</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">No active receipts</div>
                    )}
                  </div>

                  {/* Recent Transactions */}
                  <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-yellow-600 mb-4">Recent Transactions</h3>
                    {recentActivity.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-yellow-500 bg-yellow-50">
                              <th className="px-4 py-3 text-left font-semibold text-gray-900">Receipt</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentActivity.map((tx, i) => (
                              <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-900 font-medium">{tx.receiptNo}</td>
                                <td className="px-4 py-3 text-gray-900">{formatDate(tx.date)}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                    tx.type === 'PART' ? 'bg-green-100 text-green-800' :
                                    tx.type === 'INTEREST' ? 'bg-yellow-100 text-yellow-800' :
                                    tx.type === 'FULL' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {tx.type === 'PART' ? 'Payment' : tx.type === 'FULL' ? 'Redeem' : tx.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-900 font-semibold">Rs. {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">No recent transactions</div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Upcoming Appointments */}
                  <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-yellow-600 mb-4">Upcoming Appointments</h3>
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingAppointments.map((apt) => (
                          <div key={apt.appointment_id} className="rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(apt.appointment_date)}</p>
                                <p className="text-xs text-gray-600">{formatTimeSlot(apt.time_slot_start, apt.time_slot_end)}</p>
                              </div>
                              <button onClick={() => setActiveAppointmentId(activeAppointmentId === apt.appointment_id ? null : apt.appointment_id)} className="text-xs font-semibold text-yellow-600 hover:text-yellow-700">
                                {activeAppointmentId === apt.appointment_id ? 'Hide' : 'View'}
                              </button>
                            </div>
                            {activeAppointmentId === apt.appointment_id && (
                              <div className="mt-2 text-xs text-gray-700 space-y-1">
                                <p><span className="font-semibold">Branch:</span> {apt.branch_name || '—'}</p>
                                <p><span className="font-semibold">Receipt:</span> {apt.receipt_no || '—'}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-gray-500 text-sm">No upcoming appointments</div>
                    )}
                  </div>

                  {/* Notifications Preview */}
                  <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-yellow-600 mb-4">Notifications</h3>
                    {notificationsPreview.length > 0 ? (
                      <div className="space-y-3">
                        {notificationsPreview.map((n, i) => (
                          <div key={i} className="text-sm text-gray-900 border-b border-gray-100 pb-2 last:border-0">
                            <p className="font-medium">{n.title || n.type || 'Notification'}</p>
                            <p className="text-gray-600 text-xs mt-0.5">{n.message}</p>
                          </div>
                        ))}
                        <button onClick={() => navigate('/customer/notifications')} className="text-sm font-semibold text-yellow-600 hover:text-yellow-700">View all</button>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-gray-500 text-sm">No notifications</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Quick Links */}
              <div className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm flex flex-wrap gap-4 justify-center">
                <button onClick={() => navigate('/customer/part-payments')} className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-600">Part Payments</button>
                <button onClick={() => navigate('/customer/receipts')} className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-600">My Receipts</button>
                <button onClick={() => navigate('/customer/appointments')} className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-600">Appointments</button>
                <button onClick={() => navigate('/customer/notifications')} className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-600">Notifications</button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
