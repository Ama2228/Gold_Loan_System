import { useState, useEffect, useCallback } from 'react'
import { Calendar, Clock, Search, Filter, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import api from '../../services/api'

function getStatusColor(status) {
  switch (status) {
    case 'PENDING':
    case 'APPROVED': return 'bg-green-100 text-green-800'
    case 'COMPLETED': return 'bg-blue-100 text-blue-800'
    case 'CANCELLED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStatusLabel(status) {
  if (status === 'PENDING' || status === 'APPROVED') return 'Booked'
  if (status === 'COMPLETED') return 'Completed'
  if (status === 'CANCELLED') return 'Cancelled'
  return status || '—'
}

export default function Appointments() {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [appointments, setAppointments] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actioningId, setActioningId] = useState(null)

  const user = api.getCurrentUser()
  const isManager = user?.primaryRole === 'MANAGER'

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        date: selectedDate,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        branchId: isManager && selectedBranchId ? selectedBranchId : undefined,
        limit: 100,
      }
      const res = await api.getStaffAppointments(params)
      setAppointments(res.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load appointments')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate, selectedStatus, selectedBranchId, isManager])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const loadBranches = useCallback(async () => {
    if (!isManager) return
    try {
      const res = await api.getStaffAppointmentBranches()
      setBranches(res.data || [])
    } catch (_) {
      setBranches([])
    }
  }, [isManager])

  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  const handleAction = async (appointmentId, action) => {
    setActioningId(appointmentId)
    try {
      await api.updateStaffAppointmentStatus(appointmentId, { action })
      await loadAppointments()
    } catch (err) {
      setError(err.message || `Failed to ${action.toLowerCase()} appointment`)
    } finally {
      setActioningId(null)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Appointment List</h1>
        <p className="mt-2 text-gray-600">View and manage customer appointments</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="BOOKED">Booked</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Branch Filter (Managers only) */}
          {isManager && branches.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Search className="h-4 w-4" />
          <span>
            Showing {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} for{' '}
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
          </div>
        ) : appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b-2 border-yellow-500">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Receipt No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((apt, index) => (
                  <tr key={apt.appointment_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-900">{apt.time_slot || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{apt.customer_name || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{apt.phone || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{apt.receipt_no || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          apt.purpose === 'RENEW' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {apt.purpose}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{apt.branch_name || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(apt.status)}`}
                      >
                        {getStatusLabel(apt.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2 flex-wrap">
                        {(apt.status === 'PENDING' || apt.status === 'APPROVED') && (
                          <>
                            <button
                              onClick={() => handleAction(apt.appointment_id, 'COMPLETE')}
                              disabled={actioningId === apt.appointment_id}
                              className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              {actioningId === apt.appointment_id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              Complete
                            </button>
                            <button
                              onClick={() => handleAction(apt.appointment_id, 'CANCEL')}
                              disabled={actioningId === apt.appointment_id}
                              className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              {actioningId === apt.appointment_id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              Cancel
                            </button>
                          </>
                        )}
                        {(apt.status === 'COMPLETED' || apt.status === 'CANCELLED') && (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900">No appointments found</p>
            <p className="text-sm text-gray-600 mt-2">
              No appointments scheduled for the selected date and filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
