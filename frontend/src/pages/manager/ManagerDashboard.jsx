import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, AlertCircle, Clock, RotateCcw, CheckCircle, LogOut, ChevronDown } from 'lucide-react'

export default function ManagerDashboard() {
  const navigate = useNavigate()
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)

  // Dummy data for overdue tickets
  const overdueTickets = [
    { id: 'TCK001', receiptNo: '0001-25000001', customerNic: '198765432109', customerName: 'John Doe', dueDate: '2026-01-05', daysOverdue: 36, loanAmount: 700000 },
    { id: 'TCK002', receiptNo: '0001-25000023', customerNic: '198765432110', customerName: 'Jane Smith', dueDate: '2026-01-12', daysOverdue: 29, loanAmount: 450000 },
    { id: 'TCK003', receiptNo: '0001-25000045', customerNic: '198765432111', customerName: 'Robert Wilson', dueDate: '2026-01-20', daysOverdue: 21, loanAmount: 580000 },
    { id: 'TCK004', receiptNo: '0001-25000067', customerNic: '198765432112', customerName: 'Mary Johnson', dueDate: '2026-01-28', daysOverdue: 13, loanAmount: 320000 },
    { id: 'TCK005', receiptNo: '0001-25000089', customerNic: '198765432113', customerName: 'David Brown', dueDate: '2026-02-03', daysOverdue: 7, loanAmount: 600000 }
  ]

  // Dummy data for due today tickets
  const dueTodayTickets = [
    { id: 'TCK006', receiptNo: '0002-25000012', customerNic: '198765432114', customerName: 'Sarah Davis', dueDate: '2026-02-10', loanAmount: 400000 },
    { id: 'TCK007', receiptNo: '0002-25000034', customerNic: '198765432115', customerName: 'Michael Lee', dueDate: '2026-02-10', loanAmount: 750000 },
    { id: 'TCK008', receiptNo: '0002-25000056', customerNic: '198765432116', customerName: 'Emily Taylor', dueDate: '2026-02-10', loanAmount: 525000 },
    { id: 'TCK009', receiptNo: '0002-25000078', customerNic: '198765432117', customerName: 'James Anderson', dueDate: '2026-02-10', loanAmount: 600000 },
    { id: 'TCK010', receiptNo: '0003-25000010', customerNic: '198765432118', customerName: 'Patricia Martin', dueDate: '2026-02-10', loanAmount: 320000 }
  ]

  // Dummy data for reverse pawning requests
  const reverseRequests = [
    { id: 'REV001', receiptNo: '0001-25000001', requestedDate: '2026-02-08', status: 'Pending', reason: 'Customer requests early redemption' },
    { id: 'REV002', receiptNo: '0001-25000045', requestedDate: '2026-02-07', status: 'Approved', reason: 'Additional funds needed' },
    { id: 'REV003', receiptNo: '0002-25000012', requestedDate: '2026-02-06', status: 'Pending', reason: 'Business expansion loan' },
    { id: 'REV004', receiptNo: '0002-25000034', requestedDate: '2026-02-05', status: 'Rejected', reason: 'Item valuation insufficient' },
    { id: 'REV005', receiptNo: '0003-25000010', requestedDate: '2026-02-04', status: 'Approved', reason: 'Emergency medical expenses' }
  ]

  // Dummy auction data
  const auctionSummary = {
    pending: 12,
    scheduled: 8,
    sold: 34
  }

  // Dummy counts
  const stats = {
    activeTickets: 145,
    overdueTickets: 12,
    dueTodayTickets: 5,
    reverseRequests: 18
  }

  const handleLogout = () => {
    navigate('/login')
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
                  Branch 0001 - Colombo Central
                </span>
              </div>
            </div>
            <div className="flex gap-3">
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
            {/* Total Active Tickets */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">Active Tickets</h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.activeTickets}</p>
              <p className="text-xs text-gray-500 mt-2">Branch total</p>
            </div>

            {/* Total Overdue */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">Overdue Tickets</h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.overdueTickets}</p>
              <p className="text-xs text-gray-500 mt-2">Urgent action needed</p>
            </div>

            {/* Due Today */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">Due Today</h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.dueTodayTickets}</p>
              <p className="text-xs text-gray-500 mt-2">Requires attention</p>
            </div>

            {/* Reverse Pawning Requests */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">Reverse Pawning</h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <RotateCcw className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.reverseRequests}</p>
              <p className="text-xs text-gray-500 mt-2">Pending & approved</p>
            </div>
          </div>

          {/* Main Content - 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - 60% */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overdue Tickets Section */}
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-bold text-yellow-600 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Overdue Tickets (Top 5)
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Receipt No</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Days Over</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Loan Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {overdueTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{ticket.receiptNo}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div>{ticket.customerName}</div>
                            <div className="text-xs text-gray-500">{ticket.customerNic}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{ticket.dueDate}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                              {ticket.daysOverdue}d
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            ₨. {ticket.loanAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button className="rounded-lg bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 hover:bg-yellow-200">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Due Today Section */}
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-bold text-yellow-600 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Due Today (Top 5)
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Receipt No</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Loan Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dueTodayTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{ticket.receiptNo}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div>{ticket.customerName}</div>
                            <div className="text-xs text-gray-500">{ticket.customerNic}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{ticket.dueDate}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            ₨. {ticket.loanAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
                              Due Today
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - 40% */}
            <div className="space-y-8">
              {/* Reverse Pawning Requests Card */}
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-bold text-yellow-600 flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Reverse Requests (Top 5)
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {reverseRequests.map((req) => (
                    <div key={req.id} className="rounded-lg border border-gray-200 p-4 hover:border-yellow-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{req.receiptNo}</p>
                          <p className="text-xs text-gray-500 mt-1">{req.reason}</p>
                        </div>
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${getStatusBadgeStyle(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">Requested: {req.requestedDate}</p>
                      <div className="flex gap-2">
                        {req.status === 'Pending' && (
                          <>
                            <button className="flex-1 rounded-lg bg-green-100 px-3 py-2 text-xs font-semibold text-green-800 hover:bg-green-200">
                              Approve
                            </button>
                            <button className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-200">
                              Reject
                            </button>
                          </>
                        )}
                        {req.status !== 'Pending' && (
                          <button className="w-full rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-200">
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auction Monitoring Card */}
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-bold text-yellow-600">Auction Monitoring</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Pending</p>
                      <p className="text-2xl font-bold text-blue-900">{auctionSummary.pending}</p>
                    </div>
                    <div className="rounded-lg bg-orange-50 p-4 border border-orange-200">
                      <p className="text-xs text-orange-600 font-semibold mb-1">Scheduled</p>
                      <p className="text-2xl font-bold text-orange-900">{auctionSummary.scheduled}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                      <p className="text-xs text-green-600 font-semibold mb-1">Sold</p>
                      <p className="text-2xl font-bold text-green-900">{auctionSummary.sold}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/manager/auction')}
                    className="w-full rounded-lg bg-yellow-500 px-4 py-3 text-sm font-semibold text-black hover:bg-yellow-600 transition-colors"
                  >
                    Open Auction List
                  </button>
                </div>
              </div>

              {/* Manager Links Card */}
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-bold text-yellow-600">Quick Links</h2>
                </div>
                <div className="p-6 space-y-3">
                  <button
                    onClick={() => navigate('/manager/reverse-pawning')}
                    className="w-full rounded-lg bg-purple-50 px-4 py-3 text-left text-sm font-semibold text-purple-800 hover:bg-purple-100 transition-colors"
                  >
                    → Reverse Pawning Management
                  </button>
                  <button
                    onClick={() => navigate('/manager/branch-performance')}
                    className="w-full rounded-lg bg-blue-50 px-4 py-3 text-left text-sm font-semibold text-blue-800 hover:bg-blue-100 transition-colors"
                  >
                    → Branch Performance
                  </button>
                  <button
                    onClick={() => navigate('/manager/reports')}
                    className="w-full rounded-lg bg-green-50 px-4 py-3 text-left text-sm font-semibold text-green-800 hover:bg-green-100 transition-colors"
                  >
                    → Manager Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
