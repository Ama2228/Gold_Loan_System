import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'

// Helper function to generate time slots
function generateTimeSlots(startHour = 9, endHour = 14, intervalMinutes = 30) {
  const slots = []
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const start = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      const endMinute = minute + intervalMinutes
      const endHourFinal = hour + Math.floor(endMinute / 60)
      const endMin = endMinute % 60
      const end = `${String(endHourFinal).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`
      slots.push({ start, end, key: `${start}-${end}` })
    }
  }
  return slots
}

// Helper function to get slot key for availability lookup
function getSlotKey(startTime) {
  return startTime
}

export default function Appointments() {
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Dummy data - Active receipts for dropdown
  const activeReceipts = [
    { id: '0001-25000001', amount: 700000 },
    { id: '0003-25000023', amount: 550000 },
    { id: '0004-25000034', amount: 320000 }
  ]

  // Dummy data - Branches
  const branches = [
    { id: 'COL-001', name: 'Colombo Branch' },
    { id: 'KDY-002', name: 'Kandy Branch' },
    { id: 'MTR-003', name: 'Matara Branch' }
  ]

  // Dummy appointments data
  const [appointments, setAppointments] = useState([
    {
      id: 'APT001',
      date: '2026-02-11',
      timeSlot: '09:00-09:30',
      receiptNo: '0001-25000001',
      purpose: 'Renew',
      branch: 'Colombo Branch',
      status: 'APPROVED'
    },
    {
      id: 'APT002',
      date: '2026-02-13',
      timeSlot: '10:00-10:30',
      receiptNo: '0003-25000023',
      purpose: 'Redeem',
      branch: 'Kandy Branch',
      status: 'PENDING'
    },
    {
      id: 'APT003',
      date: '2026-02-15',
      timeSlot: '13:30-14:00',
      receiptNo: '0001-25000001',
      purpose: 'Renew',
      branch: 'Colombo Branch',
      status: 'COMPLETED'
    }
  ])

  // Dummy slot availability (slots used per date and time)
  const [slotAvailability, setSlotAvailability] = useState({
    '2026-02-11': {
      '09:00': 2,
      '09:30': 5,
      '10:00': 1,
      '10:30': 3,
      '11:00': 0,
      '11:30': 4,
      '12:00': 2,
      '12:30': 5,
      '13:00': 1,
      '13:30': 3
    },
    '2026-02-12': {
      '09:00': 1,
      '09:30': 2,
      '10:00': 3,
      '10:30': 0,
      '11:00': 2,
      '11:30': 1,
      '12:00': 4,
      '12:30': 3,
      '13:00': 5,
      '13:30': 1
    }
  })

  // Form state
  const [purpose, setPurpose] = useState('')
  const [receiptNo, setReceiptNo] = useState('')
  const [branch, setBranch] = useState(branches[0].id)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [notes, setNotes] = useState('')
  const [formErrors, setFormErrors] = useState({})

  // Filter state
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateRangeFilter, setDateRangeFilter] = useState('Upcoming')

  // Get time slots for selected date
  const timeSlots = generateTimeSlots()
  const dateSlotAvailability = appointmentDate ? (slotAvailability[appointmentDate] || {}) : {}

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const statusMatch = statusFilter === 'All' || apt.status === statusFilter
    const today = new Date('2026-02-10')
    const aptDate = new Date(apt.date)
    const dateMatch =
      dateRangeFilter === 'Upcoming' ? aptDate >= today : aptDate < today
    return statusMatch && dateMatch
  })

  const validateForm = () => {
    const errors = {}
    if (!purpose) errors.purpose = 'Please select a purpose'
    if (!receiptNo) errors.receiptNo = 'Please select a receipt'
    if (!branch) errors.branch = 'Please select a branch'
    if (!appointmentDate) errors.appointmentDate = 'Please select a date'
    if (!selectedTimeSlot) errors.selectedTimeSlot = 'Please select a time slot'
    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validateForm()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Create new appointment
    const newAppointment = {
      id: `APT${Date.now()}`,
      date: appointmentDate,
      timeSlot: selectedTimeSlot,
      receiptNo: receiptNo,
      purpose: purpose,
      branch: branches.find(b => b.id === branch)?.name || branch,
      status: 'PENDING'
    }

    setAppointments([...appointments, newAppointment])
    setShowSuccess(true)

    // Reset form
    setPurpose('')
    setReceiptNo('')
    setBranch(branches[0].id)
    setAppointmentDate('')
    setSelectedTimeSlot('')
    setNotes('')
    setFormErrors({})

    setTimeout(() => setShowSuccess(false), 3000)
  }

  const isFormValid =
    purpose &&
    receiptNo &&
    branch &&
    appointmentDate &&
    selectedTimeSlot &&
    Object.keys(validateForm()).length === 0

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
              <button className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50 bg-yellow-700/50">
                Appointments
              </button>
              <span className="text-black/40">|</span>
              <button className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50">
                Notifications
              </button>
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
                    </div>
                    <div className="space-y-3 px-4 py-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          defaultValue="Customer Name"
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Customer ID
                        </label>
                        <input
                          type="text"
                          defaultValue="CUS001"
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900"
                          readOnly
                        />
                      </div>
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

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Appointment submitted successfully (demo)</span>
        </div>
      )}

      <main className="px-6 py-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-8 mb-8">
            <div className="border-b-2 border-yellow-500 pb-4 mb-2">
              <h2 className="text-3xl font-bold text-yellow-600">Appointments</h2>
              <p className="text-gray-600 mt-2">
                View and manage your service appointments
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
            {/* Left Column: My Appointments */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">My Appointments</h3>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option>All</option>
                    <option>PENDING</option>
                    <option>APPROVED</option>
                    <option>COMPLETED</option>
                    <option>CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date Range</label>
                  <select
                    value={dateRangeFilter}
                    onChange={(e) => setDateRangeFilter(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Past">Past</option>
                  </select>
                </div>
              </div>

              {/* Appointments Table */}
              {filteredAppointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-yellow-500">
                        <th className="text-left py-2 px-2 font-bold text-gray-900">Date</th>
                        <th className="text-left py-2 px-2 font-bold text-gray-900">Time</th>
                        <th className="text-left py-2 px-2 font-bold text-gray-900">Receipt No</th>
                        <th className="text-left py-2 px-2 font-bold text-gray-900">Purpose</th>
                        <th className="text-left py-2 px-2 font-bold text-gray-900">Branch</th>
                        <th className="text-left py-2 px-2 font-bold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-2 text-gray-900 font-semibold">{apt.date}</td>
                          <td className="py-3 px-2 text-gray-600 text-xs">{apt.timeSlot}</td>
                          <td className="py-3 px-2 text-gray-900">{apt.receiptNo}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                apt.purpose === 'Renew'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {apt.purpose}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-600 text-xs">{apt.branch}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                apt.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : apt.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-700'
                                  : apt.status === 'COMPLETED'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center py-8">No appointments yet.</p>
              )}
            </div>

            {/* Right Column: Make Appointment Form */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Make Appointment</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Purpose */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="purpose"
                        value="Renew"
                        checked={purpose === 'Renew'}
                        onChange={(e) => {
                          setPurpose(e.target.value)
                          setFormErrors({ ...formErrors, purpose: '' })
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Renew</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="purpose"
                        value="Redeem"
                        checked={purpose === 'Redeem'}
                        onChange={(e) => {
                          setPurpose(e.target.value)
                          setFormErrors({ ...formErrors, purpose: '' })
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Redeem</span>
                    </label>
                  </div>
                  {formErrors.purpose && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.purpose}
                    </p>
                  )}
                </div>

                {/* Receipt Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Receipt Number <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={receiptNo}
                    onChange={(e) => {
                      setReceiptNo(e.target.value)
                      setFormErrors({ ...formErrors, receiptNo: '' })
                    }}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Select receipt</option>
                    {activeReceipts.map((receipt) => (
                      <option key={receipt.id} value={receipt.id}>
                        {receipt.id} (Rs. {receipt.amount.toLocaleString()})
                      </option>
                    ))}
                  </select>
                  {formErrors.receiptNo && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.receiptNo}
                    </p>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => {
                      setBranch(e.target.value)
                      setFormErrors({ ...formErrors, branch: '' })
                    }}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.branch && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.branch}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => {
                        setAppointmentDate(e.target.value)
                        setSelectedTimeSlot('')
                        setFormErrors({ ...formErrors, appointmentDate: '' })
                      }}
                      min={new Date('2026-02-10').toISOString().split('T')[0]}
                      className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  {formErrors.appointmentDate && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.appointmentDate}
                    </p>
                  )}
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time Slot <span className="text-red-500">*</span>
                  </label>
                  {appointmentDate ? (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {timeSlots.map((slot) => {
                        const used = dateSlotAvailability[slot.start] || 0
                        const isFull = used >= 5
                        const isSelected = selectedTimeSlot === slot.key

                        return (
                          <button
                            key={slot.key}
                            type="button"
                            onClick={() => {
                              if (!isFull) {
                                setSelectedTimeSlot(slot.key)
                                setFormErrors({ ...formErrors, selectedTimeSlot: '' })
                              }
                            }}
                            disabled={isFull}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-yellow-500 bg-yellow-50'
                                : isFull
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                                : 'border-gray-200 bg-white hover:border-yellow-300'
                            }`}
                          >
                            <p className="text-xs font-semibold text-gray-900">
                              {slot.start} - {slot.end}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                isFull ? 'text-red-600 font-bold' : 'text-gray-600'
                              }`}
                            >
                              {isFull ? 'Full' : `${used}/5`}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                      Select a date to view available slots
                    </p>
                  )}
                  {formErrors.selectedTimeSlot && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.selectedTimeSlot}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special requests or notes..."
                    rows="3"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/customer')}
                    className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      isFormValid
                        ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
