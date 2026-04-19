import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import CustomerHeader from '../../components/CustomerHeader'

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

function getDayOfWeek(dateStr) {
  if (!dateStr) return null
  const d = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d.getDay()
}

function getStatusLabel(status) {
  if (status === 'PENDING' || status === 'APPROVED') return 'Booked'
  if (status === 'COMPLETED') return 'Completed'
  if (status === 'CANCELLED') return 'Cancelled'
  return status || '—'
}

function extractBranchCodeFromReceipt(receiptNo) {
  const text = String(receiptNo || '')
  const match = text.match(/(\d{4})/)
  return match ? match[1] : ''
}

export default function Appointments() {
  const navigate = useNavigate()
  const [showSuccess, setShowSuccess] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [activeReceipts, setActiveReceipts] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState(null)
  const [cancelLoadingId, setCancelLoadingId] = useState(null)

  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsForDate, setSlotsForDate] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [apptRes, receiptsRes, branchesRes] = await Promise.all([
          api.getCustomerAppointments(),
          api.getCustomerReceipts(),
          api.getCustomerBranches()
        ])
        setAppointments(apptRes.data || [])
        setActiveReceipts((receiptsRes.data || []).map(r => ({
          ticket_id: r.ticket_id,
          receipt_no: r.receipt_no,
          loan_amount: r.loan_amount
        })))
        setBranches((branchesRes.data || []).map(b => ({
          id: b.branch_id,
          name: b.branch_name,
          code: String(b.branch_code || '')
        })))
      } catch (err) {
        console.error('Load appointments error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Form state
  const [purpose, setPurpose] = useState('')
  const [ticketId, setTicketId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [notes, setNotes] = useState('')
  const [formErrors, setFormErrors] = useState({})

  // Filter state
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateRangeFilter, setDateRangeFilter] = useState('Upcoming')

  const selectedReceipt = activeReceipts.find(r => String(r.ticket_id) === String(ticketId)) || null
  const selectedReceiptBranchCode = extractBranchCodeFromReceipt(selectedReceipt?.receipt_no)
  const selectedBranch = branches.find(b => b.code === selectedReceiptBranchCode) || null
  const selectedBranchId = selectedBranch ? String(selectedBranch.id) : ''
  const selectedDateDay = getDayOfWeek(appointmentDate)
  const isSunday = selectedDateDay === 0
  const isSaturday = selectedDateDay === 6

  // Fetch slot availability when branch and date are selected
  useEffect(() => {
    if (!selectedBranchId || !appointmentDate) {
      setSlotsForDate([])
      return
    }
    setSlotsLoading(true)
    setSelectedTimeSlot('')
    api.getCustomerSlotAvailability(selectedBranchId, appointmentDate)
      .then((res) => {
        setSlotsForDate(res.data || [])
      })
      .catch(() => setSlotsForDate([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedBranchId, appointmentDate])

  const fallbackSlots = isSunday
    ? []
    : generateTimeSlots(9, isSaturday ? 12 : 14).map((s) => ({ ...s, used: 0, capacity: 5 }))

  const rawTimeSlots = slotsForDate.length > 0 ? slotsForDate : fallbackSlots
  const timeSlots = isSaturday
    ? rawTimeSlots.filter((slot) => {
        const end = String(slot.slot_end ?? slot.end ?? '').slice(0, 5)
        return end <= '12:00'
      })
    : rawTimeSlots

  const filteredAppointments = appointments.filter(apt => {
    const statusMatch = statusFilter === 'All' || apt.status === statusFilter
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const aptDate = new Date(apt.appointment_date || apt.date)
    aptDate.setHours(0, 0, 0, 0)
    const dateMatch =
      dateRangeFilter === 'Upcoming' ? aptDate >= today : aptDate < today
    return statusMatch && dateMatch
  })

  const canCancelAppointment = (apt) => {
    const status = String(apt.status || '')
    if (status !== 'PENDING' && status !== 'APPROVED') return false

    const apptDate = new Date(`${String(apt.appointment_date || apt.date).slice(0, 10)}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return apptDate > today
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!appointmentId) return
    const confirmed = window.confirm('Cancel this appointment? You can only cancel until the day before the appointment date.')
    if (!confirmed) return

    setSubmitError(null)
    setCancelLoadingId(appointmentId)
    try {
      await api.cancelCustomerAppointment(appointmentId)
      const apptRes = await api.getCustomerAppointments()
      setAppointments(apptRes.data || [])
    } catch (err) {
      setSubmitError(err.message || 'Failed to cancel appointment')
    } finally {
      setCancelLoadingId(null)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!purpose) errors.purpose = 'Please select a purpose'
    if (!ticketId) errors.ticketId = 'Please select a receipt'
    if (ticketId) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const hasUpcomingForSameReceipt = appointments.some((apt) => {
        const sameTicket = String(apt.ticket_id || '') === String(ticketId)
        const booked = apt.status === 'PENDING' || apt.status === 'APPROVED'
        const apptDate = new Date(`${String(apt.appointment_date || apt.date).slice(0, 10)}T00:00:00`)
        return sameTicket && booked && apptDate >= today
      })

      if (hasUpcomingForSameReceipt) {
        errors.ticketId = 'This receipt already has an upcoming appointment. You can create a new one only after that date passes.'
      }
    }
    if (!selectedBranchId) errors.branch = 'Branch could not be determined from receipt'
    if (!appointmentDate) errors.appointmentDate = 'Please select a date'
    else {
      const selectedDay = getDayOfWeek(appointmentDate)
      if (selectedDay === 0) {
        errors.appointmentDate = 'Appointments are not available on Sundays'
      }
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const minDate = tomorrow.toISOString().split('T')[0]
      if (appointmentDate < minDate) {
        errors.appointmentDate = 'Appointments cannot be scheduled for today or a past date'
      }
    }
    if (!selectedTimeSlot) errors.selectedTimeSlot = 'Please select a time slot'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setSubmitError(null)
    const [startTime, endTime] = selectedTimeSlot.split('-').map(s => s.trim())
    const ts = (t) => (t && t.split(':').length === 2 ? `${t}:00` : t || '09:00:00')
    const time_slot_start = ts(startTime)
    const time_slot_end = ts(endTime)
    try {
      await api.createCustomerAppointment({
        ticket_id: parseInt(ticketId, 10),
        purpose: purpose.toUpperCase(),
        appointment_date: appointmentDate,
        time_slot_start,
        time_slot_end
      })
      const apptRes = await api.getCustomerAppointments()
      setAppointments(apptRes.data || [])
      setShowSuccess(true)
      setPurpose('')
      setTicketId('')
      setAppointmentDate('')
      setSelectedTimeSlot('')
      setNotes('')
      setFormErrors({})
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setSubmitError(err.message || 'Failed to create appointment')
    }
  }

  const isFormValid =
    purpose &&
    ticketId &&
    selectedBranchId &&
    appointmentDate &&
    selectedTimeSlot &&
    Object.keys(validateForm()).length === 0

  return (
    <div className="min-h-screen bg-gray-100">
      <CustomerHeader />

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Appointment submitted successfully</span>
        </div>
      )}
      {submitError && (
        <div className="fixed top-20 right-6 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span className="font-semibold">{submitError}</span>
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
                    <option value="All">All</option>
                    <option value="Booked">Booked</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
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
              {loading ? (
                <p className="text-sm text-gray-600 text-center py-8">Loading appointments...</p>
              ) : filteredAppointments.length > 0 ? (
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
                        <th className="text-left py-2 px-2 font-bold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.appointment_id || apt.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-2 text-gray-900 font-semibold">{String(apt.appointment_date || apt.date).slice(0, 10)}</td>
                          <td className="py-3 px-2 text-gray-600 text-xs">{apt.time_slot || apt.timeSlot || `${String(apt.time_slot_start || '').slice(0, 5)}-${String(apt.time_slot_end || '').slice(0, 5)}`}</td>
                          <td className="py-3 px-2 text-gray-900">{apt.receipt_no || apt.receiptNo}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                apt.purpose === 'RENEW' || apt.purpose === 'Renew'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {apt.purpose}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-600 text-xs">{apt.branch_name || apt.branch}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                apt.status === 'PENDING' || apt.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-700'
                                  : apt.status === 'COMPLETED'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {getStatusLabel(apt.status)}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            {canCancelAppointment(apt) ? (
                              <button
                                type="button"
                                onClick={() => handleCancelAppointment(apt.appointment_id || apt.id)}
                                disabled={cancelLoadingId === (apt.appointment_id || apt.id)}
                                className={`rounded px-2 py-1 text-xs font-semibold ${
                                  cancelLoadingId === (apt.appointment_id || apt.id)
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                              >
                                {cancelLoadingId === (apt.appointment_id || apt.id) ? 'Cancelling...' : 'Cancel'}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
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
                        value="RENEW"
                        checked={purpose === 'RENEW'}
                        onChange={(e) => {
                          setPurpose(e.target.value)
                          setFormErrors({ ...formErrors, purpose: '' })
                        }}
                        className="w-4 h-4"
                      />
                        <span className="text-sm text-gray-700">RENEW</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="purpose"
                        value="REDEEM"
                        checked={purpose === 'REDEEM'}
                        onChange={(e) => {
                          setPurpose(e.target.value)
                          setFormErrors({ ...formErrors, purpose: '' })
                        }}
                        className="w-4 h-4"
                      />
                        <span className="text-sm text-gray-700">REDEEM</span>
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
                    Receipt <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ticketId}
                    onChange={(e) => {
                      setTicketId(e.target.value)
                      setFormErrors({ ...formErrors, ticketId: '' })
                    }}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Select receipt</option>
                    {activeReceipts.map((receipt) => (
                      <option key={receipt.ticket_id} value={receipt.ticket_id}>
                        {receipt.receipt_no} (Rs. {Number(receipt.loan_amount).toLocaleString()})
                      </option>
                    ))}
                  </select>
                  {formErrors.ticketId && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.ticketId}
                    </p>
                  )}
                </div>

                {/* Branch (from selected receipt) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={selectedBranch ? `${selectedBranch.name} (${selectedBranch.code})` : ''}
                    readOnly
                    placeholder="Select a receipt to auto-select branch"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900"
                  />
                  {selectedReceiptBranchCode && !selectedBranch && (
                    <p className="text-xs text-amber-700 mt-1">No active branch found for code {selectedReceiptBranchCode}</p>
                  )}
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
                        const nextDate = e.target.value
                        const nextDay = getDayOfWeek(nextDate)
                        setAppointmentDate(nextDate)
                        setSelectedTimeSlot('')
                        setFormErrors({
                          ...formErrors,
                          appointmentDate: nextDay === 0 ? 'Appointments are not available on Sundays' : ''
                        })
                      }}
                      min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })()}
                      className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  {formErrors.appointmentDate && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.appointmentDate}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Appointments are not available on Sundays. Saturday slots are available only up to 12:00.</p>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time Slot <span className="text-red-500">*</span>
                  </label>
                  {appointmentDate ? (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {isSunday ? (
                        <p className="col-span-2 text-sm text-red-600 py-4">Appointments are not available on Sundays.</p>
                      ) : slotsLoading ? (
                        <p className="col-span-2 text-sm text-gray-600 py-4">Loading slots...</p>
                      ) : timeSlots.length === 0 ? (
                        <p className="col-span-2 text-sm text-gray-600 py-4">No slots available for the selected date.</p>
                      ) : (
                        timeSlots.map((slot) => {
                          const used = slot.used ?? 0
                          const capacity = slot.capacity ?? 5
                          const isFull = used >= capacity
                          const isSelected = selectedTimeSlot === slot.key
                          const start = slot.slot_start ?? slot.start
                          const end = slot.slot_end ?? slot.end

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
                                {start} - {end}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  isFull ? 'text-red-600 font-bold' : 'text-gray-600'
                                }`}
                              >
                                {isFull ? 'Full' : `${used}/${capacity}`}
                              </p>
                            </button>
                          )
                        })
                      )}
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
