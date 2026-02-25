import { useState, useEffect } from 'react'
import { Bell, X, Clock, AlertCircle, CheckCircle, CreditCard, Settings } from 'lucide-react'
import api from '../../services/api'
import CustomerHeader from '../../components/CustomerHeader'

const READ_IDS_KEY = 'customer_notifications_read'

// Helper function to format date and time
function formatDateTime(date) {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isToday = d.toDateString() === today.toDateString()
  const isYesterday = d.toDateString() === yesterday.toDateString()

  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  if (isToday) return `Today at ${time}`
  if (isYesterday) return `Yesterday at ${time}`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Helper function to get days ago
function getDaysAgo(date) {
  const d = new Date(date)
  const today = new Date()
  const diffTime = today - d
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function getReadIds() {
  try {
    const s = localStorage.getItem(READ_IDS_KEY)
    return s ? JSON.parse(s) : []
  } catch { return [] }
}
function setReadIds(ids) {
  try { localStorage.setItem(READ_IDS_KEY, JSON.stringify(ids)) } catch {}
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [readIds, setReadIdsState] = useState(getReadIds())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.getCustomerNotifications()
        setNotifications(res.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const markRead = (id) => {
    const next = [...new Set([...readIds, id])]
    setReadIdsState(next)
    setReadIds(next)
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [selectedNotification, setSelectedNotification] = useState(null)

  const isRead = (id) => readIds.includes(id)

  const filtered = notifications.filter(notif => {
    // Search filter
    const searchMatch =
      searchQuery === '' ||
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notif.receiptNo && notif.receiptNo.includes(searchQuery))

    // Type filter
    const typeMatch = typeFilter === 'All' || notif.type === typeFilter

    const statusMatch = statusFilter === 'All' || (statusFilter === 'Unread' ? !isRead(notif.id) : isRead(notif.id))

    let dateMatch = true
    if (dateFilter === 'Last 7 days') {
      dateMatch = getDaysAgo(notif.createdAt) <= 7
    } else if (dateFilter === 'Last 30 days') {
      dateMatch = getDaysAgo(notif.createdAt) <= 30
    }
    return searchMatch && typeMatch && statusMatch && dateMatch
  })

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map(n => n.id)
    setReadIdsState(allIds)
    setReadIds(allIds)
  }

  const handleClearRead = () => {
    setReadIdsState([])
    setReadIds([])
  }

  const handleViewDetails = (notif) => {
    markRead(notif.id)
    setSelectedNotification(notif)
  }

  // Get notification type icon and color
  function getNotificationType(type) {
    switch (type) {
      case 'REMINDER':
        return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', badge: 'Reminder' }
      case 'APPOINTMENT':
        return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', badge: 'Appointment' }
      case 'PAYMENT':
        return { icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100', badge: 'Payment' }
      case 'SYSTEM':
        return { icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100', badge: 'System' }
      default:
        return { icon: Bell, color: 'text-yellow-600', bg: 'bg-yellow-100', badge: 'Notification' }
    }
  }

  const unreadCount = notifications.filter(n => !isRead(n.id)).length

  return (
    <div className="min-h-screen bg-gray-100">
      <CustomerHeader />

      <main className="px-6 py-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header Section */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between border-b-2 border-yellow-500 pb-4 mb-4">
              <div>
                <h2 className="text-3xl font-bold text-yellow-600">Notifications</h2>
                <p className="text-gray-600 mt-2">Reminders, appointments, and payment updates</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleMarkAllAsRead}
                  className="rounded-lg border-2 border-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-50"
                >
                  Mark all as read
                </button>
                <button
                  onClick={handleClearRead}
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-600"
                >
                  Clear read
                </button>
              </div>
            </div>

            {/* Unread Badge */}
            {unreadCount > 0 && (
              <div className="mb-4 inline-block">
                <span className="text-sm font-bold text-yellow-600">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Filters Section */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Receipt no, keyword..."
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option>All</option>
                  <option>REMINDER</option>
                  <option>APPOINTMENT</option>
                  <option>PAYMENT</option>
                  <option>SYSTEM</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option>All</option>
                  <option>Unread</option>
                  <option>Read</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option>All</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
            ) : filtered.length > 0 ? (
              filtered.map((notif) => {
                const typeInfo = getNotificationType(notif.type)
                const Icon = typeInfo.icon

                return (
                  <button
                    key={notif.id}
                    onClick={() => handleViewDetails(notif)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      isRead(notif.id)
                        ? 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        : 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`rounded-lg ${typeInfo.bg} p-3 flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`font-bold ${
                              isRead(notif.id) ? 'text-gray-900' : 'text-yellow-900 font-bold'
                            }`}
                          >
                            {notif.title}
                          </p>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${typeInfo.bg} ${typeInfo.color}`}>
                            {typeInfo.badge}
                          </span>
                          {notif.reminderLevel && (
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                notif.reminderLevel === 3
                                  ? 'bg-red-100 text-red-700'
                                  : notif.reminderLevel === 2
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              Level {notif.reminderLevel}
                            </span>
                          )}
                          {!isRead(notif.id) && <div className="h-2 w-2 rounded-full bg-yellow-500"></div>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          {notif.receiptNo && (
                            <span className="bg-gray-100 px-2 py-1 rounded">Receipt: {notif.receiptNo}</span>
                          )}
                          <span className="text-gray-400">•</span>
                          <span>{formatDateTime(notif.createdAt || notif.created_at)}</span>
                        </div>
                      </div>

                      {/* View indicator */}
                      <div className="flex-shrink-0 text-gray-400">
                        <span className="text-sm">View →</span>
                      </div>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-12 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">No notifications</p>
                <p className="text-sm text-gray-500 mt-1">Your notifications will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-2xl w-full rounded-lg bg-white shadow-xl">
            {/* Modal Header */}
            <div className="border-b-2 border-yellow-500 flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg ${getNotificationType(selectedNotification.type).bg} p-3`}>
                  {(() => {
                    const Icon = getNotificationType(selectedNotification.type).icon
                    return <Icon className={`h-5 w-5 ${getNotificationType(selectedNotification.type).color}`} />
                  })()}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedNotification.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Message</p>
                <p className="text-gray-900">{selectedNotification.message}</p>
              </div>

              {selectedNotification.receiptNo && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Receipt Number</p>
                  <p className="text-gray-900 font-mono">{selectedNotification.receiptNo}</p>
                </div>
              )}

              {selectedNotification.type === 'REMINDER' && selectedNotification.meta && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Due Date</p>
                    <p className="text-gray-900">{selectedNotification.meta.dueDate}</p>
                  </div>
                  {selectedNotification.meta.interestAmount != null && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Interest Amount</p>
                      <p className="text-yellow-600 font-bold">Rs. {Number(selectedNotification.meta.interestAmount).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedNotification.type === 'APPOINTMENT' && selectedNotification.meta && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Appointment Date</p>
                      <p className="text-gray-900">{selectedNotification.meta.appointmentDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Time Slot</p>
                      <p className="text-gray-900">{selectedNotification.meta.timeSlot}</p>
                    </div>
                  </div>
                </>
              )}

              {selectedNotification.type === 'PAYMENT' && selectedNotification.meta && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedNotification.meta.paymentAmount != null && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Amount</p>
                      <p className="text-green-600 font-bold">Rs. {Number(selectedNotification.meta.paymentAmount).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedNotification.meta.paymentMethod && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Method</p>
                      <p className="text-gray-900">{selectedNotification.meta.paymentMethod}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Received: {formatDateTime(selectedNotification.createdAt || selectedNotification.created_at)}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setSelectedNotification(null)}
                className="rounded-lg border-2 border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
