import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X, Clock, AlertCircle, CheckCircle, CreditCard, Settings } from 'lucide-react'

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

export default function Notifications() {
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Dummy notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 'notif001',
      type: 'REMINDER',
      title: '1st Due Date Reminder',
      message: 'Your receipt 0001-25000001 is due on 2026-02-05. Please arrange to renew or redeem soon.',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      isRead: false,
      receiptNo: '0001-25000001',
      reminderLevel: 1,
      meta: { dueDate: '2026-02-05', interestAmount: 15000 }
    },
    {
      id: 'notif002',
      type: 'APPOINTMENT',
      title: 'Appointment Approved',
      message: 'Your appointment for renewal on 2026-02-13 at 10:00 AM has been approved.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      receiptNo: '0003-25000023',
      meta: { appointmentDate: '2026-02-13', timeSlot: '10:00-10:30' }
    },
    {
      id: 'notif003',
      type: 'PAYMENT',
      title: 'Payment Received',
      message: 'We received your part payment of Rs. 25,000 for receipt 0001-25000001.',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isRead: true,
      receiptNo: '0001-25000001',
      meta: { paymentAmount: 25000, paymentMethod: 'Card', date: '2026-02-08' }
    },
    {
      id: 'notif004',
      type: 'REMINDER',
      title: '2nd Due Date Reminder',
      message: 'Your receipt 0003-25000023 is overdue since 2026-01-26. Please renew or redeem immediately.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      receiptNo: '0003-25000023',
      reminderLevel: 2,
      meta: { dueDate: '2026-01-26', interestAmount: 28250 }
    },
    {
      id: 'notif005',
      type: 'SYSTEM',
      title: 'Security Alert',
      message: 'Your password was successfully changed. If this was not you, please contact support immediately.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isRead: true,
      meta: { date: '2026-02-08' }
    },
    {
      id: 'notif006',
      type: 'APPOINTMENT',
      title: 'Appointment Cancelled',
      message: 'Your appointment on 2026-02-10 has been cancelled. Please book a new appointment.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isRead: true,
      meta: { appointmentDate: '2026-02-10', timeSlot: '09:00-09:30' }
    },
    {
      id: 'notif007',
      type: 'REMINDER',
      title: '3rd Due Date Reminder',
      message: 'URGENT: Receipt 0001-25000001 is due for immediate action. Auction may proceed if not renewed.',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      isRead: true,
      receiptNo: '0001-25000001',
      reminderLevel: 3,
      meta: { dueDate: '2026-02-05', interestAmount: 15000 }
    },
    {
      id: 'notif008',
      type: 'PAYMENT',
      title: 'Redemption Completed',
      message: 'Your redemption request for receipt 0002-25000012 has been completed. Please collect your items.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isRead: true,
      receiptNo: '0002-25000012',
      meta: { paymentAmount: 450000, date: '2026-02-05' }
    }
  ])

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')

  // Detail modal state
  const [selectedNotification, setSelectedNotification] = useState(null)

  // Filter notifications
  const filtered = notifications.filter(notif => {
    // Search filter
    const searchMatch =
      searchQuery === '' ||
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notif.receiptNo && notif.receiptNo.includes(searchQuery))

    // Type filter
    const typeMatch = typeFilter === 'All' || notif.type === typeFilter

    // Status filter
    const statusMatch = statusFilter === 'All' || (statusFilter === 'Unread' ? !notif.isRead : notif.isRead)

    // Date filter
    let dateMatch = true
    if (dateFilter === 'Last 7 days') {
      dateMatch = getDaysAgo(notif.createdAt) <= 7
    } else if (dateFilter === 'Last 30 days') {
      dateMatch = getDaysAgo(notif.createdAt) <= 30
    }

    return searchMatch && typeMatch && statusMatch && dateMatch
  })

  // Actions
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
  }

  const handleClearRead = () => {
    setNotifications(notifications.filter(n => !n.isRead))
  }

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const handleViewDetails = (notif) => {
    handleMarkAsRead(notif.id)
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

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black font-bold text-yellow-400 shadow-md">
                SG
              </div>
              <div>
                <h1 className="text-lg font-bold text-black">Smart Gold</h1>
                <p className="text-xs text-black/70">Customer Dashboard</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-3 text-sm font-semibold text-black">
              <button
                onClick={() => navigate('/customer')}
                className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50"
              >
                Overview
              </button>
              <span className="text-black/40">|</span>
              <button
                onClick={() => navigate('/customer/receipts')}
                className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50"
              >
                My Receipts
              </button>
              <span className="text-black/40">|</span>
              <button
                onClick={() => navigate('/customer/part-payments')}
                className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50"
              >
                Part Payments
              </button>
              <span className="text-black/40">|</span>
              <button
                onClick={() => navigate('/customer/appointments')}
                className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50"
              >
                Appointments
              </button>
              <span className="text-black/40">|</span>
              <button className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50 bg-yellow-700/50">
                Notifications
              </button>
              <span className="text-black/40">|</span>
              <button
                onClick={() => navigate('/customer/profile')}
                className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50"
              >
                Profile
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(prev => !prev)}
                  className="rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-black/30"
                >
                  Settings
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">Account Settings</p>
                    </div>
                    <div className="space-y-3 px-4 py-4">
                      <button
                        onClick={() => navigate('/customer/profile')}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-yellow-50 text-sm font-semibold text-gray-700"
                      >
                        Edit Profile
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-md hover:bg-yellow-50 text-sm font-semibold text-gray-700">
                        Notification Settings
                      </button>
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-red-50 text-sm font-semibold text-red-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate('/login')}
                className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

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
            {filtered.length > 0 ? (
              filtered.map((notif) => {
                const typeInfo = getNotificationType(notif.type)
                const Icon = typeInfo.icon

                return (
                  <button
                    key={notif.id}
                    onClick={() => handleViewDetails(notif)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      notif.isRead
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
                              notif.isRead ? 'text-gray-900' : 'text-yellow-900 font-bold'
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
                          {!notif.isRead && <div className="h-2 w-2 rounded-full bg-yellow-500"></div>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          {notif.receiptNo && (
                            <span className="bg-gray-100 px-2 py-1 rounded">Receipt: {notif.receiptNo}</span>
                          )}
                          <span className="text-gray-400">•</span>
                          <span>{formatDateTime(notif.createdAt)}</span>
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
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Due Date</p>
                      <p className="text-gray-900">{selectedNotification.meta.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Interest Amount</p>
                      <p className="text-yellow-600 font-bold">Rs. {selectedNotification.meta.interestAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </>
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
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Amount</p>
                      <p className="text-green-600 font-bold">Rs. {selectedNotification.meta.paymentAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Method</p>
                      <p className="text-gray-900">{selectedNotification.meta.paymentMethod}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Received: {formatDateTime(selectedNotification.createdAt)}
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
