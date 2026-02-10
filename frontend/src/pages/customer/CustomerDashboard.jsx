import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [activeAppointmentId, setActiveAppointmentId] = useState(null)
  const [profileForm, setProfileForm] = useState({
    name: 'Customer Name',
    customerId: 'CUS001',
    email: 'customer@email.com',
    mobile: '+94 77 123 4567',
    otp: ''
  })

  // Dummy data for active receipts
  const activeReceipts = [
    { id: 'TCK12345', loanAmount: 700000, status: 'Active', article: 'Gold Chain', date: '2025-08-05' },
    { id: 'TCK12312', loanAmount: 450000, status: 'Active', article: 'Gold Ring', date: '2025-07-26' }
  ]

  // Dummy data for appointments
  const appointments = [
    {
      id: 'APT1001',
      ticketNumber: 'TCK12345',
      branch: 'Colombo Branch',
      timeSlot: '09:30 AM - 10:00 AM',
      date: '2026-02-11' // Tomorrow
    },
    {
      id: 'APT1008',
      ticketNumber: 'TCK12312',
      branch: 'Kandy Branch',
      timeSlot: '02:00 PM - 02:30 PM',
      date: '2026-02-06' // Past date
    }
  ]

  // Dummy data for recent transactions
  const allTransactions = [
    { receiptNo: 'TCK12345', date: '2026-02-08', type: 'Payment', amount: 15000 },
    { receiptNo: 'TCK12312', date: '2026-02-05', type: 'Renew', amount: 28250 },
    { receiptNo: 'TCK12110', date: '2026-01-28', type: 'Redeem', amount: 320000 },
    { receiptNo: 'TCK12345', date: '2026-01-15', type: 'Payment', amount: 10000 },
    { receiptNo: 'TCK12890', date: '2026-01-10', type: 'Pawn', amount: 500000 },
    { receiptNo: 'TCK12312', date: '2025-12-20', type: 'Payment', amount: 5000 }
  ]

  const receiptAlerts = [
    { id: 'TCK12345', amount: '₨. 700,000.00', dueDate: '2026-02-05', status: 'Due Soon', days: 4 },
    { id: 'TCK12312', amount: '₨. 450,000.00', dueDate: '2026-01-26', status: 'Expired', days: -6 }
  ]

  const history = [
    {
      id: 'TCK12345',
      article: 'Gold Chain',
      pawnedOn: '2025-08-05',
      amount: '₨. 700,000.00',
      interestToDate: '₨. 32,500.00',
      status: 'Active'
    },
    {
      id: 'TCK12312',
      article: 'Gold Ring',
      pawnedOn: '2025-07-26',
      amount: '₨. 450,000.00',
      interestToDate: '₨. 28,250.00',
      status: 'Expired'
    },
    {
      id: 'TCK12110',
      article: 'Bangles',
      pawnedOn: '2025-03-18',
      amount: '₨. 320,000.00',
      interestToDate: '₨. 0.00',
      status: 'Closed'
    }
  ]

  // Helper function: Filter appointments for tomorrow
  const filterTomorrowAppointments = () => {
    const today = new Date('2026-02-10') // Current date
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    
    return appointments.filter(apt => apt.date === tomorrowStr)
  }

  // Helper function: Calculate total loan amount
  const calculateTotalLoanAmount = () => {
    return activeReceipts
      .filter(receipt => receipt.status === 'Active')
      .reduce((sum, receipt) => sum + receipt.loanAmount, 0)
  }

  // Helper function: Get latest 5 transactions
  const getLatestTransactions = () => {
    return allTransactions.slice(0, 5)
  }

  const tomorrowAppointments = filterTomorrowAppointments()
  const totalLoanAmount = calculateTotalLoanAmount()
  const latestTransactions = getLatestTransactions()

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
              <button
                onClick={() => navigate('/customer/notifications')}
                className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50"
              >
                Notifications
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => navigate('/customer/profile')}
                  className="rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-black/30"
                >
                  Profile
                </button>
              </div>
              <button className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-6 py-8">
        <div className="max-w-[1400px] mx-auto rounded-lg bg-white shadow-sm border border-gray-200 p-8 space-y-8">
          <div className="border-b-2 border-yellow-500 pb-4">
            <h2 className="text-3xl font-bold text-yellow-600">Overview</h2>
            <p className="text-gray-600 mt-2">View your tickets, interest, appointments, and manage online services.</p>
          </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-6 border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-700">Active Receipts</p>
            <p className="text-4xl font-bold text-gray-900 mt-3">{activeReceipts.length}</p>
            <p className="text-xs text-gray-600 mt-2">Current active pawning receipts</p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 border border-yellow-200 shadow-sm">
            <p className="text-sm font-semibold text-yellow-700">Total Loan Amount</p>
            <p className="text-4xl font-bold text-yellow-700 mt-3">Rs. {totalLoanAmount.toFixed(2)}</p>
            <p className="text-xs text-yellow-600 mt-2">Sum of all active loans</p>
          </div>
        </div>

        {/* Alerts + Appointments */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-yellow-600 mb-4">Receipts Near Due Date</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-yellow-500 bg-yellow-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Receipt</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Due Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptAlerts.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{item.id}</td>
                        <td className="px-4 py-3 text-gray-600">{item.amount}</td>
                        <td className="px-4 py-3 text-gray-600">{item.dueDate}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === 'Expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status} ({item.days}d)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-yellow-600 mb-4">Nearest Transaction Receipts</h2>
              {latestTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-yellow-500 bg-yellow-50">
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Receipt No</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Transaction Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestTransactions.map((transaction, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 font-medium">{transaction.receiptNo}</td>
                          <td className="px-4 py-3 text-gray-600">{transaction.date}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              transaction.type === 'Pawn'
                                ? 'bg-blue-100 text-blue-800'
                                : transaction.type === 'Payment'
                                  ? 'bg-green-100 text-green-800'
                                  : transaction.type === 'Renew'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-purple-100 text-purple-800'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-semibold">Rs. {transaction.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No data available</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-yellow-600 mb-4">Nearest Appointments</h2>
              {tomorrowAppointments.length > 0 ? (
                <div className="space-y-4">
                  {tomorrowAppointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{appointment.date}</p>
                          <p className="text-xs text-gray-600">{appointment.timeSlot}</p>
                        </div>
                        <button
                          onClick={() => setActiveAppointmentId(
                            activeAppointmentId === appointment.id ? null : appointment.id
                          )}
                          className="text-sm font-semibold text-yellow-600 hover:text-yellow-700"
                        >
                          {activeAppointmentId === appointment.id ? 'Hide' : 'View'}
                        </button>
                      </div>
                      {activeAppointmentId === appointment.id && (
                        <div className="mt-3 text-sm text-gray-700 space-y-1">
                          <p><span className="font-semibold">Branch:</span> {appointment.branch}</p>
                          <p><span className="font-semibold">Receipt:</span> {appointment.ticketNumber}</p>
                          <p><span className="font-semibold">Appointment No:</span> {appointment.id}</p>
                          <p><span className="font-semibold">Time Slot:</span> {appointment.timeSlot}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No appointments for tomorrow.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  )
}