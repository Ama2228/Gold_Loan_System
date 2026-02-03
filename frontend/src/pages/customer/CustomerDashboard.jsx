import { useState } from 'react'

export default function CustomerDashboard() {
  const [activeAppointmentId, setActiveAppointmentId] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [appointmentForm, setAppointmentForm] = useState({
    type: 'Renewal',
    ticketNumber: '',
    branch: 'Colombo Branch',
    date: '',
    timeSlot: ''
  })
  const [paymentForm, setPaymentForm] = useState({
    ticketNumber: '',
    amount: '',
    method: 'Card'
  })
  const [profileForm, setProfileForm] = useState({
    name: 'Customer Name',
    customerId: 'CUS001',
    email: 'customer@email.com',
    mobile: '+94 77 123 4567',
    otp: ''
  })

  const receiptAlerts = [
    { id: 'TCK12345', amount: '₨. 700,000.00', dueDate: '2026-02-05', status: 'Due Soon', days: 4 },
    { id: 'TCK12312', amount: '₨. 450,000.00', dueDate: '2026-01-26', status: 'Expired', days: -6 }
  ]

  const appointments = [
    {
      id: 'APT1001',
      ticketNumber: 'TCK12345',
      branch: 'Colombo Branch',
      timeSlot: '09:30 AM - 10:00 AM',
      date: '2026-02-03'
    },
    {
      id: 'APT1008',
      ticketNumber: 'TCK12312',
      branch: 'Kandy Branch',
      timeSlot: '02:00 PM - 02:30 PM',
      date: '2026-02-06'
    }
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

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target
    setAppointmentForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePaymentChange = (e) => {
    const { name, value } = e.target
    setPaymentForm(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
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
              <button className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50">My Receipts</button>
              <span className="text-black/40">|</span>
              <button className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50">Part Payments</button>
              <span className="text-black/40">|</span>
              <button className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50">Appointments</button>
              <span className="text-black/40">|</span>
              <button className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50">Notifications</button>
            </nav>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(prev => !prev)}
                  className="rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-black/30"
                >
                  Profile
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">Profile Details</p>
                      <p className="text-xs text-gray-500">Manage contact info with OTP validation</p>
                    </div>
                    <div className="space-y-3 px-4 py-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Customer</label>
                        <input
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Customer ID</label>
                        <input
                          type="text"
                          name="customerId"
                          value={profileForm.customerId}
                          onChange={handleProfileChange}
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile</label>
                        <input
                          type="text"
                          name="mobile"
                          value={profileForm.mobile}
                          onChange={handleProfileChange}
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">OTP Code</label>
                        <input
                          type="text"
                          name="otp"
                          value={profileForm.otp}
                          onChange={handleProfileChange}
                          placeholder="Enter OTP"
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <button className="rounded-md border border-yellow-400 px-3 py-1 text-xs font-semibold text-yellow-700 hover:bg-yellow-50">
                            Send OTP
                          </button>
                          <button className="rounded-md bg-yellow-500 px-3 py-1 text-xs font-semibold text-black hover:bg-yellow-600">
                            Verify & Update
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-6 py-8">
        <div className="max-w-6xl mx-auto rounded-lg bg-white shadow-lg p-8 space-y-8">
          <div className="border-b-2 border-yellow-500 pb-4">
            <h2 className="text-2xl font-bold text-yellow-600">Overview</h2>
            <p className="text-gray-600 mt-1">View your tickets, interest, appointments, and manage online services.</p>
          </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 border border-gray-200">
            <p className="text-sm font-semibold text-gray-600">Active Tickets</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
            <p className="text-xs text-gray-500 mt-1">Including 1 due soon</p>
          </div>
          <div className="rounded-lg bg-white p-6 border border-gray-200">
            <p className="text-sm font-semibold text-gray-600">Interest Due</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">₨. 60,750.00</p>
            <p className="text-xs text-gray-500 mt-1">Calculated up to today</p>
          </div>
          <div className="rounded-lg bg-white p-6 border border-gray-200">
            <p className="text-sm font-semibold text-gray-600">Upcoming Appointments</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
            <p className="text-xs text-gray-500 mt-1">Next in 2 days</p>
          </div>
        </div>

        {/* Alerts + Appointments */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg bg-white p-6 border border-gray-200">
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

            <div className="rounded-lg bg-white p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-yellow-600 mb-4">Pawning History & Interest</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-yellow-500 bg-yellow-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Receipt</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Article</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Pawned On</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Interest</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row) => (
                      <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{row.id}</td>
                        <td className="px-4 py-3 text-gray-600">{row.article}</td>
                        <td className="px-4 py-3 text-gray-600">{row.pawnedOn}</td>
                        <td className="px-4 py-3 text-gray-600">{row.amount}</td>
                        <td className="px-4 py-3 text-yellow-600 font-semibold">{row.interestToDate}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            row.status === 'Expired'
                              ? 'bg-red-100 text-red-800'
                              : row.status === 'Closed'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-yellow-600 mb-4">Nearest Appointments</h2>
              <div className="space-y-4">
                {appointments.map((appointment) => (
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
            </div>

            <div className="rounded-lg bg-white p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-yellow-600 mb-4">Make Appointment</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Service Type</label>
                  <select
                    name="type"
                    value={appointmentForm.type}
                    onChange={handleAppointmentChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  >
                    <option>Renewal</option>
                    <option>Redemption</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Receipt Number</label>
                  <input
                    type="text"
                    name="ticketNumber"
                    value={appointmentForm.ticketNumber}
                    onChange={handleAppointmentChange}
                    placeholder="TCK12345"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
                  <select
                    name="branch"
                    value={appointmentForm.branch}
                    onChange={handleAppointmentChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  >
                    <option>Colombo Branch</option>
                    <option>Kandy Branch</option>
                    <option>Galle Branch</option>
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={appointmentForm.date}
                      onChange={handleAppointmentChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time Slot</label>
                    <select
                      name="timeSlot"
                      value={appointmentForm.timeSlot}
                      onChange={handleAppointmentChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    >
                      <option value="">Select Slot</option>
                      <option>09:00 AM - 09:30 AM</option>
                      <option>10:00 AM - 10:30 AM</option>
                      <option>02:00 PM - 02:30 PM</option>
                    </select>
                  </div>
                </div>
                <button className="w-full rounded-lg bg-yellow-500 px-6 py-3 text-black font-semibold hover:bg-yellow-600 transition-colors">
                  Submit Appointment
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-yellow-600 mb-4">Online Part Payment</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Receipt Number</label>
                  <input
                    type="text"
                    name="ticketNumber"
                    value={paymentForm.ticketNumber}
                    onChange={handlePaymentChange}
                    placeholder="TCK12345"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                  <input
                    type="text"
                    name="amount"
                    value={paymentForm.amount}
                    onChange={handlePaymentChange}
                    placeholder="₨. 10,000.00"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                  <select
                    name="method"
                    value={paymentForm.method}
                    onChange={handlePaymentChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  >
                    <option>Card</option>
                    <option>Bank Transfer</option>
                    <option>Mobile Payment</option>
                  </select>
                </div>
                <button className="w-full rounded-lg border-2 border-yellow-500 px-6 py-3 text-yellow-600 font-semibold hover:bg-yellow-50 transition-colors">
                  Pay Online
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