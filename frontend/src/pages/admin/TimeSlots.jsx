import { useState, useEffect } from 'react'
import { AlertCircle, Loader, Clock, Edit2, CheckCircle, XCircle } from 'lucide-react'
import apiService from '../../services/api'

export default function TimeSlots() {
  const userRole = sessionStorage.getItem('userRole')
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Edit capacity modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [editCapacity, setEditCapacity] = useState('')
  const [capacityError, setCapacityError] = useState('')
  const [saving, setSaving] = useState(false)

  // Toggle confirmation
  const [showToggleConfirm, setShowToggleConfirm] = useState(false)
  const [slotToToggle, setSlotToToggle] = useState(null)
  const [toggling, setToggling] = useState(false)

  // Role guard
  if (userRole !== 'ADMIN') {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-red-700">This page is restricted to administrators only.</p>
      </div>
    )
  }

  // Fetch slots on mount
  useEffect(() => {
    fetchSlots()
  }, [])

  // Auto-dismiss success/error messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Fetch time slots from API
  const fetchSlots = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.request('/admin/time-slots', {
        method: 'GET'
      })

      if (response.success) {
        const normalizedSlots = (response.data || []).map((slot) => ({
          ...slot,
          start_time: slot.start_time ?? slot.slot_start ?? slot.start ?? null,
          end_time: slot.end_time ?? slot.slot_end ?? slot.end ?? null
        }))
        setSlots(normalizedSlots)
      } else {
        setError(response.message || 'Failed to load time slots')
      }
    } catch (err) {
      console.error('Error fetching time slots:', err)
      setError(err.message || 'An error occurred while loading time slots')
    } finally {
      setLoading(false)
    }
  }

  // Format time for display
  const formatTime = (time) => {
    if (!time) return ''
    // Assuming time is in HH:MM format, convert to 12-hour format
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Open edit capacity modal
  const handleEditCapacity = (slot) => {
    setSelectedSlot(slot)
    setEditCapacity(slot.capacity.toString())
    setCapacityError('')
    setShowEditModal(true)
  }

  // Validate capacity
  const validateCapacity = () => {
    const capacity = parseInt(editCapacity, 10)
    if (isNaN(capacity)) {
      setCapacityError('Capacity must be a number')
      return false
    }
    if (capacity < 1 || capacity > 5) {
      setCapacityError('Capacity must be between 1 and 5')
      return false
    }
    setCapacityError('')
    return true
  }

  // Save capacity
  const handleSaveCapacity = async () => {
    if (!validateCapacity()) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      const capacity = parseInt(editCapacity, 10)

      const response = await apiService.request(`/admin/time-slots/${selectedSlot.slot_id}`, {
        method: 'PUT',
        body: JSON.stringify({ capacity })
      })

      if (response.success) {
        setSuccess('Slot capacity updated successfully')
        setShowEditModal(false)
        fetchSlots()
      } else {
        if (response.message && response.message.toLowerCase().includes('not found')) {
          setError('Slot not found')
        } else {
          setError(response.message || 'Failed to update slot capacity')
        }
      }
    } catch (err) {
      console.error('Error updating capacity:', err)
      if (err.message && err.message.toLowerCase().includes('not found')) {
        setError('Slot not found')
      } else {
        setError(err.message || 'An error occurred while updating capacity')
      }
    } finally {
      setSaving(false)
    }
  }

  // Open toggle confirmation
  const handleToggleClick = (slot) => {
    setSlotToToggle(slot)
    setShowToggleConfirm(true)
  }

  // Confirm toggle
  const handleConfirmToggle = async () => {
    if (!slotToToggle) return

    try {
      setToggling(true)
      setError(null)

      const newStatus = slotToToggle.is_active === 1 || slotToToggle.is_active === true ? 0 : 1

      const response = await apiService.request(`/admin/time-slots/${slotToToggle.slot_id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: newStatus })
      })

      if (response.success) {
        setSuccess(`Time slot ${newStatus === 1 ? 'enabled' : 'disabled'} successfully`)
        setShowToggleConfirm(false)
        setSlotToToggle(null)
        fetchSlots()
      } else {
        if (response.message && response.message.toLowerCase().includes('not found')) {
          setError('Slot not found')
        } else {
          setError(response.message || 'Failed to update slot status')
        }
      }
    } catch (err) {
      console.error('Error toggling slot:', err)
      if (err.message && err.message.toLowerCase().includes('not found')) {
        setError('Slot not found')
      } else {
        setError(err.message || 'An error occurred while updating slot')
      }
    } finally {
      setToggling(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Time Slots</h1>
        <p className="text-gray-600 mt-2">Manage appointment time slots and capacity</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
          <div className="text-green-600 mt-0.5">✓</div>
          <div>
            <h3 className="font-semibold text-green-900">Success</h3>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-12 text-center">
          <Loader className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading time slots...</p>
        </div>
      ) : (
        <>
          {/* Main Card */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-yellow-600">
                Appointment Time Slots ({slots.length})
              </h2>
            </div>

            {/* Table */}
            {slots.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No time slots found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Time slots are generated by the system (09:00 AM - 02:00 PM, 30 min intervals)
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Slot Time
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Capacity
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot) => (
                      <tr
                        key={slot.slot_id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-semibold text-sm">
                            {slot.capacity} {slot.capacity === 1 ? 'person' : 'people'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              slot.is_active === 1 || slot.is_active === true
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {slot.is_active === 1 || slot.is_active === true ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditCapacity(slot)}
                              className="flex items-center gap-1 rounded px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit capacity"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit Capacity
                            </button>
                            <button
                              onClick={() => handleToggleClick(slot)}
                              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                                slot.is_active === 1 || slot.is_active === true
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={
                                slot.is_active === 1 || slot.is_active === true
                                  ? 'Disable slot'
                                  : 'Enable slot'
                              }
                            >
                              {slot.is_active === 1 || slot.is_active === true ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Capacity Modal */}
      {showEditModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Slot Capacity</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-600">Slot Time</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Capacity (1-5) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editCapacity}
                  onChange={(e) => {
                    setEditCapacity(e.target.value)
                    setCapacityError('')
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    capacityError
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {capacityError && (
                  <p className="text-red-600 text-xs mt-1">{capacityError}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of appointments for this time slot
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCapacity}
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Confirmation Dialog */}
      {showToggleConfirm && slotToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Confirm Action</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to{' '}
                <span className="font-semibold">
                  {slotToToggle.is_active === 1 || slotToToggle.is_active === true ? 'disable' : 'enable'}
                </span>{' '}
                this time slot?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-4">
                <p className="text-sm font-medium text-gray-900">
                  {formatTime(slotToToggle.start_time)} - {formatTime(slotToToggle.end_time)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowToggleConfirm(false)
                    setSlotToToggle(null)
                  }}
                  disabled={toggling}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmToggle}
                  disabled={toggling}
                  className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {toggling ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
